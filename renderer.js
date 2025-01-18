const { ipcRenderer } = require('electron');
const i18next = require('i18next');

// Dil değiştirildiğinde
document.getElementById('languageSelect').addEventListener('change', (event) => {
    const newLanguage = event.target.value;
    i18next.changeLanguage(newLanguage);  // Dil değiştirme
    document.getElementById('languageSelect').value = newLanguage; // Seçimi güncelle
});
