document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.querySelector('.game_container');
  if (gameContainer) {
    const rect = gameContainer.getBoundingClientRect();
    window.electronAPI.sendResize(Math.ceil(rect.width)+20, Math.ceil(rect.height)+80);
  }
});
