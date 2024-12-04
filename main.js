const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("node:path");

let mainWindow;

const createWindow = (width = 800, height = 600) => {
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  mainWindow.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.on('resize', (event, width, height) => {
    if (mainWindow) {
      mainWindow.setBounds({ x: 0, y: 0, width, height });
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
