# Fatrocu v2 - Akıllı Fatura İşleme

**Sürüm:** 2.2.0

Fatrocu, modern web teknolojileri ve Google Gemini yapay zekasını kullanarak fatura (PDF, Resim, XML) işleme sürecini otomatikleştiren, tarayıcı tabanlı bir uygulamadır. Kullanıcıların faturalarını kolayca yükleyip, verilerini anında çıkarmasını, kontrol edip düzeltmesini ve son olarak toplu halde Excel'e aktarmasını sağlar.

 <!-- Buraya uygulamanın bir ekran görüntüsü linki eklenebilir. -->

---

## Temel Özellikler

- **Çoklu Format Desteği:** PDF, PNG, JPEG ve XML formatındaki faturaları sorunsuz bir şekilde işler.
- **Yapay Zeka Destekli Veri Çıkarma:** Google Gemini (`gemini-2.5-flash`) modeli sayesinde fatura numarası, tarih, satıcı/alıcı bilgileri, KDV detayları ve genel toplam gibi kritik verileri yüksek doğrulukla otomatik olarak çıkarır.
- **Etkileşimli Kontrol Arayüzü:** Yüklenen faturanın önizlemesi ile yapay zeka tarafından çıkarılan verileri yan yana göstererek kolay ve hızlı bir kontrol süreci sunar.
- **Veri Düzeltme ve Onaylama:** Kullanıcılar, çıkarılan verilerde gerekli gördükleri düzeltmeleri yapabilir ve faturayı "onaylandı" olarak işaretleyebilir.
- **Toplu Excel Aktarımı:** Onaylanmış tüm faturaların verilerini tek bir tıklama ile düzenli bir Excel (.xlsx) dosyasına aktarır.
- **Tarayıcıda Kalıcılık:** Tüm fatura bilgileri ve dosya verileri tarayıcının `localStorage`'ında saklanır, böylece sayfayı yenileseniz veya kapatsanız bile verileriniz kaybolmaz.
- **Modern ve Kullanıcı Dostu Arayüz:** Tailwind CSS ile oluşturulmuş şık, duyarlı ve koyu tema bir tasarıma sahiptir.

---

## İş Akışı (Workflow)

1.  **Yükleme:** Kullanıcı, ana sayfadaki sürükle-bırak alanına bir veya daha fazla fatura dosyası yükler.
2.  **İşleme Kuyruğu:** Yüklenen her dosya bir işlem kuyruğuna eklenir ve sırayla işlenir. Bu sırada kullanıcı arayüzde dosyanın durumunu ("Sırada", "Yapay Zeka İşliyor...") anlık olarak takip edebilir.
3.  **Veri Çıkarma:** Sırası gelen fatura, Google Gemini API'sine gönderilir. Yapay zeka, fatura içeriğini analiz eder ve yapılandırılmış verileri (JSON formatında) geri döndürür.
4.  **Kontrol ve Onay:** İşlem başarılı olduğunda, fatura "Kontrol Bekliyor" durumuna geçer ve "Kontrol Et" sekmesinde listelenir. Kullanıcı faturayı seçerek detay sayfasına gider.
5.  **Düzeltme:** Detay sayfasında, fatura önizlemesi ve çıkarılan verilerin olduğu form yan yana görüntülenir. Kullanıcı, formdaki verileri kontrol eder ve gerekirse düzenler.
6.  **Kaydet ve Onayla:** Kullanıcı "Kaydet ve Onayla" butonuna tıkladığında, yapılan değişiklikler kaydedilir ve fatura "Onaylandı" durumuna geçer.
7.  **Toplu Aktarım:** Kullanıcı, dilediği zaman "Toplu Aktar" butonuna tıklayarak onaylanmış tüm faturaları tek bir Excel dosyası olarak indirir. Aktarım sonrası bu faturalar listeden temizlenir.

---

## Teknoloji Stack'i

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
    -   **Vite/esbuild (ESM.sh aracılığıyla):** Hızlı ve modern bir geliştirme ve derleme altyapısı.
-   **Veri Depolama:**
    -   **Browser `localStorage`:** Oturum kalıcılığı sağlamak, fatura verilerini ve dosya önbelleğini saklamak için.

---

## Gelecek Planları (Roadmap)

### Sürüm 2.3.0
-   **[ ] Gelişmiş Dışa Aktarma Seçenekleri:** CSV formatında dışa aktarma ve kullanıcıların sütunları özelleştirebileceği basit şablonlar.
-   **[ ] Toplu Düzenleme:** Birden fazla faturanın ortak alanlarını (örneğin satıcı adı) tek seferde düzenleme imkanı.
-   **[ ] Arama ve Filtreleme:** İşlem geçmişindeki faturalar arasında fatura numarası, tarih veya tutara göre arama ve filtreleme yapma.

### Sürüm 2.4.0
-   **[ ] İstatistik Paneli (Dashboard):** Aylık toplamlar, satıcılara göre harcama dağılımı gibi temel görsel istatistikler sunan bir panel.
-   **[ ] Çoklu Dil Desteği:** Arayüz için İngilizce dil seçeneği eklenmesi.
-   **[ ] Gelişmiş Hata Yönetimi:** Yapay zekanın veri çıkaramadığı durumlarda kullanıcıya daha açıklayıcı geri bildirimler sunma.

### Sürüm 3.0.0
-   **[ ] Bulut Senkronizasyonu:** Kullanıcıların verilerini isteğe bağlı olarak bir bulut hesabıyla (örn. Google Drive, Dropbox) senkronize ederek farklı cihazlardan erişim sağlaması.
-   **[ ] E-posta Entegrasyonu:** Belirlenen bir e-posta adresine gelen fatura eklerini otomatik olarak işleme yeteneği.
