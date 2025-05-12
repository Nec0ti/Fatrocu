document.addEventListener('DOMContentLoaded', () => {
    console.log("Fatrocu frontend başlatıldı.");

    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');

    if (uploadForm && fileInput) {
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Formun varsayılan gönderimini engelle
            const file = fileInput.files[0];

            if (!file) {
                showUploadStatus("Lütfen bir dosya seçin.", true);
                return;
            }

            showUploadStatus("Dosya yükleniyor ve işleniyor...", false);

            // api.js içindeki fonksiyonu çağır
            const uploadResult = await uploadFile(file);

            if (uploadResult.success) {
                showUploadStatus(uploadResult.message, false);
                // Başarılı yüklemeden sonra dosyayı listeye ekle
                if(uploadResult.filename) {
                    addProcessedFileToList(uploadResult.filename);
                }
                // Formu temizle (opsiyonel)
                 uploadForm.reset();
            } else {
                showUploadStatus(`Yükleme hatası: ${uploadResult.error}`, true);
            }
        });
    } else {
        console.error("Yükleme formu veya dosya girişi bulunamadı.");
    }

    // Sayfa yüklendiğinde belki mevcut işlenmiş dosyaları listeleyebiliriz
    // (Bunun için backend'de bir endpoint daha gerekir)
    // loadProcessedFiles();
});

// function loadProcessedFiles() {
//     // TODO: Backend'den işlenmiş dosyaların listesini alıp
//     // addProcessedFileToList ile ekleyen fonksiyon
// }