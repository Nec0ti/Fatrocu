const API_BASE_URL = '/api'; // Flask aynı domain'de çalıştığı için göreceli path yeterli

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Yükleme hatası:", result.error || `HTTP ${response.status}`);
            return { success: false, error: result.error || `Sunucu hatası: ${response.status}` };
        }

        console.log("Yükleme başarılı:", result);
        return { success: true, message: result.message, filename: result.filename };

    } catch (error) {
        console.error("Ağ veya fetch hatası:", error);
        return { success: false, error: 'Sunucuya bağlanılamadı veya bir ağ hatası oluştu.' };
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