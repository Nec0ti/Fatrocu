// backend/static/js/ui.js

function showUploadStatus(message, isError = false) {
    const statusDiv = document.getElementById('upload-status');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.style.color = isError ? 'red' : 'green';
    }
}

// === displayProcessingResult fonksiyonunu BURAYA, DIŞARIYA TAŞIDIK ===
function displayProcessingResult(resultData) {
    const statusDiv = document.getElementById('upload-status'); // Sonucu göstereceğimiz alan
    if (!statusDiv) return;

    // Sonuçları temiz bir şekilde gösterelim
    statusDiv.innerHTML = ''; // Önceki içeriği temizle

    if (resultData && resultData.filename) {
         // Dosya adını ve durumu ekle
         const infoP = document.createElement('p');
         infoP.textContent = `Dosya: ${resultData.filename} - Durum: ${resultData.status}`;
         statusDiv.appendChild(infoP);

        if (resultData.status === 'completed' || resultData.status === 'verified') {
            statusDiv.style.color = 'green';
            // Başarılı ise çıkarılan veriyi göster
            if (resultData.extracted_data) {
                const dataPre = document.createElement('pre');
                // JSON'u formatlı string'e çevir
                dataPre.textContent = JSON.stringify(resultData.extracted_data, null, 2);
                statusDiv.appendChild(dataPre);
                // TODO: Burayı daha sonra düzenlenebilir form alanlarına çevirebiliriz.
            } else {
                 const noDataP = document.createElement('p');
                 noDataP.textContent = "Veri bulunamadı.";
                 statusDiv.appendChild(noDataP);
            }
        } else {
             // Hata durumu
             statusDiv.style.color = 'red';
             const errorP = document.createElement('p');
             errorP.textContent = `Hata: ${resultData.error || 'Bilinmeyen bir hata oluştu.'}`;
             statusDiv.appendChild(errorP);
        }
    } else {
        statusDiv.textContent = "Geçersiz veya eksik sonuç verisi alındı.";
        statusDiv.style.color = 'orange';
    }
}
// ===================================================================

function addProcessedFileToList(filename) {
    const list = document.getElementById('processed-files');
    if (list) {
        // Liste boşsa "Liste boş" yazısını kaldıralım
        const placeholder = list.querySelector('.list-placeholder');
        if (placeholder) {
            list.removeChild(placeholder);
        }

        // Aynı dosya adıyla zaten bir liste öğesi var mı kontrol et
        if (document.getElementById(`file-item-${filename.replace(/\./g, '-')}`)) { // Noktaları da replace edelim ID için
            console.log(`${filename} zaten listede.`);
            return;
        }

        const listItem = document.createElement('li');
        listItem.id = `file-item-${filename.replace(/\./g, '-')}`;
        const safeFilename = encodeURIComponent(filename);

        // Dosya adı ve aksiyonları ayıralım (mobil için daha iyi olabilir)
        listItem.innerHTML = `
            <span class="filename">${filename}</span>
            <div class="actions">
                <button onclick="viewResults('${filename}')" class="button secondary">Sonuçları Gör</button>
                <a href="/api/export/${safeFilename}" target="_blank" class="button export-link">Excel İndir</a>
            </div>
        `;
        list.appendChild(listItem);
        } else {
            console.error("#processed-files listesi bulunamadı.");
        }
}

async function viewResults(filename) {
    // ... (Bu fonksiyon aynı kalabilir) ...
    showUploadStatus(`'${filename}' için sonuçlar getiriliyor...`);
    const result = await getResults(filename);
    if (result.success && result.data) {
        displayProcessingResult(result.data);
    } else {
         showUploadStatus(`Sonuçlar alınamadı: ${result.error || 'Sunucu hatası'}`, true);
    }
}

// Not: getExportUrl fonksiyonu api.js içinde tanımlıysa burada tekrar tanımlamaya gerek yok.
// Eğer ui.js içinde tanımlıysa, sadece bir tanım kalmalı. api.js içinde kalması daha mantıklı.