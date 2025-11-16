# Fatrocu v2.1: GitHub Pages Dağıtım Kılavuzu

Bu kılavuz, Fatrocu v2.1 uygulamasını GitHub Pages'de nasıl yayınlayacağınızı adım adım açıklamaktadır. Bu proje, modern tarayıcı özelliklerini kullanarak çalıştığı için sunucu tarafı bir derleme (`build`) adımı gerektirmez.

---

## 🤔 Neden `npm install` veya `npm run build` Gerekmiyor?

Çoğu modern JavaScript projesinin aksine, Fatrocu'nun bu versiyonu "build-less" (derlemesiz) bir yaklaşımla geliştirilmiştir:

1.  **Bağımlılıklar (Dependencies):** Proje, `npm` ve `node_modules` klasörünü kullanmak yerine, `React` ve `@google/genai` gibi kütüphaneleri doğrudan bir CDN (Content Delivery Network) üzerinden çeker. Bu işlem `index.html` dosyasındaki `<script type="importmap">` etiketi sayesinde gerçekleşir.
2.  **Derleme (Build):** Kod, tarayıcının anlayacağı modern JavaScript ve JSX formatındadır. Bir `build` adımına gerek kalmadan tarayıcı tarafından anında çalıştırılabilir. Bu, dağıtım sürecini büyük ölçüde basitleştirir.

Kısacası, projenin klasör yapısı zaten dağıtıma hazır statik dosyalardan oluşmaktadır.

---

## 🚀 Dağıtım Yöntemleri

İki basit yöntemle dağıtım yapabilirsiniz:

### Yöntem 1: GitHub Arayüzü (En Basit Yöntem)

1.  **Projeyi GitHub'a Yükleyin:** Projeniz henüz bir GitHub deposunda değilse, yeni bir "Public" depo oluşturun ve tüm proje dosyalarını bu depoya `git push` komutu ile gönderin.

2.  **GitHub Pages'i Aktif Edin:**
    -   GitHub'daki proje deponuza gidin.
    -   **"Settings"** (Ayarlar) sekmesine tıklayın.
    -   Sol menüden **"Pages"** seçeneğini bulun ve tıklayın.
    -   "Build and deployment" bölümünde, "Source" (Kaynak) olarak **"Deploy from a branch"** seçeneğini seçin.
    -   "Branch" (Dal) ayarlarında dal olarak **`main`** (veya ana dalınız hangisiyse) ve klasör olarak **`/(root)`** seçeneğini seçin.
    -   **"Save"** (Kaydet) butonuna tıklayın.

    Birkaç dakika içinde siteniz `https://KULLANICI_ADINIZ.github.io/DEPO_ADINIZ/` adresinde yayınlanacaktır.

### Yöntem 2: GitHub Actions (Otomatik Yöntem)

Projenize her `push` yaptığınızda dağıtımın otomatik olarak gerçekleşmesini istiyorsanız, bir GitHub Actions workflow kullanabilirsiniz.

1.  **Projenizde `.github/workflows` klasörünü oluşturun.**
2.  Bu klasörün içine `deploy.yml` adında bir dosya ekleyin ve içeriğini aşağıdaki gibi yapın (bu işlem sizin için zaten yapıldı).
3.  Değişiklikleri GitHub'a `git push` ile gönderin. GitHub, bu dosyayı algılayacak ve sitenizi otomatik olarak yayınlayacaktır.

---

## ⚠️ Önemli Not: Gemini API Anahtarı

GitHub Pages, yalnızca statik dosyaları sunar ve sunucu tarafı ortam değişkenlerini (`process.env`) **desteklemez**.

Bu nedenle, GitHub Pages üzerinde yayınlanan uygulamanın arayüzü sorunsuz çalışacak, ancak fatura işleme (veri çıkarma) özelliği **API anahtarı bulunamadığı için hata verecektir.**

Tam işlevsellik için, uygulamanızı ortam değişkenlerini destekleyen bir platformda (Vercel, Netlify, Cloudflare Pages vb.) barındırmanız ve `API_KEY` değişkenini o platformun ayarlarından tanımlamanız gerekmektedir.
