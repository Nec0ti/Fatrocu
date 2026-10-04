/// Fatrocu v3.1 — Moondream 3.1-9B-A2B Unified Model Engine
///
/// Replaces the two-model pipeline (DeepSeek-OCR + Gemma 4) with a single
/// Moondream 3.1-9B-A2B model that performs both OCR and field extraction
/// in a single pass.
///
/// Architecture:
///   Image/PDF (PNG bytes)
///     → Moondream 3.1-9B-A2B (Qwen/Qwen2.5-VL-7B-Instruct)
///     → Unified JSON response with fields + lineItems + raw_markdown
///
/// Benefits over v3.0:
///   - Single model instead of two → lower RAM, faster, simpler deployment
///   - Smaller model (7GB vs ~12GB for Gemma 4)
///   - Unified response format eliminates multi-step orchestration
///   - Same llama.cpp backend (llama-cli) used for both OCR and extraction

use crate::models::{AppSettings, ExtractedInvoiceFields, InvoiceConfig, LineItem, ModelStatus};
use log::{info, warn, debug};
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::{Command, Stdio};

// ─── Model Info ───────────────────────────────────────────────────────────────

pub struct ModelInfo {
    pub name: String,
    pub repo: String,
    pub filename: String,
}

/// Moondream 3.1-9B-A2B — Unified vision-language model for invoice processing
///
/// This model combines OCR and structured field extraction into a single call.
/// It returns a JSON object containing extracted fields, line items, and raw OCR text.
pub const MOONDRAM_MODEL_NAME: &str = "Moondream 3.1-9B-A2B";
pub const MOONDRAM_REPO: &str = "Qwen/Qwen2.5-VL-7B-Instruct";

pub fn model_info() -> ModelInfo {
    ModelInfo {
        name: MOONDRAM_MODEL_NAME.to_string(),
        repo: MOONDRAM_REPO.to_string(),
        filename: "Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf".to_string(),
    }
}

// ─── Engine State Check ───────────────────────────────────────────────────────

pub struct LlamaEngine;

impl LlamaEngine {
    /// Find llama-cli binary in PATH, app directory, or AppData
    fn find_llama_cli() -> Option<PathBuf> {
        let candidates = if cfg!(windows) {
            vec!["llama-cli.exe", "llama.exe", "main.exe"]
        } else {
            vec!["llama-cli", "llama", "main"]
        };

        for name in &candidates {
            if let Ok(path) = which::which(name) {
                return Some(path);
            }
        }

        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                for name in &candidates {
                    let p = exe_dir.join(name);
                    if p.exists() { return Some(p); }
                    let bin_p = exe_dir.join("bin").join(name);
                    if bin_p.exists() { return Some(bin_p); }
                }
            }
        }

        if let Some(data_dir) = dirs::data_dir() {
            let app_bin = data_dir.join("Fatrocu").join("bin");
            for name in &candidates {
                let p = app_bin.join(name);
                if p.exists() { return Some(p); }
            }
        }

        None
    }

    /// Find model file in various locations (gguf/ folder, AppData/models, etc.)
    fn find_existing_file_by_name(pattern_lower: &str) -> Option<PathBuf> {
        let mut search_dirs = Vec::new();
        search_dirs.push(PathBuf::from("gguf"));
        search_dirs.push(PathBuf::from("models"));

        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                search_dirs.push(exe_dir.join("gguf"));
                search_dirs.push(exe_dir.join("models"));
            }
        }

        if let Some(data_dir) = dirs::data_dir() {
            search_dirs.push(data_dir.join("Fatrocu").join("models"));
            search_dirs.push(data_dir.join("Fatrocu").join("gguf"));
        }

        for dir in search_dirs {
            if dir.exists() {
                if let Ok(entries) = std::fs::read_dir(&dir) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if path.is_file() {
                            let filename = path.file_name().unwrap_or_default().to_string_lossy().to_lowercase();
                            if filename.ends_with(".gguf") && filename.contains(pattern_lower) {
                                return Some(path);
                            }
                        }
                    }
                }
            }
        }

        None
    }

    /// Resolve model path from settings or auto-discover
    fn resolve_model_path(settings: &AppSettings) -> Option<PathBuf> {
        if !settings.model_path.is_empty() {
            let p = PathBuf::from(&settings.model_path);
            if p.exists() {
                return Some(p);
            }
        }

        // Auto-discover: look for any .gguf file in known locations
        if let Some(p) = Self::find_existing_file_by_name("qwen") {
            return Some(p);
        }
        if let Some(p) = Self::find_existing_file_by_name("moondream") {
            return Some(p);
        }
        if let Some(p) = Self::find_existing_file_by_name("llama") {
            return Some(p);
        }

        None
    }

    /// Check engine status
    pub fn check_engine_status() -> ModelStatus {
        let cli = Self::find_llama_cli();
        let model_path = Self::resolve_model_path(&AppSettings::default());

        let device = if AppSettings::default().gpu_layers > 0 {
            "GPU + CPU".to_string()
        } else {
            "CPU".to_string()
        };

        match (cli.is_some(), model_path.is_some()) {
            (true, true) => ModelStatus {
                online: true,
                model_name: format!("Moondream 3.1-9B-A2B ({})", model_path.as_ref().map(|p| p.display().to_string()).unwrap_or_default()),
                model_loaded: true,
                device,
                message: "Engine hazır. Pipeline çalışabilir.".to_string(),
            },
            (false, false) => ModelStatus {
                online: false,
                model_name: "Model eksik".to_string(),
                model_loaded: false,
                device,
                message: "llama-cli bulunamadı. https://github.com/ggerganov/llama.cpp/releases adresinden indirin.".to_string(),
            },
            (false, true) => ModelStatus {
                online: false,
                model_name: "Moondream 3.1-9B-A2B eksik".to_string(),
                model_loaded: false,
                device,
                message: "llama-cli hazır, ancak model dosyası bulunamadı.".to_string(),
            },
            (true, false) => ModelStatus {
                online: false,
                model_name: "Moondream 3.1-9B-A2B eksik".to_string(),
                model_loaded: false,
                device,
                message: "llama-cli hazır, ancak model dosyası bulunamadı.".to_string(),
            },
        }
    }

    // ─── STEP: Moondream 3.1-9B-A2B — Unified Pipeline ───────────────────────

    /// Run Moondream 3.1-9B-A2B to extract invoice data from an image.
    ///
    /// The model returns a single JSON response containing:
    ///   - fields: extracted invoice fields (fatura_no, tarih, vkn, etc.)
    ///   - lineItems: array of line item objects
    ///   - raw_markdown: full OCR text
    pub fn process_invoice(
        image_bytes: &[u8],
    ) -> Result<(ExtractedInvoiceFields, Vec<LineItem>, String), String> {
        let cli = Self::find_llama_cli()
            .ok_or_else(|| "llama-cli bulunamadı. PATH'e ekleyin veya Ayarlar → 'Motoru Kur' kullanın.".to_string())?;

        let model_path = Self::resolve_model_path(&AppSettings::default())
            .ok_or_else(|| "Moondream 3.1-9B-A2B model dosyası bulunamadı. Ayarlardan yol girin veya modeller klasörüne kopyalayın.".to_string())?;

        // Write image to temp file (llama.cpp expects a file path, not raw bytes for some backends)
        let tmp_img_path = std::env::temp_dir().join(format!(
            "fatrocu_moon_{}.png",
            uuid::Uuid::new_v4()
        ));
        std::fs::write(&tmp_img_path, image_bytes)
            .map_err(|e| format!("Temp dosyası yazılamadı: {}", e))?;

        let image_path_str = tmp_img_path.to_string_lossy().to_string();

        // Build the unified extraction prompt
        let prompt = Self::build_extraction_prompt()?;

        let gpu_arg = AppSettings::default().gpu_layers.to_string();
        let threads_arg = AppSettings::default().threads.to_string();

        info!("Moondream 3.1-9B-A2B başlatılıyor...");
        info!("  Model: {}", model_path.display());
        info!("  Image: {}", image_path_str);
        info!("  GPU layers: {}", gpu_arg);
        info!("  Threads: {}", threads_arg);

        let output = Command::new(&cli)
            .args([
                "--model", model_path.to_str().unwrap_or(""),
                "--image", image_path_str.as_str(),
                "--prompt", &prompt,
                "--n-predict", "2048",
                "--temp", "0.2",
                "--n-gpu-layers", &gpu_arg,
                "--threads", &threads_arg,
                "--log-disable",
                "--no-display-prompt",
            ])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .map_err(|e| format!("llama-cli çalıştırılamadı: {}", e))?;

        // Clean up temp file
        let _ = std::fs::remove_file(&tmp_img_path);

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            warn!("Moondream stderr: {}", stderr);
            return Err(format!(
                "Moondream hatası (exit={:?}): stderr={}\nstdout={}",
                output.status.code(),
                stderr,
                stdout
            ));
        }

        let raw_output = String::from_utf8_lossy(&output.stdout).to_string();
        info!("Moondream tamamlandı — {} karakter çıktı", raw_output.len());

        // Parse the JSON response
        Self::parse_unified_response(&raw_output)
    }

    /// Build the unified extraction prompt for Moondream 3.1-9B-A2B
    fn build_extraction_prompt() -> Result<String, String> {
        // Default predefined config fields
        let default_fields = vec![
            FieldConfig { key: "fatura_no".to_string(), label: "Fatura No".to_string() },
            FieldConfig { key: "fatura_tarihi".to_string(), label: "Fatura Tarihi".to_string() },
            FieldConfig { key: "vkn".to_string(), label: "VKN".to_string() },
            FieldConfig { key: "maliyet_toplam".to_string(), label: "Maliyet Toplam".to_string() },
            FieldConfig { key: "kdv_toplam".to_string(), label: "KDV Toplam".to_string() },
            FieldConfig { key: "toplam_tutar".to_string(), label: "Toplam Tutar".to_string() },
        ];

        let default_line_fields = vec![
            LineFieldConfig { key: "tanim".to_string(), label: "Tanım" },
            LineFieldConfig { key: "birim".to_string(), label: "Birim" },
            LineFieldConfig { key: "adet".to_string(), label: "Adet" },
            LineFieldConfig { key: "birim_fiyat".to_string(), label: "Birim Fiyat" },
            LineFieldConfig { key: "toplam".to_string(), label: "Toplam" },
        ];

        // Build field list
        let field_list: Vec<String> = default_fields
            .iter()
            .map(|f| format!("  - \"{}\" (key: \"{}\")", f.label, f.key))
            .collect();

        let line_fields: Vec<String> = default_line_fields
            .iter()
            .map(|f| format!("  - \"{}\" (key: \"{}\")", f.label, f.key))
            .collect();

        let has_line_items = !default_line_fields.is_empty();
        let line_items_section = if has_line_items {
            format!(
                "\nLine item columns to extract (one JSON object per row):\n{}",
                line_fields.join("\n")
            )
        } else {
            String::new()
        };

        // Structured extraction prompt
        Ok(format!(
            r#"You are a precise invoice data extraction assistant. Extract all fields from this invoice document and return ONLY a valid JSON object.

Fields to extract:
{}

Line item columns to extract (one JSON object per row):
{}

Return format:
{{
  "fields": {{
    "<key>": "<extracted value or empty string if not found>"
  }},
  "lineItems": [
    {{ "<key>": "<value>", ... }}
  ]
}}

Rules:
- Return ONLY the JSON object. No markdown fences (no ```json ... ```).
- No explanations, no commentary, no extra text.
- If a field is not found, use an empty string "".
- Monetary values: keep original format (e.g., "1.250,00" or "1250.00").
- lineItems: one object per table row. Empty array [] if no rows found.
- raw_markdown: include the full raw OCR text for reference.

Think carefully through the document structure. Look for tables, headers, and structured sections.
Format your response EXACTLY as a JSON object with no surrounding text.
"#,
            field_list.join("\n"),
            line_items_section
        ))
    }

    /// Parse the unified Moondream response into structured data
    fn parse_unified_response(raw: &str) -> Result<(ExtractedInvoiceFields, Vec<LineItem>, String), String> {
        // Find JSON block
        let start = raw.find('{').ok_or("No JSON start found")?;
        let end = raw.rfind('}').map(|i| i + 1).ok_or("No JSON end found")?;
        let json_str = &raw[start..end];

        let parsed: serde_json::Value = serde_json::from_str(json_str)
            .map_err(|e| format!("JSON parse error: {}. Ham JSON: {}", e, truncate(json_str, 500)))?;

        let mut fields: ExtractedInvoiceFields = HashMap::new();
        let mut line_items: Vec<LineItem> = Vec::new();

        if let Some(obj) = parsed.as_object() {
            // Extract fields
            let field_keys = ["fatura_no", "fatura_tarihi", "vkn", "maliyet_toplam", "kdv_toplam", "toplam_tutar"];
            for key in &field_keys {
                if let Some(val) = obj.get("fields").and_then(|v| v.as_object())
                    .and_then(|fields| fields.get(key))
                    .and_then(|v| v.as_str())
                {
                    fields.insert(
                        key.to_string(),
                        GroundedValue {
                            value: Some(val.to_string()),
                            bounding_poly: None,
                        },
                    );
                }
            }

            // Extract line items
            if let Some(items_arr) = obj.get("lineItems").and_then(|v| v.as_array()) {
                let line_field_keys: Vec<&str> = vec!["tanim", "birim", "adet", "birim_fiyat", "toplam"];

                for item in items_arr {
                    if let Some(item_obj) = item.as_object() {
                        let mut row: LineItem = HashMap::new();
                        for key in &line_field_keys {
                            let val = item_obj
                                .get(*key)
                                .and_then(|v| v.as_str())
                                .unwrap_or("")
                                .to_string();
                            row.insert(
                                key.to_string(),
                                GroundedValue {
                                    value: Some(val),
                                    bounding_poly: None,
                                },
                            );
                        }
                        if !row.is_empty() {
                            line_items.push(row);
                        }
                    }
                }
            }

            // Extract raw markdown
            if let Some(md) = obj.get("raw_markdown").and_then(|v| v.as_str()) {
                if !md.is_empty() {
                    fields.insert(
                        "raw_markdown".to_string(),
                        GroundedValue {
                            value: Some(md.to_string()),
                            bounding_poly: None,
                        },
                    );
                }
            }
        }

        info!("Moondream parsing tamamlandı: {} alan, {} satır kalemi", fields.len(), line_items.len());

        Ok((fields, line_items, raw.to_string()))
    }

    /// Helper: truncate string for error messages
    fn truncate(s: &str, max: usize) -> String {
        if s.len() <= max { s.to_string() } else { format!("{}...", &s[..max]) }
    }
}

// ─── which crate shim ─────────────────────────────────────────────────────────

mod which {
    use std::path::PathBuf;
    use std::env;

    pub fn which(name: &str) -> Result<PathBuf, ()> {
        let path_var = env::var("PATH").unwrap_or_default();
        let separator = if cfg!(windows) { ';' } else { ':' };

        for dir in path_var.split(separator) {
            let candidate = PathBuf::from(dir).join(name);
            if candidate.exists() {
                return Ok(candidate);
            }
        }
        Err(())
    }
}

// ─── Types ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldConfig {
    pub key: String,
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LineFieldConfig {
    pub key: String,
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroundedValue {
    pub value: Option<String>,
    pub bounding_poly: Option<Vec<GroundedPoint>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroundedPoint {
    pub x: f64,
    pub y: f64,
}

// ─── Serde derive for AppSettings ────────────────────────────────────────────

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AppSettings {
    pub model_path: String,
    pub threads: u32,
    pub gpu_layers: u32,
    pub save_processed_files: bool,
    pub default_export_format: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            model_path: String::new(),
            threads: 4,
            gpu_layers: 0,
            save_processed_files: true,
            default_export_format: "xlsx".to_string(),
        }
    }
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────

/// Main processing pipeline: image bytes → (fields, lineItems, raw_markdown)
pub fn run_pipeline(
    image_bytes: &[u8],
    config: &InvoiceConfig,
    settings: &AppSettings,
) -> Result<(ExtractedInvoiceFields, Vec<LineItem>, String), String> {
    info!("Pipeline başlatılıyor: config={}", config.id);

    // Moondream 3.1-9B-A2B is the unified model — single call does everything
    match LlamaEngine::process_invoice(image_bytes) {
        Ok((fields, line_items, raw_markdown)) => {
            info!("Pipeline başarılı: {} alan, {} satır çıktı", fields.len(), line_items.len());
            Ok((fields, line_items, raw_markdown))
        }
        Err(err) => {
            warn!("Pipeline hatası: {}", err);
            Err(err)
        }
    }
}
