const { ipcRenderer } = require('electron');
const i18next = require('i18next');

document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKeyInput').value;
    localStorage.setItem('API_KEY', apiKey); // API anahtarını kaydet
    alert('API Anahtarı kaydedildi!');
});
