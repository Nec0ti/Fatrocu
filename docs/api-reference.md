# Fatrocu CLI API Reference v3.1

> Comprehensive API reference for Fatrocu CLI v3.1 — ImajeV-2B-Q8_0 engine.

## Table of Contents

- [Process Command](#process)
- [Models Management](#models)
- [Export Command](#export)
- [List Command](#list)
- [Status Command](#status)
- [Environment Variables](#environment-variables)
- [Output Format](#output-format)

---

## Process

Process a PDF or image file using ImajeV-2B-Q8_0 model.

### Synopsis

```bash
fatrocu process [OPTIONS]
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|----------|
| `--image` | `-i` | Input file path (PDF, PNG, JPG, TIFF, BMP) | required |
| `--model` | `-m` | Model name | `ImajeV-2B-Q8_0` |
| `--model-path` | `-p` | Custom model file path | auto-detected |
| `--output` | `-o` | Output JSON file path | `result.json` |
| `--temp` | — | Sampling temperature | `0.2` |
| `--n-predict` | — | Max prediction tokens | `2048` |
| `--threads` | `-t` | Number of threads | `4` |
| `--gpu-layers` | — | GPU offload layers (0 = CPU only) | `0` |
| `--prompt` | — | Custom prompt | default extraction prompt |
| `--system-prompt` | — | Custom system prompt | default system prompt |

### Examples

**Basic usage:**

```bash
fatrocu process -i invoice.pdf --model ImajeV-2B-Q8_0
```

**Custom output path:**

```bash
fatrocu process -i "C:/Documents/Invoice_2024_001.pdf" \
    --model ImajeV-2B-Q8_0 \
    --output "C:/Invoices/extracted/result.json"
```

**GPU acceleration:**

```bash
fatrocu process -i invoice.pdf --model ImajeV-2B-Q8_0 \
    --gpu-layers 32 --threads 8
```

**Custom temperature:**

```bash
fatrocu process -i invoice.pdf --model ImajeV-2B-Q8_0 --temp 0.5
```

### Output Format

The output is a JSON file with the following structure:

```json
{
  "id": "uuid-4-...",
  "file_name": "Invoice_2024_001.pdf",
  "file_type": "pdf",
  "status": "success",
  "fields": {
    "cari_unvan": "ABC İŞLETMELERİ A.Ş.",
    "cari_vergi_no": "1234567890",
    "fatura_no": "DF02026000018498",
    "fatura_tarihi": "15.01.2024",
    "ettn_uuid": "550e8400-e29b-41d4-a716-446655440000",
    "mal_hizmet_toplam_matrah": { "value": 15208.33, "detected": true },
    "kdv_orani": { "value": 20, "detected": true },
    "kdv_tutari": { "value": 3041.67, "detected": true },
    "genel_toplam": { "value": 18250.00, "detected": true }
  },
  "line_items": [
    {
      "row": 1,
      "cells": {
        "urun_adi": "Hizmet A",
        "miktar": 1,
        "birim_fiyat": "15208.33",
        "toplam": "15208.33"
      }
    }
  ],
  "raw_markdown": "...",
  "model_used": "ImajeV-2B-Q8_0",
  "processing_time_ms": 1247,
  "tokens_generated": 2048,
  "prompt_tokens": 256,
  "created_at": "2024-01-15T14:32:18.456Z"
}
```

### Error Handling

| Error Code | Code | Description |
|------------|------|-------------|
| `0` | `0` | Success |
| `1` | `1` | Image/PDF file not found |
| `2` | `2` | Model file not found |
| `3` | `3` | llama-cli not found in PATH |
| `4` | `4` | JSON parsing failed |
| `5` | `5` | Model execution failed |

---

## Models Management

Manage ImajeV-2B-Q8_0 and other models.

### Synopsis

```bash
fatrocu models [OPTIONS] <COMMAND>
```

### Download

Download a model from HuggingFace or any URL.

```bash
fatrocu models download [OPTIONS] <MODEL>
```

#### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--name` | `-n` | Model name (e.g., `ImajeV-2B-Q8_0`) |
| `--output` | `-o` | Output path (defaults to `~/.local/share/Fatrocu/models/`) |
| `--url` | `-u` | Custom download URL |

#### Examples

```bash
# Download ImajeV-2B-Q8_0
fatrocu models download ImajeV-2B-Q8_0

# Download with custom output path
fatrocu models download ImajeV-2B-Q8_0 -o "C:/models/imajeV.gguf"

# Download from custom URL
fatrocu models download Gemma-4-E4B -u "https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF/resolve/main/gemma-4-E4B-it-Q4_K_M.gguf"
```

### Remove

Remove a downloaded model.

```bash
fatrocu models remove [OPTIONS] <MODEL>
```

#### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--name` | `-n` | Model name to remove |
| `--force` | `-f` | Force remove without confirmation |

#### Examples

```bash
# Remove a model
fatrocu models remove ImajeV-2B-Q8_0

# Force remove
fatrocu models remove ImajeV-2B-Q8_0 -f
```

### List

List all installed models.

```bash
fatrocu models list
```

#### Output

```
=== Available Models ===

★ ImajeV-2B-Q8_0 — Qwen/Qwen2.5-VL-7B-Instruct (2B params, Q8_0 quantized)
   Path: C:/Users/USER/AppData/Roaming/Fatrocu/models/Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf
   Size: 6.98 GB
   Added: 2024-01-15 14:32:18

• Gemma-4-E4B-it-Q4_K_M — unsloth/gemma-4-E4B-it-GGUF
   Path: C:/Users/USER/AppData/Roaming/Fatrocu/models/gemma-4-E4B-it-Q4_K_M.gguf
   Size: 4.73 GB
   Added: 2024-01-10 09:15:42
```

### Import

Import a model from a local path.

```bash
fatrocu models import [OPTIONS] <SOURCE>
```

#### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--source` | `-s` | Source file path |
| `--dest` | `-d` | Destination path |

#### Examples

```bash
# Import from current directory
fatrocu models import ./custom-model.gguf

# Import with custom destination
fatrocu models import /mnt/data/model.gguf -d "C:/models/my-model.gguf"
```

---

## Export

Export processed invoices to Excel or CSV.

### Synopsis

```bash
fatrocu export [OPTIONS]
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|----------|
| `--format` | `-f` | Output format (`xlsx`, `csv`, `json`) | `xlsx` |
| `--output` | `-o` | Output file path | `Fatrocu_Raporu.xlsx` |
| `--status` | — | Filter by status (e.g., `reviewed`) | all |

### Examples

```bash
# Export to Excel
fatrocu export --format xlsx --output "Fatrocu_Raporu.xlsx"

# Export to CSV
fatrocu export --format csv --output "report.csv"

# Filter by status
fatrocu export --format xlsx --status reviewed
```

### Excel Output Structure

| Sheet | Description |
|-------|-------------|
| `Summary` | Overview: file name, model used, status, date, fatura no, toplam |
| `LineItems` | Detailed line items per invoice |
| `Raw` | Raw OCR markdown output |

---

## List

List processed invoices.

```bash
fatrocu list [OPTIONS]
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--format` | `-f` | Output format (`table`, `json`, `raw`) | `table` |
| `--limit` | — | Max results to show | — |

### Examples

```bash
# List as table
fatrocu list

# List as JSON
fatrocu list --format json

# Limit to 10 results
fatrocu list --limit 10
```

---

## Status

Show engine status.

```bash
fatrocu status
```

### Output

```
=== Fatrocu Engine Status ===

  Online: ✓
  Model: ImajeV-2B-Q8_0
  Device: CPU
  Threads: 4
  GPU Layers: 0
  Message: Ready
  Version: v3.1.0

  Model Path: ✓ C:/Users/USER/AppData/Roaming/Fatrocu/models/Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `FATROCU_MODEL_PATH` | Custom model path | `~/.local/share/Fatrocu/models/` |
| `FATROCU_THREADS` | Default thread count | `4` |
| `FATROCU_TEMP` | Default temperature | `0.2` |
| `FATROCU_N_PREDICT` | Default n-predict | `2048` |
| `PATH` | Must contain `llama-cli.exe` | — |

---

## Supported Models

| Model | Params | Quant | Size | Speed (CPU) | Speed (GPU RTX 4090) |
|-------|--------|-------|------|--------------|----------------------|
| ImajeV-2B-Q8_0 | 2B | Q8_0 | ~6.98 GB | ~55 tok/s | ~280 tok/s |
| Gemma-4-E4B-it | 4.1B | Q4_K_M | ~4.73 GB | ~42 tok/s | ~210 tok/s |
| Gemma-4-E2B-it | 2.2B | Q4_K_M | ~2.78 GB | ~38 tok/s | ~190 tok/s |

---

## License

MIT License — See [../LICENSE](../LICENSE)
