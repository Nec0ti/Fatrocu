# Fatrocu

Fatrocu is a fully local, privacy‑preserving invoice processing system consisting of a desktop GUI, a command‑line tool, and a lightweight HTTP server. All components use the Moondream 3.1‑9B‑A2B model and run entirely on the host machine.

## Components

- **Desktop application** – Windows, macOS, Linux GUI for interactive processing.
- **CLI tool** – Command‑line interface for automation and scripting.
- **Server** – HTTP service exposing a  endpoint for remote integration.

## Features

- Process PDF and image invoices locally.
- Export results to Excel or CSV.
- No data leaves the computer.
- Single model architecture (Moondream 3.1‑9B‑A2B).

## Installation


> fatrocu-desktop@3.1.0 tauri
> tauri build


> fatrocu-desktop@3.1.0 build
> tsc && vite build

src/App.tsx(11,73): error TS2305: Module '"./types"' has no exported member 'GemmaVariant'.
src/App.tsx(20,3): error TS2353: Object literal may only specify known properties, and 'threads' does not exist in type 'AppSettings'.
src/App.tsx(180,9): error TS2322: Type '{ currentPage: any; setCurrentPage: (p: Page) => void; pendingCount: number; approvedCount: number; modelStatus: ModelStatus | null; modelName: string; }' is not assignable to type 'IntrinsicAttributes & HeaderProps'.
  Property 'modelName' does not exist on type 'IntrinsicAttributes & HeaderProps'.
src/components/Header.tsx(106,28): error TS2538: Type 'undefined' cannot be used as an index type.
src/pages/SettingsPage.tsx(2,64): error TS2305: Module '"../types"' has no exported member 'GemmaVariant'.
src/services/tauriService.ts(14,3): error TS2305: Module '"../types"' has no exported member 'GemmaVariant'.
src/types.ts(71,7): error TS2304: Cannot find name 'GemmaVariant'.
src/types.ts(92,3): error TS2300: Duplicate identifier 'extractionModelId'.
src/types.ts(92,3): error TS2687: All declarations of 'extractionModelId' must have identical modifiers.
src/types.ts(101,3): error TS2300: Duplicate identifier 'extractionModelId'.
src/types.ts(101,3): error TS2687: All declarations of 'extractionModelId' must have identical modifiers.
src/types.ts(101,3): error TS2717: Subsequent property declarations must have the same type.  Property 'extractionModelId' must be of type 'ModelVariant', but here has type 'ModelVariant | undefined'.

## Documentation

Full documentation is available at https://nec0ti.github.io/Fatrocu.

