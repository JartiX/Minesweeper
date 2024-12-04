const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendResize: (width, height) => ipcRenderer.send('resize', width, height),
});

window.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.querySelector('.game_container');
  if (gameContainer) {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === gameContainer) {
          const rect = entry.target.getBoundingClientRect();
          ipcRenderer.send('resize', Math.ceil(rect.width) + 20, Math.ceil(rect.height) + 80);
        }
      }
    });

    resizeObserver.observe(gameContainer);
  }
});