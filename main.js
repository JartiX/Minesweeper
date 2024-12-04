const { app, BrowserWindow, ipcMain, screen } = require('electron');
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
      const display = screen.getPrimaryDisplay();
      const screenWidth = display.workAreaSize.width;
      const screenHeight = display.workAreaSize.height;

      if (width > screenWidth || height > screenHeight) {
        mainWindow.setFullScreen(true);
      } else {
        mainWindow.setFullScreen(false);
        mainWindow.setBounds({
          x: Math.max(0, (screenWidth - width) / 2),
          y: Math.max(0, (screenHeight - height) / 2),
          width,
          height,
        });
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
