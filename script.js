let API_KEY = '';
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const progressBar = document.getElementById('progressBar').firstElementChild;
const analyzeButton = document.getElementById('analyzeButton');
const invoiceNameInput = document.getElementById('invoiceName'); // Yeni input alanı
let selectedFiles = [];

const invoiceTypeToggles = document.querySelectorAll('input[name="invoiceType"]');

// Seçilen değeri al
function getSelectedInvoiceType() {
    const selectedToggle = Array.from(invoiceTypeToggles).find(toggle => toggle.checked);
    return selectedToggle ? selectedToggle.value : 'gider'; // Varsayılan değer "gider"
}

invoiceTypeToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
        analyzeButton.disabled = selectedFiles.length === 0 || !invoiceNameInput.value.trim();
    });
});


// Sürükle-bırak ve dosya seçme olayları
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);
dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFiles);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files instanceof FileList) {
        selectedFiles = Array.from(files);
    } else {
        selectedFiles = Array.from(files.target.files);
    }
    updateFileList();
    analyzeButton.disabled = selectedFiles.length === 0 || !invoiceNameInput.value.trim();
}

invoiceNameInput.addEventListener('input', () => {
    analyzeButton.disabled = selectedFiles.length === 0 || !invoiceNameInput.value.trim();
});

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function updateFileList() {
    fileList.innerHTML = selectedFiles.map(file => `<p>${escapeHtml(file.name)}</p>`).join('');
}

analyzeButton.addEventListener('click', analyzeInvoices);

async function analyzeInvoices() {
    const invoiceName = invoiceNameInput.value.trim();
    if (!invoiceName) {
        alert("Lütfen satıcı veya alıcı adını giriniz!");
        return;
    }

    analyzeButton.disabled = true;
    const totalFiles = selectedFiles.length;
    let processedFiles = 0;
    const allData = [];

    // Eşzamanlı işlem sayısını sınırlamak için
    const MAX_CONCURRENT = 1;
    const chunks = [];
    for (let i = 0; i < selectedFiles.length; i += MAX_CONCURRENT) {
        chunks.push(selectedFiles.slice(i, i + MAX_CONCURRENT));
    }

    for (const chunk of chunks) {
        const chunkPromises = chunk.map(file => analyzeInvoice(file, invoiceName));
        const results = await Promise.all(chunkPromises);
        
        results.forEach((result, index) => {
            if (result.error) {
                console.error(`Error analyzing ${chunk[index].name}:`, result.error);
                alert(`${chunk[index].name} analiz edilirken bir hata oluştu: ${result.error.message}`);
            } else {
                allData.push(result);
            }
            processedFiles++;
            updateProgress(processedFiles / totalFiles * 100);
        });
    }

    saveToExcel(allData);
    analyzeButton.disabled = false;
}

function updateProgress(percentage) {
    progressBar.style.width = `${percentage}%`;
}

async function analyzeInvoice(file, invoiceName) {
    try {
        API_KEY = localStorage.getItem('API_KEY') || API_KEY;
        const base64 = await fileToBase64(file);
        const mimeType = file.type;

        // Toggle seçiminden invoiceType değerini alın
        const invoiceType = getSelectedInvoiceType();

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Fatura bilgilerini analiz et ve aşağıdaki bilgilere ulaşmaya çalış. Faturanın türüne göre (Gelir/Gider) ilgili bilgileri doğru şekilde ayırt et:

                        Not: "${invoiceName}" firmasına ait bir ${invoiceType} faturasıdır.

                        Faturanın türüne göre şunları çıkart:
                        1. Eğer ${invoiceType} "gelir" ise:
                        - Fatura Tarihi
                        - Fatura Türü (Alış/Satış)
                        - Alıcı'nın VKN (Vergi Kimlik Numarası), VD (Vergi Dairesi) veya TCKN (T.C. Kimlik Numarası)
                        - Fatura Numarası
                        - Matrah (Toplam Tutar)
                        - KDV Tutarı
                        - KDV Oranı (%0 ise yazma)

                        2. Eğer ${invoiceType} "gider" ise:
                        - Fatura Tarihi
                        - Fatura Türü (Alış/Satış)
                        - Satıcı'nın VKN (Vergi Kimlik Numarası), VD (Vergi Dairesi) veya TCKN (T.C. Kimlik Numarası)
                        - Fatura Numarası
                        - Matrah (Toplam Tutar)
                        - KDV Tutarı
                        - KDV Oranı (%0 ise yazma)

                        Lütfen bu faturayı incele ve yukarıdaki bilgilere göre verileri çıkart. Çıkartılan bilgiler aşağıdaki formatta olmalı:

                        Örnek:
                        tarih: 12.12.2012  
                        tür: satış  
                        vkn/tckn: 1234567890  
                        fatura no: 123456  
                        matrah: 1000  
                        kdv: 200  
                        kdv oranı: %20  

                        Bilgileri yalnızca yukarıdaki formatta ve faturanın türüne uygun olarak ver.
                        `
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64.split(',')[1]
                        }
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status}, Details: ${errorText}`);
        }

        const data = await response.json();
        return parseGeminiResponse(data);
    } catch (error) {
        return { error };
    }
}

function parseGeminiResponse(data) {
    const text = data.candidates[0].content.parts[0].text;
    const lines = text.split('\n');
    const result = {};
    
    for (const line of lines) {
        const [key, value] = line.split(':').map(s => s.trim());
        if (key && value) {
            result[key] = value;
        }
    }

    return result;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function saveToExcel(data) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fatura Bilgileri");
    XLSX.writeFile(wb, "invoice-analysis.xlsx");
}
