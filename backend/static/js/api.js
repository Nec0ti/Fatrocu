const API_BASE_URL = '/api'; // Flask aynı domain'de çalıştığı için göreceli path yeterli

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json(); // Backend'den gelen JSON

        // === DÖNÜŞ DEĞERİNİ LOGLA ===
        console.log("uploadFile: Backend'den gelen JSON:", result);
        // ============================

        // ÖNEMLİ: Burada doğrudan 'result' mı dönüyor?
        // Eğer response.ok değilse farklı bir şey mi dönüyor? Kontrol edelim.
        if (!response.ok) {
             console.error("Yükleme hatası (API):", result.error || `HTTP ${response.status}`);
             // Hata durumunda da backend'den gelen JSON'u döndürelim ki displayProcessingResult işleyebilsin
             return result; // Hata JSON'unu döndür
             // Önceki hali: return { success: false, error: result.error || `Sunucu hatası: ${response.status}` }; idi, bu yapı farklıydı.
        }

        console.log("Yükleme başarılı (API):", result);
        return result; // Başarı durumunda backend'den gelen JSON'u döndür
         // Önceki hali: return { success: true, message: result.message, filename: result.filename }; idi, bu yapı farklıydı.

    } catch (error) {
        console.error("Ağ veya fetch hatası:", error);
        // Ağ hatası durumunda displayProcessingResult'ın anlayacağı bir yapı döndür
        return { status: 'error', error: 'Sunucuya bağlanılamadı veya bir ağ hatası oluştu.', filename: file.name };
    }
}

async function getResults(filename) {
    try {
        const response = await fetch(`${API_BASE_URL}/results/${filename}`);
        const result = await response.json();

        if (!response.ok) {
             console.error("Sonuç alma hatası:", result.error || `HTTP ${response.status}`);
             return { success: false, error: result.error || `Sunucu hatası: ${response.status}` };
        }
         console.log("Sonuçlar alındı:", result.data);
        return { success: true, data: result.data };

    } catch (error) {
         console.error("Ağ veya fetch hatası:", error);
        return { success: false, error: 'Sunucuya bağlanılamadı veya bir ağ hatası oluştu.' };
    }
}

// Henüz UI'da kullanmıyoruz ama yapısı hazır olsun
function getExportUrl(filename) {
    return `${API_BASE_URL}/export/${filename}`; // Doğrudan indirme linki
}

// UI'dan fonksiyonları export etmeye gerek yok, direkt main.js'de kullanacağız
// export { uploadFile, getResults, getExportUrl }; // Eğer modül olarak kullanılacaksa