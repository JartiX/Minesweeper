const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require("node:path");
const fs = require('fs');

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
  const userDataPath = app.getPath('userData');
  fs.rmSync(userDataPath, { recursive: true, force: true });

  createWindow();

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

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

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && (input.key === '+' || input.key === '-' || input.key === '0' || input.type === 'mouseWheel')) {
      event.preventDefault();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
