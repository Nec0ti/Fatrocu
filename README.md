
# 🤖 Fatrocu v2 - Akıllı Fatura İşleme Asistanı

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Google-Gemini_API-blueviolet?style=for-the-badge&logo=google-gemini" alt="Gemini API" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-cyan?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</div>

**Fatrocu v2, faturalarınızı (XML, PDF, Resim) akıllıca işleyen, verileri Google Gemini AI ile çıkaran ve düzenli bir şekilde dışa aktarmanızı sağlayan modern bir web uygulamasıdır.**

---

### 🎬 Uygulama Demosu
*(Bu alana uygulamanın işleyişini gösteren bir GIF eklenebilir)*

![Fatrocu v2 Demo GIF](https://user-images.githubusercontent.com/10292857/191752077-b8471c2b-e14f-442a-a20c-87d77051f62c.gif)


## ✨ Temel Özellikler

-   📄 **Çoklu Dosya Desteği:** PDF, XML, PNG, ve JPEG gibi yaygın fatura formatlarını sorunsuzca işler.
-   🧠 **Yapay Zeka Destekli Veri Çıkarma:** Google Gemini API'sinin gücüyle faturalardan temel bilgileri (Fatura No, Tarih, Taraflar, Tutarlar, Fatura Türü vb.) otomatik olarak çıkarır.
-   🎨 **Etkileşimli Veri Doğrulama:** AI tarafından çıkarılan verileri, faturanın canlı önizlemesiyle yan yana kontrol etme ve düzenleme imkanı sunar. Alana tıkladığınızda faturadaki konumu anında vurgulanır.
-   📤 **Tek Tıkla CSV Aktarımı:** Onayladığınız tüm fatura verilerini, tek bir tıklamayla düzenli ve standart bir CSV dosyası olarak indirin.
-   ⏳ **Akıllı API Kuyruk Sistemi:** Yoğun API kullanımı durumunda (rate limit), uygulama otomatik olarak duraklar, 60 saniye bekler ve kaldığı yerden devam eder. Bu, çok sayıda faturanın sorunsuzca işlenmesini sağlar.
-   💾 **Kalıcı Oturum:** Tarayıcının `localStorage` özelliği sayesinde, işlediğiniz faturalar siz sekmeyi kapatsanız veya sayfayı yenileseniz bile kaybolmaz.
-   💅 **Modern ve Duyarlı Arayüz:** Karanlık tema ve Tailwind CSS ile geliştirilmiş şık, sezgisel ve kullanışlı bir tasarıma sahiptir.

## 🚀 İş Akışı (Workflow)

1.  **Yükleme:** Dosyalarınızı sürükleyip bırakın veya seçin.
2.  **İşleme:** Sistem dosyaları sıraya alır ve Gemini AI aracılığıyla verileri otomatik olarak çıkarır.
3.  **Kontrol:** "Kontrol & Dışa Aktar" ekranında, çıkarılan verileri faturanın önizlemesiyle karşılaştırın, düzenleyin ve onaylayın.
4.  **Yönetim:** Onaylanmış faturaları "Onaylananlar" sekmesinde görüntüleyin, gerekirse silin veya kontrole geri alın.
5.  **Dışa Aktarma:** Onayladığınız tüm verileri tek bir tuşla `YYYY-AA-GG_onaylanan_faturalar.csv` formatında indirin.

## 🛠️ Teknoloji Stack'i

-   **Frontend:** React 19, TypeScript
-   **Yapay Zeka:** Google Gemini API (`@google/genai`)
-   **Styling:** Tailwind CSS
-   **Modül Yönetimi:** ES Modules (ESM) via `esm.sh`
-   **Veri Saklama:** Tarayıcı `localStorage` API

## ⚙️ Kurulum ve Çalıştırma

Bu uygulama, tüm bağımlılıkların bir web tabanlı geliştirme ortamı tarafından otomatik olarak sağlandığı bir platformda çalışacak şekilde tasarlanmıştır.

Yerel bir makinede çalıştırmak için temel adımlar şunlardır:

1.  **API Anahtarını Ayarlama:**
    Uygulamanın Google Gemini API'si ile iletişim kurabilmesi için geçerli bir API anahtarına ihtiyacı vardır. Bu anahtarın bir ortam değişkeni (environment variable) olarak ayarlanması gerekmektedir. Proje kök dizininde `.env` dosyası oluşturup içine ekleyin:
    ```bash
    API_KEY="YOUR_GEMINI_API_KEY"
    ```
    > **Not:** Uygulama, `process.env.API_KEY` üzerinden bu anahtara erişir.

2.  **Bağımlılıklar:**
    Proje `package.json` dosyası içermediğinden, bağımlılıklar `index.html` içerisindeki `importmap` aracılığıyla CDN (`esm.sh`) üzerinden dinamik olarak çekilir. Ek bir `npm install` adımına gerek yoktur.

3.  **Uygulamayı Başlatma:**
    `index.html` dosyasını sunacak basit bir yerel sunucu (örneğin, VS Code **Live Server** eklentisi veya `npx serve`) çalıştırın.

## 📂 Proje Yapısı

```
.
├── index.html              # Ana HTML dosyası, importmap ve başlangıç noktası
├── index.tsx               # React uygulamasının root render dosyası
├── App.tsx                 # Ana uygulama bileşeni (state yönetimi, yönlendirme)
├── README.md               # Proje tanıtım dosyası
├── types.ts                # TypeScript arayüzleri ve enum'ları (Invoice, Status vb.)
├── utils.ts                # Yardımcı fonksiyonlar (base64 dönüştürme, URL oluşturma)
├── services/
│   └── apiService.ts       # Gemini API çağrıları ve CSV dışa aktarma mantığı
└── components/
    ├── Header.tsx          # Sayfa başlığı ve ana navigasyon
    ├── FileUploadArea.tsx  # Dosya yükleme bileşeni
    ├── CheckView.tsx       # Veri kontrol ve düzenleme ekranı
    ├── ReviewedView.tsx    # Onaylanmış faturaların listelendiği ekran
    ├── ProcessedInvoiceCard.tsx # Tek bir faturanın durumunu gösteren kart
    ├── ConfirmationModal.tsx # Silme/geri alma işlemleri için onay penceresi
    ├── AlertMessage.tsx    # Başarı/hata bildirimleri
    └── Spinner.tsx         # Yüklenme animasyonu
```

## 🔮 Gelecek Planları (Roadmap)

-   [ ] **Gelişmiş Arama ve Filtreleme:** Faturaları tarihe, tutara veya satıcıya göre arama.
-   [ ] **Farklı Dışa Aktarma Formatları:** Excel (.xlsx) veya JSON olarak dışa aktarma seçeneği.
-   [ ] **Kullanıcı Hesapları:** Çoklu kullanıcı desteği ve kişisel fatura yönetimi.
-   [ ] **Dashboard:** Toplam tutarlar, en sık işlem yapılan satıcılar gibi istatistiksel verilerin görselleştirildiği bir ana sayfa.
-   [ ] **Testler:** Uygulama kararlılığını artırmak için birim ve entegrasyon testleri eklemek.

---
*Bu proje, fatura işleme süreçlerini otomatize etmek ve basitleştirmek için tasarlanmıştır.*
