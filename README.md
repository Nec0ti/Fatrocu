# Fatrocu v2.2 - Akıllı ve Özelleştirilebilir Fatura İşleme

**Sürüm:** 2.2.0

Fatrocu, modern web teknolojileri ve Google Gemini yapay zekasını kullanarak fatura (PDF, Resim, XML) işleme sürecini otomatikleştiren, **tamamen özelleştirilebilir**, tarayıcı tabanlı bir uygulamadır. Kullanıcıların faturalarını kolayca yükleyip, verilerini anında çıkarmasını, kontrol edip düzeltmesini ve son olarak toplu halde Excel'e aktarmasını sağlar.

---

## ✨ Temel Özellikler

- **Çoklu Format Desteği:** PDF, PNG, JPEG ve XML formatındaki faturaları sorunsuz bir şekilde işler.
- **Yapay Zeka Destekli Veri Çıkarma:** Google Gemini (`gemini-2.5-flash`) modeli sayesinde kritik verileri yüksek doğrulukla otomatik olarak çıkarır.
- **Tamamen Özelleştirilebilir Yapılandırmalar:**
    -   **Hazır Şablonlar:** `e-Arşiv Fatura` ve `ÖKC/Yazar Kasa Fişi` için önceden tanımlanmış yapılandırmalarla hemen başlayın.
    -   **Kendi Şablonlarınızı Yaratın:** "Ayarlar" menüsünden, işlemek istediğiniz belgelere özel olarak hangi alanların çıkarılacağını tanımlayan kendi yapılandırmalarınızı oluşturun, düzenleyin ve silin.
- **Manuel Veri Girişi Modu:** Yapay zekayı tamamen atlayarak, bir belgeyi boş bir formla açın ve tüm verileri sıfırdan kendiniz girin.
- **Dinamik Form Alanları:** Fatura kontrol ekranında, herhangi bir faturaya anında yeni alanlar (`Proje Kodu`, `Sipariş No` vb.) veya yeni satır kalemi sütunları (`İskonto`, `Birim Fiyat` vb.) ekleyip çıkarın.
- **Etkileşimli Kontrol Arayüzü:** Yüklenen faturanın önizlemesi ile yapay zeka tarafından çıkarılan (veya sizin girdiğiniz) verileri yan yana göstererek kolay ve hızlı bir kontrol süreci sunar.
- **Akıllı Excel Aktarımı:** Onaylanmış tüm faturaların verilerini, *tüm özel alanlarınızla birlikte*, tek bir tıklama ile düzenli bir Excel (`.xlsx`) dosyasına aktarır.
- **Ayrılmış İş Akışları:** `Yükle`, `Kontrol Et` ve `Onaylananlar` sayfalarıyla tüm süreci net bir şekilde yönetin.
- **Tarayıcıda Kalıcılık:** Tüm fatura bilgileri ve dosya verileri tarayıcının `localStorage`'ında saklanır, böylece sayfayı yenileseniz bile verileriniz kaybolmaz.

---

## 🚀 İş Akışı (Workflow)

1.  **Yapılandırma Seç ve Yükle:** Kullanıcı, ana sayfadan hangi yapılandırmayı (örn: `e-Arşiv Fatura` veya `Manuel Giriş`) kullanacağını seçer ve bir veya daha fazla fatura dosyası yükler.
2.  **İşleme Kuyruğu:** Yüklenen her dosya bir işlem kuyruğuna eklenir. `Manuel Giriş` modu dışındaki dosyalar sırayla işlenir.
3.  **Veri Çıkarma (AI):** Sırası gelen fatura, seçilen yapılandırmaya göre bir JSON şeması oluşturularak Google Gemini API'sine gönderilir. Yapay zeka, fatura içeriğini analiz eder ve yapılandırılmış verileri döndürür. (`Manuel Giriş` modunda bu adım atlanır).
4.  **Kontrol Et:** İşlem tamamlandığında, fatura "Kontrol Bekliyor" durumuna geçer ve **"Kontrol Et"** sayfasında listelenir. Bu sayfa, yapılacak işler listenizdir.
5.  **Detaylı Kontrol ve Özelleştirme:** Kullanıcı faturayı açar. Fatura önizlemesi ve çıkarılan verilerin olduğu form yan yana görüntülenir. Kullanıcı, formdaki verileri düzenleyebilir ve hatta o faturaya özel yeni alanlar veya sütunlar ekleyebilir.
6.  **Onaylama:** Kullanıcı "Kaydet ve Onayla" butonuna tıkladığında, yapılan değişiklikler kaydedilir ve fatura "Onaylandı" durumuna geçerek **"Onaylananlar"** sayfasına taşınır. Bu sayfa, onaylanmış faturalarınızın arşividir.
7.  **Toplu Aktarım:** Kullanıcı, dilediği zaman "Toplu Aktar" butonuna tıklayarak **"Onaylananlar"** listesindeki tüm faturaları tek bir Excel dosyası olarak indirir. Aktarım sonrası faturalar listeden **silinmez**, arşivinizde kalmaya devam eder. Arşivi temizlemek için "Onaylanmışları Temizle" butonu kullanılabilir.

---

## 🛠️ Teknoloji Stack'i

-   **Frontend:**
    -   **React:** Kullanıcı arayüzü oluşturmak için kullanılan temel kütüphane.
    -   **TypeScript:** Statik tipleme ile daha güvenli ve ölçeklenebilir kod yazımı için.
    -   **Tailwind CSS:** Hızlı ve modern tasarımlar için kullanılan bir CSS çatısı.
-   **Yapay Zeka:**
    -   **Google Gemini API (@google/genai):** Fatura görsellerinden ve belgelerinden veri çıkarmak için kullanılan `gemini-2.5-flash` modeli.
-   **Kütüphaneler:**
    -   **xlsx:** Tarayıcı tarafında dinamik olarak Excel dosyaları oluşturmak için.
-   **Platform:**
    -   Uygulama tamamen istemci (tarayıcı) tarafında çalışır. Sunucuya ihtiyaç duymaz (Gemini API hariç).
-   **Veri Depolama:**
    -   **Browser `localStorage`:** Oturum kalıcılığı sağlamak, fatura verilerini, yapılandırmaları ve dosya önbelleğini saklamak için.

---

## 📅 Gelecek Planları (Roadmap)

### Sürüm 2.2.0
-   **[ ] Gelişmiş Dışa Aktarma Seçenekleri:** CSV formatında dışa aktarma ve kullanıcıların sütunları özelleştirebileceği basit şablonlar.
-   **[ ] Toplu Düzenleme:** Birden fazla faturanın ortak alanlarını (örneğin satıcı adı) tek seferde düzenleme imkanı.
-   **[ ] Arama ve Filtreleme:** İşlem geçmişindeki faturalar arasında fatura numarası, tarih veya tutara göre arama ve filtreleme yapma.

### Sürüm 2.3.0
-   **[ ] İstatistik Paneli (Dashboard):** Aylık toplamlar, satıcılara göre harcama dağılımı gibi temel görsel istatistikler sunan bir panel.
-   **[ ] Çoklu Dil Desteği:** Arayüz için İngilizce dil seçeneği eklenmesi.
-   **[ ] Gelişmiş Hata Yönetimi:** Yapay zekanın veri çıkaramadığı durumlarda kullanıcıya daha açıklayıcı geri bildirimler sunma.
