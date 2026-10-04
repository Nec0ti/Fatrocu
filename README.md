# ✦ FATROCU v3.1

<div align="center">

```
            ('-.     .-') _   _  .-')                                      
           ( OO ).-.(  OO) ) ( \( -O )                                     
   ,------./ . --. //     .-'.'------.  .-'),-----.    .-----. ,--. ,--.   
('-| _.---'| \-.  \ |'--...__)|   /`. '( OO'  .-.  '  '  .--./ |  | |  |   
(OO|(_\  .-'-'  |  |'--.  .--'|  /  | |/   |  | |  |  |  |('-. |  | | .-') 
/  |  '--.\| |_.'  |   |  |   |  |_.' |\_) |  |\|  | /_) |OO  )|  |_|( OO )
\_)|  .--' |  .-.  |   |  |   |  .  '.'  \ |  | |  | ||  |`-'| |  | | `-' /
  \|  |_)  |  | |  |   |  |   |  |\  \    `'  '-'  '(_'  '--'\('  '-'(_.-' 
   `--'    `--' `--'   `--'   `--' '--'     `-----'    `-----'  `-----'    

     ★  AKILLI FATURA İŞLEME SİSTEMİ ★
```

[![Release](https://img.shields.io/github/v/release/Nec0ti/Fatrocu?style=for-the-badge&color=000000&labelColor=ffffff&label=v3.1)](https://github.com/Nec0ti/Fatrocu/releases)
[![Platform](https://img.shields.io/badge/Windows-x64-000000?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/Nec0ti/Fatrocu/releases)
[![Rust](https://img.shields.io/badge/Rust-Tauri_2.0-000000?style=for-the-badge&logo=rust&logoColor=white)](https://tauri.app)
[![License](https://img.shields.io/badge/License-MIT-000000?style=for-the-badge)](LICENSE)
[![Docs](https://img.shields.io/badge/Docs-GitHub_Pages-000000?style=for-the-badge)](https://nec0ti.github.io/Fatrocu)

**%100 yerel · Bulut yok · API maliyeti yok · Veri gizliliği tam**

[📦 İndir](https://github.com/Nec0ti/Fatrocu/releases) · [📚 Dokümantasyon](https://nec0ti.github.io/Fatrocu) · [🐛 Hata Bildir](https://github.com/Nec0ti/Fatrocu/issues)

</div>

---

## ✦ v3.1 Yeni Özellikleri

### 🔥 Moondream 3.1-9B-A2B Tek Model

Fatrocu v3.1 artık tek bir AI modeli kullanır: **Moondream 3.1-9B-A2B** (Qwen/Qwen2.5-VL-7B-Instruct tabanlı).

| Özellik | v3.0 | v3.1 |
|---------|------|------|
| AI Modeli | DeepSeek-OCR + Gemma 4 | **Moondream 3.1-9B-A2B** (tek model) |
| Model sayısı | 2 | **1** |
| Toplam boyut | ~24 GB | **~7 GB** |
| Pipeline adımları | 2 (OCR + Extraction) | **1 (unified)** |
| RAM kullanımı | Yüksek | **Daha düşük** |
| Hız | Orta | **Daha hızlı** |

### 📦 fatrocu-cli

Artık CLI aracı da var! Terminalden de çalıştırabilirsiniz:

```bash
# Model indir
fatrocu models --download "Moondream 3.1-9B-A2B"

# Fatura işle
fatrocu process --model "Moondream 3.1-9B-A2B" --image "fatura.pdf"

# Durum kontrol
fatrocu status

# Modelleri listele
fatrocu models --list
```

**CLI için**: [fatrocu-cli](https://github.com/Nec0ti/Fatrocu/tree/main/fatrocu-cli) dizinini inceleyin.

---

## ✦ Nedir?

**Fatrocu**, faturalarınızı yapay zeka ile otomatik olarak işleyen, tamamen yerel çalışan bir Windows masaüstü uygulamasıdır.

- **PDF ve görüntü faturalarını** okur
- **Tüm alanları otomatik çıkarır** (fatura no, tarih, VKN, KDV, toplam tutar…)
- **Excel ve CSV** olarak dışa aktarır
- **Hiçbir veri** internete gitmez — her şey bilgisayarınızda kalır

```
┌─────────────────────────────────────────────────┐
│  PDF/PNG Fatura                                  │
│       ↓                                          │
│  Moondream 3.1-9B-A2B (Tek Model) ──→ JSON      │
│       ↓                                          │
│  Excel / CSV Dışa Aktarım                        │
└─────────────────────────────────────────────────┘
```

---

## ✦ Kurulum

### 1. Installer ile (Önerilen)

[**Releases sayfasından**](https://github.com/Nec0ti/Fatrocu/releases/latest) en son sürümü indirin:

| Dosya | Açıklama |
|---|---|
| `Fatrocu_3.1.0_x64-setup.exe` | NSIS kurulum sihirbazı |
| `Fatrocu_3.1.0_x64_en-US.msi` | MSI paketi |
| `fatrocu.exe` | Taşınabilir (kurulum gerektirmez) |

### 2. Model Kurulumu

Fatrocu çalışmak için **tek bir GGUF modeli** gerekir:

#### Yöntem A — Sürükle & Bırak (Kolay) ✓
1. Uygulamayı açın → **Ayarlar** sekmesine gidin
2. Model dosyasını (`*.gguf`) **"Model Sürükle-Bırak"** alanına bırakın
3. Program modeli otomatik tanır ve yapılandırır

#### Yöntem B — Klasöre Yerleştir
Model dosyasını uygulama dizinindeki `gguf/` klasörüne koyun:
```
Fatrocu/
└── gguf/
    └── Qwen2.5-VL-7B-Instruct-Q4_K_M.gguf   ← Moondream 3.1-9B-A2B
```

#### Yöntem C — CLI ile Otomatik İndir
```bash
fatrocu models --download "Moondream 3.1-9B-A2B"
```

#### Model İndirme Linkleri

| Model | Amaç | Boyut | İndirme |
|---|---|---|---|
| `Qwen/Qwen2.5-VL-7B-Instruct` | OCR + Alan Çıkarma (Tek Model) | ~7 GB | [HuggingFace →](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct) |

> **Not:** Moondream 3.1-9B-A2B, hem OCR (görselden metin) hem de yapılandırılmış alan çıkarma (field extraction) işlemini **tek bir çağrıda** yapar. Bu sayede model sayısı yarıya düşürülmüş ve uygulama daha hafif çalışır.

---

## ✦ Kullanım

```
1. Fatrocu'yu açın
2. Fatura PDF/PNG dosyalarını sürükleyin veya "Fatura Yükle" butonunu kullanın
3. Moondream 3.1-9B-A2B otomatik olarak çalışır (OCR + alan çıkarma tek adımda)
4. İnceleme ekranında alanları doğrulayın / düzenleyin
5. "Onayla" → Excel veya CSV olarak dışa aktarın
```

### Fatura Şablonları

Farklı firma formatları için şablon oluşturabilirsiniz:

1. **Ayarlar → Fatura Şablonları** sekmesine gidin
2. **"+ Yeni Şablon"** butonuna tıklayın
3. Çıkarmak istediğiniz alanları ekleyin (örn: `siparis_no`, `kdv_orani`)
4. Şablonu kaydedin
5. Fatura yüklerken şablonu seçin

---

## ✦ Derleme (Kaynak Koddan)

### Gereksinimler

| Araç | Sürüm |
|---|---|
| Rust | 1.75+ |
| Node.js | 18+ |
| Python | 3.10+ |
| CMake | 3.27+ |

```powershell
# Repoyu klonla
git clone https://github.com/Nec0ti/Fatrocu.git
cd Fatrocu

# Bağımlılıkları kur
npm install

# Geliştirme modu (hot-reload)
npm run tauri dev

# Dağıtım build (exe + MSI + NSIS)
npm run tauri build
# Çıktılar: src-tauri/target/release/bundle/
```

### fatrocu-cli (CLI Tool)

```bash
# Repoyu klonla
git clone https://github.com/Nec0ti/Fatrocu.git
cd fatrocu-cli
cargo build --release

# Kullan
cargo run -- release --help
```

#### CLI Komutları

```bash
# Model indir
cargo run -- release -- models --download "Moondream 3.1-9B-A2B"

# Fatura işle
cargo run -- release -- process --model "Moondream 3.1-9B-A2B" --image "fatura.pdf"

# Durum kontrol
cargo run -- release -- status

# CLI'dan uygulama içine model kopyala
cargo run -- release -- models --import /path/to/model.gguf
```

---

## ✦ Mimari

```
src/                    ← React + TypeScript frontend
  pages/
    UploadPage.tsx      ← Fatura yükleme ekranı
    ReviewPage.tsx      ← İnceleme ve onay ekranı
    CheckInvoicePage.tsx← Detaylı inceleme
    ApprovedPage.tsx    ← Onaylanmışlar + export
    SettingsPage.tsx    ← Model ve şablon yönetimi
  services/
    tauriService.ts     ← Rust ↔ Frontend köprüsü

src-tauri/src/         ← Rust backend
  llama_engine.rs       ← Moondream 3.1 unified pipeline
  commands.rs           ← Tauri IPC komutları
  storage.rs            ← JSON tabanlı yerel depolama
  pdf_converter.rs      ← PDF → PNG dönüştürücü
  excel_export.rs       ← Excel/CSV dışa aktarma
```

---

## ✦ Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|---|---|
| `llama-cli bulunamadı` | Ayarlar → "Motoru Tek Tıkla Kur" ya da llama.cpp'yi PATH'e ekle |
| `Model dosyası bulunamadı` | GGUF dosyasını `gguf/` klasörüne koy veya sürükle-bırak kullan |
| PDF sayfaları işlenmiyor | Python 3 yüklü olduğundan emin ol (`python --version`) |
| Yavaş işleme | Ayarlar'dan thread sayısını artır; GPU katmanı ekle (`--gpu-layers > 0`) |
| OCR hatalı sonuç | Daha yüksek kalite GGUF dosyası kullan (Q4_K_M önerilir) |
| Moondream model dosyası çok büyük (7 GB) | Yöntem A (sürükle-bırak) veya CLI ile indirin |

---

## ✦ Teknik Detaylar

### v3.0 → v3.1 Migration

Eğer v3.0'tan v3.1'e geçiyorsanız:

1. Eski DeepSeek-OCR ve Gemma 4 model dosyalarını kaldırın
2. Yeni Moondream 3.1-9B-A2B modelini indirin/kopyalayın
3. Uygulamayı yeniden başlatın

API değişikliği minimal — frontend aynı kalır, sadece backend model değişti.

### Model Formatı

| Versiyon | Model | Format | Boyut |
|---|---|---|---|
| v3.0 | DeepSeek-OCR + Gemma 4 | GGUF | ~24 GB |
| v3.1 | Moondream 3.1-9B-A2B | GGUF | ~7 GB |

---

## ✦ Lisans

MIT — Bkz: [LICENSE](LICENSE)

---

<div align="center">

**Fatrocu v3.1** · Rust + Tauri 2.0 · Moondream 3.1-9B-A2B · llama.cpp

*Made with ♥ — %100 Yerel, %100 Gizli*

[nec0ti.github.io/Fatrocu](https://nec0ti.github.io/Fatrocu)

</div>
