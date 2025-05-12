document.addEventListener('DOMContentLoaded', () => {
    console.log("Fatrocu frontend başlatıldı.");

    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('file-input');

    if (uploadForm && fileInput) {
        uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const file = fileInput.files[0];
            if (!file) {
                showUploadStatus("Lütfen bir dosya seçin.", true);
                return;
            }

            showUploadStatus("Dosya yükleniyor ve işleniyor...", false);

            const uploadResult = await uploadFile(file); // uploadFile artık işlenmiş sonucu dönüyor

            // === VERİYİ LOGLA ===
            console.log("displayProcessingResult'a gönderilen veri:", uploadResult);
            // =====================

            // Gelen sonucu doğrudan gösterelim
            displayProcessingResult(uploadResult); // uploadResult tüm JSON yanıtını içerir

            // Sadece başarılı ise listeye ekleyelim
            if (uploadResult && uploadResult.status && uploadResult.status !== 'error' && uploadResult.status !== 'failed' && uploadResult.filename) {
                addProcessedFileToList(uploadResult.filename);
            }

            // Formu temizle
             uploadForm.reset();
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