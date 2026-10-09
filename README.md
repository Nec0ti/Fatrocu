# Fatrocu

Fatrocu is a fully **local, privacy-preserving** Turkish invoice-processing platform. It turns PDFs and images into structured invoices (fatura numarası, tarih, cari, KDV kalemleri, genel toplam) and runs **entirely on the host machine** — no invoice data ever leaves the computer.

Fatrocu ships as three cooperating components:

| Component | Repo | Stack | Purpose |
| --- | --- | --- | --- |
| **Desktop app** | [`Fatrocu/Fatrocu`](https://github.com/Fatrocu/Fatrocu) | Tauri · React · TypeScript · Vite | Interactive Windows / macOS / Linux GUI |
| **CLI** | [`Fatrocu/fatrocu-cli`](https://github.com/Fatrocu/fatrocu-cli) | Rust | Headless automation & scripting |
| **Server** | [`Fatrocu/fatrocu-server`](https://github.com/Fatrocu/fatrocu-server) | Rust · actix-web | HTTP API for remote integration |
| **Organization** | [`Fatrocu/.github`](https://github.com/Fatrocu/.github) | — | Org profile & shared docs |

## How it works

```
invoice image / PDF
        │
   1. OCR → markdown (text layer)
        │
   2. İmajeV-2B-Q8_0 (vision LLM) extracts structured fields
        │
   3. Invoice saved locally (JSON / Excel / CSV)
```

- **Single unified model:** [`İmajeV-2B-Q8_0`](https://huggingface.co/cjhb/llama-cli-windows) (`İmajeV-2B-Q8_0.gguf`). This is the canonical model across every Fatrocu component.
- **Fully offline** once the model is downloaded — no network calls required at processing time.

## Features

- Process **PDF and image** invoices on CPU or GPU.
- Export results to **Excel (`.xlsx`)**, CSV, or JSON.
- **No data leaves the machine.** All models and files stay local.
- **Desktop GUI** with an upload → review → approved workflow.
- **CLI** for automation, and an **HTTP server** for headless / remote use.

## Requirements

- Rust (stable)
- For the desktop app additionally: Node.js 20+
- Windows, macOS, or Linux

## Install & build

### Desktop app

```bash
# install toolchain
npm install

# type-check + production build (frontend)
npm run build

# full Tauri build (bundles the app)
npm run tauri
```

### CLI

```bash
# install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# compile (debug)
cargo build

# compile (release)
cargo build --release
```

### Server

```bash
cargo build --release
# then run the binary (see fatrocu-server/README.md)
```

## Repository map

- [`Fatrocu/Fatrocu`](https://github.com/Fatrocu/Fatrocu) — desktop application (this repo)
- [`Fatrocu/fatrocu-cli`](https://github.com/Fatrocu/fatrocu-cli) — command-line tool
- [`Fatrocu/fatrocu-server`](https://github.com/Fatrocu/fatrocu-server) — HTTP API server
- [`Fatrocu/.github`](https://github.com/Fatrocu/.github) — organization profile

## License

MIT
