# Fatrocu v2 - Akıllı Fatura İşleme Asistanı

**Muhasebe süreçlerinizi hızlandırın ve doğruluğu en üst düzeye çıkarın. Fatrocu v2, e-Faturaları (XML), PDF'leri ve resimleri analiz ederek fatura verilerini otomatik olarak yapılandırılmış Excel formatına dönüştürür.**

---

## Genel Bakış

Fatrocu v2, mali müşavirler ve işletmeler için fatura veri girişinin zaman alan ve hataya açık sürecini otomatikleştirmek üzere **yeniden tasarlanmış** bir araçtır. Bu yeni sürüm, güvenilir bir Python backend'i ve modern bir web arayüzü üzerine kurulmuştur.

Türkiye'deki **e-Fatura (UBL-TR XML)** standartlarını doğrudan ayrıştırarak **%100'e yakın doğruluk** sağlarken, PDF ve resim formatındaki faturalar için **Google'ın gelişmiş Gemini 2.5 Pro modelinin** gücünü kullanır.

Sezgisel web arayüzü sayesinde faturalarınızı kolayca yükleyin, Fatrocu'nun akıllı analizini izleyin, çıkarılan verileri gözden geçirin ve tek tıklamayla Excel'e aktarın.

**(Not: Bu proje aktif geliştirme aşamasındadır. Mevcut sürüm temel işlevleri içerir ancak tam özellik seti henüz tamamlanmamıştır.)**

## Anahtar Özellikler (v2)

*   **🚀 Yepyeni Mimari:** Güvenlik, performans ve geliştirilebilirlik için **Python (Flask) Backend + Web (HTML/JS) Frontend** hibrit modeli.
*   **🥇 e-Fatura (UBL-TR XML) Desteği:** Yüklenen XML dosyalarını veya PDF'e gömülü XML'leri doğrudan ayrıştırarak **maksimum doğruluk** sağlar.
*   **✨ Gelişmiş PDF ve Resim Analizi:** Google Gemini 2.5 Pro kullanarak PDF, PNG, JPG, JPEG gibi formatlardaki faturalardan metin okuma (OCR) ve akıllı veri çıkarma.
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
