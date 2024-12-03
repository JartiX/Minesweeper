let height = 12;
let width = 12;
let bombs = 20;
let hollow_cells = height * width - bombs;


let bombMap = [];
let cellMap = [];
let gameStarted = false;
let game = document.querySelector('.game');
let game_result_container = document.querySelector('.game_result_container');
let smile = document.querySelector('.smile');
let is_game_over = false;
let bomb_label = -1;
let opened_cells = 0;
let founded_bombs = 0;
let timer = document.querySelector('.timer');
let bombs_cnt = document.querySelector('.bombs');
let value_colors = {
    1: 'rgb(0, 89, 253)',
    2: 'rgb(0, 134, 7)',
    3: 'rgb(253, 35, 35)',
    4: 'rgb(0, 89, 253)',
    5: 'rgb(87, 0, 0)',
    6: 'rgb(1, 186, 199)',
    7: 'rgb(0, 0, 0)',
    8: 'rgb(83, 1, 1)'
}

let timeElapsed = 0;
let timerInterval;

let currentCellX = 0;
let currentCellY = 0;

function drawCells() {
    game.style.gridTemplateColumns = (height <= 20 && width <= 20) ? `repeat(${width}, 40px)` : `repeat(${width}, 30px)`
    let class_name = (height <= 20 && width <= 20) ? "game__cell" : "game__cell--mini";

    for (let x = 0; x < height; x++) {
        let bombRow = [];
        let cellRow = [];
        for (let y = 0; y < width; y++) {
            let cell = document.createElement('div');
            cell.classList.add(class_name);
            cell.dataset.x = x;
            cell.dataset.y = y;
            game.append(cell);
            bombRow.push(0);
            cellRow.push(cell);
        }
        bombMap.push(bombRow);
        cellMap.push(cellRow);
    }
}

function placeBombs(firstClickX, firstClickY) {
    let placedBombs = 0;
    while (placedBombs < bombs) {
        let rx = Math.floor(Math.random() * height);
        let ry = Math.floor(Math.random() * width);

        if (Math.abs(rx - firstClickX) <= 1 && Math.abs(ry - firstClickY) <= 1) continue;

        if (!bombMap[rx][ry]) {
            bombMap[rx][ry] = bomb_label;
            placedBombs++;
        }
    }

    calculateNumbers();
}

function calculateNumbers() {
    for (let x = 0; x < height; x++) {
        for (let y = 0; y < width; y++) {
            if (bombMap[x][y] === bomb_label) continue;

            let count = 0;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let nx = x + dx;
                    let ny = y + dy;
                    if (nx >= 0 && ny >= 0 && nx < height && ny < width && bombMap[nx][ny] === bomb_label) {
                        count++;
                    }
                }
            }
            bombMap[x][y] = count;
        }
    }
}

function game_lose() {
    const diagonals = [];

    for (let d = 0; d < height + width - 1; d++) {
        diagonals[d] = [];
    }

    for (let x = 0; x < height; x++) {
        for (let y = 0; y < width; y++) {
            diagonals[x + y].push({ x, y });
        }
    }

    diagonals.forEach((diagonal, i) => {
        setTimeout(() => {
            diagonal.forEach(({ x, y }) => {
                const cell = cellMap[x][y];
                const value = bombMap[x][y];

                cell.classList.add('game__cell--flip');

                setTimeout(() => {
                    if (value === bomb_label) {
                        cell.textContent = '💣';
                        cell.classList.add('game__cell--bomb');

                        let explosion = document.createElement('div');
                        explosion.classList.add('explosion');
                        let rect = cell.getBoundingClientRect();

                        explosion.style.left = `${rect.left + window.scrollX + rect.width / 2 - 25}px`;
                        explosion.style.top = `${rect.top + window.scrollY + rect.height / 2 - 25}px`;

                        document.body.appendChild(explosion);

                        setTimeout(() => explosion.remove(), 700);
                    } else {
                        cell.classList.add('game__cell--lose');
                        if (value > 0) {
                            cell.textContent = value;
                            cell.style.color = value_colors[value];
                        } else {
                            cell.textContent = '';
                        }
                    }
                }, 300)
            });
        }, i * 200);
    });

    setTimeout(() => {
        is_game_over = true;
        smile.innerHTML = '😵';
        clearInterval(timerInterval);
        game_result_container.querySelector('.game_result').style.visibility = 'visible';
        game_result_container.querySelector('.game_result').style.color = 'red';
        game_result_container.querySelector('.game_result').innerHTML = 'Вы проиграли!';
    }, diagonals.length * 200);
}



function game_win() {
    for (let x = 0; x < height; x++) {
        for (let y = 0; y < width; y++) {
            if (bombMap[x][y] == bomb_label) {
                cellMap[x][y].textContent = '💣';
                cellMap[x][y].classList.add('game__cell--bomb--win');
            } else {
                cellMap[x][y].classList.add('game__cell--win');
            }
        }
    }

    triggerConfetti();

    is_game_over = true;
    smile.innerHTML = '🥳';
    clearInterval(timerInterval);
    game_result_container.querySelector('.game_result').style.visibility = 'visible';
    game_result_container.querySelector('.game_result').style.color = 'green';
    game_result_container.querySelector('.game_result').innerHTML = 'Вы выиграли!';
}

function triggerConfetti() {
    let confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti-container');
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 100; i++) {
        let confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * window.innerWidth}px`;
        confetti.style.animationDuration = `${Math.random() * 1 + 1}s`;
        confetti.style.animationDelay = `${Math.random() * 1}s`;
        confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
        confettiContainer.remove();
    }, 2000);
}

function resetSelectedCell() {
    currentCellX = 0;
    currentCellY = 0;
    updateSelectedCell();
}

function reset_game() {
    opened_cells = 0;
    founded_bombs = 0;
    bombMap = [];
    cellMap = [];
    gameStarted = false;
    is_game_over = false;
    timeElapsed = 0;
    bombs_cnt.innerHTML = bombs;
    timer.innerHTML = '0';
    game.innerHTML = '';
    game_result_container.querySelector('.game_result').style.visibility = 'hidden';
    smile.innerHTML = '🙂';
    clearInterval(timerInterval)
    drawCells();
    resetSelectedCell()
}

function start_timer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        timer.innerHTML = timeElapsed;
    }, 1000);
}

function openCell(x, y, is_recursive_call=false) {
    let cell = cellMap[x][y];
    if (cell.classList.contains('game__cell--open') || cell.classList.contains('game__cell--flag')) return;

    cell.classList.add('game__cell--open');
    let value = bombMap[x][y];

    if (value === bomb_label && !is_recursive_call) {
        cell.textContent = '💣';
        cell.classList.add('game__cell--bomb');
        game_lose();
        return;
    } else if (value > 0) {
        cell.textContent = value;
        cell.style.color = value_colors[value];
    } else {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && ny >= 0 && nx < height && ny < width) {
                    openCell(nx, ny, true);
                }
            }
        }
    }
    opened_cells++;

    if (opened_cells === hollow_cells) {
        game_win();
    }
}

function countFlagsAround(x, y) {
    let flagCount = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < height && ny < width) {
                if (cellMap[nx][ny].classList.contains('game__cell--flag')) {
                    flagCount++;
                }
            }
        }
    }
    return flagCount;
}

function toggleFlag(x, y) {
    if (is_game_over) return;
    let cell = cellMap[x][y];
    if (cell.classList.contains('game__cell--open')) return;

    if (cell.classList.contains('game__cell--flag')) {
        bombs_cnt.innerHTML = parseInt(bombs_cnt.innerHTML) + 1;
    } else if (bombs_cnt.innerHTML == 0) return; else {
        bombs_cnt.innerHTML = parseInt(bombs_cnt.innerHTML) - 1;
    }
    cell.classList.toggle('game__cell--flag');
    cell.textContent = cell.classList.contains('game__cell--flag') ? '🚩' : '';
}

drawCells();

game.addEventListener('click', (e) => {
    let cell = e.target;
    if (!cell.classList.contains('game__cell') && !cell.classList.contains('game__cell--mini')) return;

    if (is_game_over) {
        reset_game();
        return;
    }

    let x = parseInt(cell.dataset.x);
    let y = parseInt(cell.dataset.y);

    if (!gameStarted || is_game_over) {
        placeBombs(x, y);
        bombs_cnt.innerHTML = bombs;
        gameStarted = true;
        is_game_over = false;
        start_timer();
    }
    removeSelectedCell();
    currentCellX = x;
    currentCellY = y;
    updateSelectedCell();

    openCell(x, y);
});

game.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    let cell = e.target;
    if (!cell.classList.contains('game__cell') && !cell.classList.contains('game__cell--mini')) return;

    let x = parseInt(cell.dataset.x);
    let y = parseInt(cell.dataset.y);

    removeSelectedCell();
    currentCellX = x;
    currentCellY = y;
    updateSelectedCell();

    toggleFlag(x, y);
});

function updateSelectedCell() {
    const selectedCell = cellMap[currentCellX][currentCellY];
    selectedCell.classList.add('game__cell--selected');
    selectedCell.style.outline = '2px solid white';
}

function removeSelectedCell() {
    const selectedCell = cellMap[currentCellX][currentCellY];
    selectedCell.classList.remove('game__cell--selected');
    selectedCell.style.outline = '';
}

function openSurroundingCells(x, y) {
    let value = bombMap[x][y];
    
    if (value === countFlagsAround(x, y)) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && ny >= 0 && nx < height && ny < width) {
                    if (!cellMap[nx][ny].classList.contains('game__cell--open') &&
                        !cellMap[nx][ny].classList.contains('game__cell--flag')) {
                        openCell(nx, ny);
                    }
                }
            }
        }
    }
}

game.addEventListener('dblclick', (e) => {
    let cell = e.target;
    if ((!cell.classList.contains('game__cell') && !cell.classList.contains('game__cell--mini')) || !cell.classList.contains('game__cell--open')) return;

    let x = parseInt(cell.dataset.x);
    let y = parseInt(cell.dataset.y);

    if (bombMap[x][y] > 0) {
        openSurroundingCells(x, y);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'Enter' || e.key === ' ')) {
        toggleFlag(currentCellX, currentCellY);
        return;
    }

    switch (e.key) {
        case 'ArrowUp':
            if (currentCellX > 0) {
                removeSelectedCell();
                currentCellX--;
                updateSelectedCell();
            }
            break;
        case 'ArrowDown':
            if (currentCellX < height - 1) {
                removeSelectedCell();
                currentCellX++;
                updateSelectedCell();
            }
            break;
        case 'ArrowLeft':
            if (currentCellY > 0) {
                removeSelectedCell();
                currentCellY--;
                updateSelectedCell();
            }
            break;
        case 'ArrowRight':
            if (currentCellY < width - 1) {
                removeSelectedCell();
                currentCellY++;
                updateSelectedCell();
            }
            break;
        case 'Enter':
        case ' ':
            if (is_game_over) {
                reset_game();
                return;
            }

            if (!gameStarted || is_game_over) {
                placeBombs(currentCellX, currentCellY);
                bombs_cnt.innerHTML = bombs;
                gameStarted = true;
                is_game_over = false;
                start_timer();
            }

            if (cellMap[currentCellX][currentCellY].classList.contains('game__cell--open') && bombMap[currentCellX][currentCellY] > 0) {
                openSurroundingCells(currentCellX, currentCellY);
            }

            openCell(currentCellX, currentCellY);
            break;
    }
});

game.addEventListener('mousedown', () => {
    smile.innerHTML = '😲';
});

game.addEventListener('mouseup', () => {
    smile.innerHTML = '🙂';
});

smile.addEventListener('mousedown', () => {
    smile.innerHTML = '😲';
});

smile.addEventListener('mouseup', () => {
    smile.innerHTML = '🙂';
});

function openSettings() {
    document.getElementById('settingsModal').style.display = "block";
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = "none";
}

function applySettings() {
    height = parseInt(document.getElementById('height').value);
    width = parseInt(document.getElementById('width').value);
    bombs = parseInt(document.getElementById('bombs').value);
    hollow_cells = height * width - bombs;

    if (height > 30 || width > 30) {
        alert('Число клеток по вертикали и горизонтали не может превышать 30');
        return;
    }

    
    if (bombs >= height * width) {
        alert('Количество мин не может быть больше или равно общему количеству клеток!');
        return;
    }
    
    drawCells();
    reset_game();
    closeSettings();
}