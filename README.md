# Fatrocu v2

**Muhasebe süreçlerinizi hızlandırın ve doğruluğu en üst düzeye çıkarın. Fatrocu, e-Faturaları, PDF'leri ve resimleri analiz ederek verileri otomatik olarak yapılandırılmış Excel formatına dönüştürür.**

---

## Genel Bakış

Fatrocu, mali müşavirler ve işletmeler için fatura veri girişinin sıkıcı ve hataya açık sürecini otomatikleştirmek üzere tasarlanmıştır. Türkiye'deki e-Fatura (UBL-TR XML) standartlarını önceliklendirerek %100'e yakın doğruluk sağlarken, PDF ve resim formatındaki faturalar için Google'ın en gelişmiş AI modellerinden biri olan **Gemini 2.5 Pro Preview**'in gücünü kullanır.

Sezgisel web arayüzü sayesinde faturalarınızı kolayca yükleyin, Fatrocu'nun akıllı analizini izleyin, çıkarılan verileri hızla doğrulayın ve tek tıklamayla Excel'e aktarın.

## Anahtar Özellikler

*   **🥇 e-Fatura (UBL-TR XML) Desteği:** Yüklenen XML dosyalarını veya PDF'e gömülü XML'leri doğrudan ayrıştırarak **maksimum doğruluk** sağlar.
*   **✨ Gelişmiş PDF ve Resim Analizi:** Google Gemini 2.5 Pro kullanarak PDF, PNG, JPG, JPEG gibi formatlardaki faturalardan metin okuma (OCR) ve akıllı veri çıkarma.
*   **🧠 Akıllı Veri Çıkarma:** Kritik fatura bilgilerini otomatik olarak tanımlar ve çıkarır:
    *   Fatura Numarası (Belge No, Seri/Sıra No)
    *   Fatura Tarihi
    *   Satıcı/Müşteri Vergi Kimlik Numarası (VKN / TCKN)
    *   KDV Matrah(lar)ı
    *   KDV Oran(lar)ı ve Tutar(lar)ı
    *   Genel Toplam / Ödenecek Tutar
    *   (Gelecekte: Ürün/Hizmet kalemleri, para birimi, IBAN vb.)
*   **✔️ Veri Doğrulama Motoru:** AI tarafından çıkarılan verilerin doğruluğunu artırmak için otomatik format kontrolleri (tarih, VKN/TCKN) ve matematiksel tutarlılık kontrolleri (Matrah + KDV ≈ Toplam).
*   **🖥️ Etkileşimli Doğrulama Arayüzü:** Kullanıcı dostu web arayüzünde fatura görselini ve çıkarılan verileri yan yana görüntüleyin. AI tarafından bulunan alanların görselleştirilmesi (planlanan) ve kolayca düzenlenip onaylanabilmesi.
*   **📊 Excel'e Aktarım:** Doğrulanan tüm verileri muhasebe yazılımlarıyla uyumlu, yapılandırılmış `.xlsx` dosyası olarak kolayca dışa aktarın.
*   **☁️ Web Tabanlı Erişim:** Herhangi bir modern web tarayıcısı üzerinden erişilebilir, kurulum gerektirmez (kullanıcı için).
*   **🔐 Güvenli Mimari:** Hibrit yapı (Python Backend + Web Frontend) sayesinde Google Gemini API anahtarınız güvende tutulur (Backend'de saklanır).
*   **🚀 Verimlilik Odaklı:** Manuel veri giriş süresini önemli ölçüde azaltır ve insan hatası riskini minimize eder.

## Nasıl Çalışır?

1.  **Yükleme:** Fatura dosyanızı (XML, PDF, PNG, JPG vb.) Fatrocu web arayüzüne sürükleyip bırakın veya seçin.
2.  **Akıllı İşleme (Backend):**
    *   Dosya tipi kontrol edilir. XML ise doğrudan ayrıştırılır.
    *   PDF/Resim ise güvenli bir şekilde backend'e gönderilir.
    *   Backend, Gemini 2.5 Pro API'sini kullanarak metin okuma (OCR) ve veri çıkarma işlemlerini gerçekleştirir.
    *   Otomatik veri doğrulama kuralları uygulanır.
3.  **Doğrulama (Frontend):** İşlenen veriler, fatura görseli ile birlikte kullanıcı arayüzünde sunulur. Kullanıcı, verileri hızla gözden geçirir, gerekirse düzeltir ve onaylar.
4.  **Aktarım:** Onaylanan veriler, tek bir tıklama ile yapılandırılmış Excel dosyası olarak indirilir.

## Teknoloji Mimarisi

*   **Backend:** Python 3.x, Flask
*   **AI Model:** Google Gemini 2.5 Pro Preview (via Google AI API)
*   **Frontend:** HTML5, CSS3, JavaScript
*   **Veri İşleme:** Pandas (Excel için), lxml (XML için)
*   **PDF İşleme:** PyMuPDF (veya benzeri)
*   **API İletişimi:** Google AI Python SDK, Requests

## Gereksinimler

*   **Google Gemini API Anahtarı:** Fatrocu'nun AI yeteneklerini kullanabilmek için bir Google Gemini API anahtarına ihtiyacınız vardır.
    *   [Google AI Studio](https://aistudio.google.com/app/apikey) üzerinden **ücretsiz** bir anahtar edinebilirsiniz. Ücretsiz katman genellikle orta düzey kullanım için yeterlidir.
    *   API anahtarı, uygulamanın ayarlar bölümünden **güvenli bir şekilde backend'e kaydedilecektir.**

## Kullanım

1.  Fatrocu web uygulamasına tarayıcınızdan erişin: <a href="https://nec0ti.github.io/Fatrocu">Fatrocu</a>
2.  İlk kullanımda veya gerektiğinde, Ayarlar bölümünden Google Gemini API anahtarınızı girin (Bu anahtar sunucu tarafında güvenle saklanacaktır).
3.  Ana sayfada fatura dosyalarınızı yükleme alanına sürükleyip bırakın veya dosya seçiciyi kullanın.
4.  İşlem tamamlandığında, faturanızı listeden seçerek doğrulama ekranına geçin.
5.  Çıkarılan verileri kontrol edin, gerekirse düzeltin ve "Onayla" butonuna tıklayın.
6.  "Excel'e Aktar" butonu ile onaylanmış verileri indirin.

## Doğruluk Üzerine Not

Finansal verilerde doğruluk kritik öneme sahiptir. Fatrocu, e-Faturalar için %100'e yakın doğruluk hedeflerken, PDF/Resim formatları için Gemini 2.5 Pro ve akıllı doğrulama mekanizmaları ile mümkün olan en yüksek doğruluğu sağlamayı amaçlar. Ancak AI ve OCR teknolojilerinin doğası gereği %100 garanti edilemez. Fatrocu'nun asıl gücü, veri girişini **büyük ölçüde otomatikleştirerek** size zaman kazandırmak ve **hızlı, kolay bir son kontrol/doğrulama** imkanı sunmaktır.

## Yol Haritası / Gelecek Planları

*   [ ] **Gelişmiş Veri Çıkarma:** Ürün/Hizmet kalemleri, para birimi, ödeme vadesi, IBAN gibi ek alanların çıkarılması.
*   [ ] **ÖKC Fişi Optimizasyonu:** Yazar kasa fişleri için özel analiz ve doğruluk iyileştirmeleri.
*   [ ] **Fatura Görseli Üzerinde İşaretleme:** AI'ın bulduğu verinin faturanın neresinden alındığını görsel olarak vurgulama.
*   [ ] **Model İyileştirme:** Gemini prompt'larının sürekli optimizasyonu ve potansiyel olarak model fine-tuning (ileride).
*   [ ] **Kullanıcı Tanımlı Alanlar:** Kullanıcıların çıkarmak istedikleri özel alanları tanımlayabilmesi.
*   [ ] **Toplu İşlem (Batch Processing):** Birden fazla faturayı aynı anda yükleyip işleme ve onaylama.
*   [ ] **Muhasebe Yazılımı Entegrasyonları:** Popüler muhasebe programlarına doğrudan veri gönderme seçenekleri (API veya dosya formatı ile).
*   [ ] **Gelişmiş Raporlama/Dashboard:** İşlenen faturalara dair temel istatistikler sunma.

## Katkıda Bulunma

Katkılarınız memnuniyetle karşılanır! Projeyi geliştirmeye yardımcı olmak isterseniz, lütfen repoyu forklayın, değişikliklerinizi yapın ve bir pull request gönderin. Hataları bildirmek veya yeni özellikler önermek için issue açmaktan çekinmeyin.

## Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için `LICENSE` dosyasına bakın.

---

*Fatrocu ile fatura işlemlerinizi akıllandırın ve değerli zamanınızı geri kazanın!*