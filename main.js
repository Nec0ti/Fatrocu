const { app, BrowserWindow } = require('electron');
const path = require('path');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');

const isDev = !app.isPackaged;
const getResourcePath = () => {
  return isDev 
    ? path.join(__dirname, 'locales', '{{lng}}.json')
    : path.join(process.resourcesPath, 'app.asar', 'locales', '{{lng}}.json');
};

// i18next yapılandırması
i18next
  .use(Backend)
  .init({
    lng: 'tr',
    fallbackLng: 'en',
    preload: ['tr', 'en'],
    backend: {
      loadPath: getResourcePath()
    },
  });

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


console.log('App path:', app.getAppPath());
console.log('Resource path:', process.resourcesPath);
console.log('Current working directory:', process.cwd());
console.log('Is packaged:', app.isPackaged);
console.log('Locales path:', getResourcePath());