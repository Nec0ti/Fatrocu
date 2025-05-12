# Fatrocu v2 - Akıllı Fatura İşleme Asistanı

**Muhasebe süreçlerinizi hızlandırın ve doğruluğu en üst düzeye çıkarın. Fatrocu v2, e-Faturaları (XML), PDF'leri ve resimleri analiz ederek fatura verilerini otomatik olarak yapılandırılmış Excel formatına dönüştürür.**

---

## Genel Bakış

Fatrocu v2, mali müşavirler ve işletmeler için fatura veri girişinin zaman alan ve hataya açık sürecini otomatikleştirmek üzere **yeniden tasarlanmış** bir araçtır. Bu yeni sürüm, güvenilir bir Python backend'i ve modern bir web arayüzü üzerine kurulmuştur.

Türkiye'deki **e-Fatura (UBL-TR XML)** standartlarını doğrudan ayrıştırarak **%100'e yakın doğruluk** sağlarken, PDF ve resim formatındaki faturalar için **Google'ın gelişmiş Gemini 2.5 Pro Experimental modelinin** gücünü kullanır.

Sezgisel web arayüzü sayesinde faturalarınızı kolayca yükleyin, Fatrocu'nun akıllı analizini izleyin, çıkarılan verileri gözden geçirin ve tek tıklamayla Excel'e aktarın.

**(Not: Bu proje aktif geliştirme aşamasındadır. Mevcut sürüm temel işlevleri içerir ancak tam özellik seti henüz tamamlanmamıştır.)**

## Anahtar Özellikler (v2)

*   **🚀 Yepyeni Mimari:** Güvenlik, performans ve geliştirilebilirlik için **Python (Flask) Backend + Web (HTML/JS) Frontend** hibrit modeli.
*   **🥇 e-Fatura (UBL-TR XML) Desteği:** Yüklenen XML dosyalarını veya PDF'e gömülü XML'leri doğrudan ayrıştırarak **maksimum doğruluk** sağlar.
*   **✨ Gelişmiş PDF ve Resim Analizi:** Google Gemini 2.5 Pro experimental kullanarak PDF, PNG, JPG, JPEG gibi formatlardaki faturalardan metin okuma (OCR) ve akıllı veri çıkarma.
*   **🧠 Akıllı Veri Çıkarma:** Kritik fatura bilgilerini otomatik olarak tanımlar ve çıkarır:
    *   Fatura Numarası
    *   Fatura Tarihi
    *   Satıcı VKN/TCKN ve Ünvan
    *   Alıcı VKN/TCKN ve Ünvan (varsa)
    *   KDV Matrahı, Oranı, Tutarı
    *   Genel Toplam
*   **✔️ Arka Plan Veri Doğrulama:** Çıkarılan temel veriler üzerinde otomatik format (tarih, VKN/TCKN) ve matematiksel tutarlılık (Matrah + KDV ≈ Toplam) kontrolleri.
*   **📊 Excel'e Aktarım:** Başarıyla işlenen ve doğrulanan verileri (ana alanlar) yapılandırılmış `.xlsx` dosyası olarak kolayca dışa aktarın.
*   **🖥️ Temel Sonuç Görüntüleme Arayüzü:** Kullanıcı dostu web arayüzünde yüklenen faturaların listesi ve AI/XML tarafından çıkarılan verilerin **görüntülenmesi**.
*   **☁️ Yerel Web Erişimi:** Flask ile çalışan yerel sunucu üzerinden herhangi bir modern web tarayıcısı ile erişim.
*   **🔐 Güvenli API Anahtarı Yönetimi:** Google Gemini API anahtarı, `.env` dosyası aracılığıyla **güvenli bir şekilde backend'de** yönetilir.

## Nasıl Çalışır?

1.  **Kurulum ve Çalıştırma:** Projeyi yerel makinenize kurun ve `flask run` ile backend sunucusunu başlatın (Detaylar için 'Kurulum ve Kullanım' bölümüne bakın).
2.  **Yükleme:** Fatura dosyanızı (XML, PDF, PNG, JPG vb.) Fatrocu web arayüzüne (`http://127.0.0.1:5000`) sürükleyip bırakın veya seçin.
3.  **Akıllı İşleme (Backend):**
    *   Dosya tipi kontrol edilir (`mimetypes` kullanılır). XML ise doğrudan `lxml` ile ayrıştırılır.
    *   PDF/Resim ise güvenli bir şekilde backend'e kaydedilir ve Gemini API'sine gönderilir.
    *   Gemini metin okuma (OCR) ve yapılandırılmış veri çıkarma işlemlerini gerçekleştirir.
    *   Otomatik veri doğrulama kuralları uygulanır.
    *   İşlem sonucu (başarılı veya hatalı) JSON olarak kaydedilir.
4.  **Sonuç Görüntüleme (Frontend):** İşlem sonucu (çıkarılan veriler veya hata mesajı) kullanıcı arayüzünde gösterilir.
5.  **Aktarım:** Başarılı işlenen faturalar için "Excel'e Aktar" butonu ile `.xlsx` dosyası indirilir.

## Teknoloji Mimarisi

*   **Backend:** Python 3.x, Flask
*   **AI Model:** Google Gemini `gemini-2.5-pro-experimental` (via Google AI API)
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
*   **Veri İşleme:** Pandas, openpyxl (Excel için), lxml (XML için)
*   **Dosya Tipi Tespiti:** mimetypes (Python standard library)
*   **API İletişimi:** Google AI Python SDK

## Gereksinimler

*   **Python:** Sürüm 3.8 veya üzeri önerilir.
*   **Pip:** Python paket yöneticisi.
*   **Google Gemini API Anahtarı:** PDF/Resim formatındaki faturaları işleyebilmek için gereklidir.
    *   [Google AI Studio](https://aistudio.google.com/app/apikey) üzerinden **ücretsiz** bir anahtar edinebilirsiniz.
    *   Ücretsiz katman, (`gemini-2.5-pro-experimental` vb.) gibi belirli modeller için geçerlidir ve kullanım limitleri vardır. (Kullanmak istediğiniz modelin kota durumunu kontrol edin).
    *   API anahtarı, proje kurulumunda `.env` dosyasına eklenecektir.

## Kurulum ve Kullanım (Yerel Makine)

1.  **Projeyi Klonlayın/İndirin:**
    ```bash
    git clone https://github.com/Nec0ti/Fatrocu.git
    cd Fatrocu
    ```
2.  **Backend Klasörüne Gidin:**
    ```bash
    cd backend
    ```
3.  **Sanal Ortam Oluşturun ve Aktive Edin:**
    *   Windows:
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    *   macOS/Linux:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
4.  **Gerekli Kütüphaneleri Kurun:**
    ```bash
    pip install -r requirements.txt
    ```
5.  **API Anahtarını Ayarlayın:**
    *   `backend` klasörü içinde `.env` adında bir dosya oluşturun.
    *   Dosyanın içine aşağıdaki satırı ekleyin ve `YOUR_GEMINI_API_KEY_HERE` kısmını kendi API anahtarınızla değiştirin:
        ```
        GOOGLE_API_KEY="YOUR_GEMINI_API_KEY_HERE"
        ```
6.  **Uygulamayı Başlatın:**
    ```bash
    flask run
    ```
    *   Uygulama genellikle `http://127.0.0.1:5000` adresinde çalışmaya başlayacaktır.
7.  **Kullanım:**
    *   Web tarayıcınızdan `http://127.0.0.1:5000` adresini açın.
    *   "Dosya Seç veya Sürükle Bırak" alanını kullanarak fatura dosyalarınızı (XML, PDF, PNG, JPG vb.) yükleyin.
    *   "Yükle ve İşle" butonuna tıklayın.
    *   "İşlem Sonucu" bölümünde çıkarılan verileri veya hata mesajını görün.
    *   "Son İşlenen Dosyalar" listesinden önceki işlemlerin sonuçlarını tekrar görebilir veya Excel olarak indirebilirsiniz.

## Doğruluk Üzerine Not

Fatrocu v2, e-Faturalar için çok yüksek doğruluk hedefler. PDF/Resim formatları için kullanılan Gemini modelleri güçlü olsa da, fatura kalitesi, düzeni ve karmaşıklığına bağlı olarak %100 doğruluk garanti edilemez. Bu sürümün amacı, veri girişini **önemli ölçüde hızlandırmak** ve kullanıcıya **hızlı bir kontrol** imkanı sunmaktır. Gelecek sürümlerde eklenecek etkileşimli doğrulama arayüzü bu süreci daha da iyileştirecektir.

## Yol Haritası / Gelecek Planları

*   [ ] **Etkileşimli Doğrulama Arayüzü:** Kullanıcının arayüz üzerinden çıkarılan verileri **düzenlemesi ve onaylaması**. (Yüksek Öncelik)
*   [ ] **Fatura Görseli Entegrasyonu:** Doğrulama ekranında fatura görselini (PDF/Resim) gösterme.
*   [ ] **Gelişmiş Veri Çıkarma:** Ürün/Hizmet kalemleri, para birimi, ödeme vadesi, IBAN vb.
*   [ ] **ÖKC Fişi Optimizasyonu:** Yazar kasa fişleri için özel analiz.
*   [ ] **Fatura Görseli Üzerinde İşaretleme:** AI'ın bulduğu verinin faturadaki yerini vurgulama.
*   [ ] **Model/Prompt İyileştirme:** Farklı fatura tipleri için Gemini prompt optimizasyonu.
*   [ ] **Kullanıcı Tanımlı Alanlar:** Özel alan çıkarma talepleri.
*   [ ] **Toplu İşlem (Batch Processing):** Çoklu dosya yükleme ve işleme.
*   [ ] **Muhasebe Yazılımı Entegrasyonları:** API veya dosya formatı ile entegrasyon.
*   [ ] **Kullanıcı Yönetimi / Veritabanı:** İşlenen faturaları ve ayarları kalıcı olarak saklama.

## Katkıda Bulunma

Katkılarınız memnuniyetle karşılanır! Projeyi geliştirmeye yardımcı olmak isterseniz, lütfen repoyu forklayın, değişikliklerinizi yapın ve bir pull request gönderin. Hataları bildirmek veya yeni özellikler önermek için [GitHub Issues](https://github.com/Nec0ti/Fatrocu/issues) sayfasını kullanmaktan çekinmeyin.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için `LICENSE` dosyasına bakın.

---
