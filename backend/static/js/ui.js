function showUploadStatus(message, isError = false) {
    const statusDiv = document.getElementById('upload-status');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.style.color = isError ? 'red' : 'green';
    }
}

function addProcessedFileToList(filename) {
    const list = document.getElementById('processed-files');
    if (list) {
        const listItem = document.createElement('li');
        // Sonuçları görmek için bir link veya buton ekleyebiliriz
        listItem.innerHTML = `${filename} - <button onclick="viewResults('${filename}')">Sonuçları Gör</button> | <a href="${getExportUrl(filename)}" target="_blank" download>Excel İndir</a>`;
        list.appendChild(listItem);
    }
}

// Sonuçları görüntüleme fonksiyonu (ileride detaylandırılacak)
async function viewResults(filename) {
    alert(`'${filename}' için sonuçlar görüntülenecek... (API çağrısı yapılacak)`);
    showUploadStatus(`'${filename}' için sonuçlar getiriliyor...`);
    const result = await getResults(filename); // api.js'deki fonksiyonu çağır
    if (result.success) {
        showUploadStatus(`'${filename}' sonuçları: ${JSON.stringify(result.data, null, 2)}`);
        // TODO: Bu veriyi daha düzgün bir şekilde (örneğin bir modal veya ayrı bir bölümde) göster.
    } else {
        showUploadStatus(`Sonuçlar alınamadı: ${result.error}`, true);
    }
}

// Export etmeye gerek yok, main.js'de kullanacağız.