use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ─── Processing & Review Status ───────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum FileProcessingStatus {
    Idle,
    Queued,
    Processing,
    Success,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum ReviewStatus {
    Pending,
    Reviewed,
}

// ─── Data Primitives ──────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GroundedPoint {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GroundedValue {
    pub value: Option<String>,
    pub bounding_poly: Option<Vec<GroundedPoint>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldConfig {
    pub key: String,
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InvoiceConfig {
    pub id: String,
    pub name: String,
    pub is_predefined: bool,
    pub fields: Vec<FieldConfig>,
    pub line_item_fields: Option<Vec<FieldConfig>>,
}

pub type ExtractedInvoiceFields = HashMap<String, GroundedValue>;
pub type LineItem = HashMap<String, GroundedValue>;

// ─── Processed Invoice ────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessedInvoice {
    pub id: String,
    pub file_name: String,
    pub file_type: String,
    pub file_path: Option<String>,
    pub preview_image_base64: Option<String>,
    pub status: FileProcessingStatus,
    pub review_status: Option<ReviewStatus>,
    pub extracted_data: Option<ExtractedInvoiceFields>,
    pub line_items: Option<Vec<LineItem>>,
    pub error_message: Option<String>,
    pub config_id: String,
    pub custom_fields: Option<Vec<FieldConfig>>,
    pub custom_line_item_fields: Option<Vec<FieldConfig>>,
    pub raw_ocr: Option<String>,
    pub raw_markdown: Option<String>,
    /// Which model was used for extraction
    pub model_used: Option<String>,
    pub created_at: Option<String>,
}

// ─── App Settings — v3.1: Single Moondream Model ─────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    /// Moondream 3.1-9B-A2B model path (GGUF format)
    /// Supports: Qwen/Qwen2.5-VL-7B-Instruct (Moondream 3.1-9B-A2B)
    pub model_path: String,

    /// Number of threads for inference
    pub threads: u32,

    /// Number of GPU layers to offload (0 = CPU only)
    pub gpu_layers: u32,

    /// Whether to save processed image files
    pub save_processed_files: bool,

    /// Default export format
    pub default_export_format: String, // "xlsx" | "csv"
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

// ─── Engine / Model Status ────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelStatus {
    pub online: bool,
    pub model_name: String,
    pub model_loaded: bool,
    pub device: String,
    pub message: String,
}

// ─── Download Progress ────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadProgress {
    pub model_id: String,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub percent: f32,
    pub done: bool,
    pub error: Option<String>,
}
