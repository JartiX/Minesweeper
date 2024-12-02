let width = 12;
let height = 12;
let bombs = 20;
let hollow_cells = width * height - bombs;


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

function drawCells() {
    game.style.gridTemplateColumns = (width <= 20 && height <= 20) ? `repeat(${height}, 40px)` : `repeat(${height}, 20px)`
    let class_name = (width <= 20 && height <= 20) ? "game__cell" : "game__cell--mini";

    for (let x = 0; x < width; x++) {
        let bombRow = [];
        let cellRow = [];
        for (let y = 0; y < height; y++) {
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
        let rx = Math.floor(Math.random() * width);
        let ry = Math.floor(Math.random() * height);

        if (Math.abs(rx - firstClickX) <= 1 && Math.abs(ry - firstClickY) <= 1) continue;

        if (!bombMap[rx][ry]) {
            bombMap[rx][ry] = bomb_label;
            placedBombs++;
        }
    }

    calculateNumbers();
}

function calculateNumbers() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (bombMap[x][y] === bomb_label) continue;

            let count = 0;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let nx = x + dx;
                    let ny = y + dy;
                    if (nx >= 0 && ny >= 0 && nx < width && ny < height && bombMap[nx][ny] === bomb_label) {
                        count++;
                    }
                }
            }
            bombMap[x][y] = count;
        }
    }
}

function game_lose() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (bombMap[x][y] == bomb_label) {
                cellMap[x][y].textContent = '💣';
                cellMap[x][y].classList.add('game__cell--bomb');
            }
        }
    }
    is_game_over = true;
    smile.innerHTML = '😵';
    clearInterval(timerInterval);
    game_result_container.querySelector('.game_result').style.visibility = 'visible';
    game_result_container.querySelector('.game_result').style.color = 'red';
    game_result_container.querySelector('.game_result').innerHTML = 'Вы проиграли!';
}

function game_win() {
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (bombMap[x][y] == bomb_label) {
                cellMap[x][y].textContent = '💣';
                cellMap[x][y].classList.add('game__cell--bomb--win');
            } else {
                cellMap[x][y].classList.add('game__cell--win');
            }
        }
    }
    is_game_over = true;
    smile.innerHTML = '🥳';
    clearInterval(timerInterval);
    game_result_container.querySelector('.game_result').style.visibility = 'visible';
    game_result_container.querySelector('.game_result').style.color = 'green';
    game_result_container.querySelector('.game_result').innerHTML = 'Вы выиграли!';
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
                if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
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

    openCell(x, y);
});

game.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    let cell = e.target;
    if (!cell.classList.contains('game__cell')) return;

    let x = parseInt(cell.dataset.x);
    let y = parseInt(cell.dataset.y);
    toggleFlag(x, y);
});

game.addEventListener('mousedown', () => {
    smile.innerHTML = '😲';
});

game.addEventListener('mouseup', () => {
    smile.innerHTML = '🙂';
});

function openSettings() {
    document.getElementById('settingsModal').style.display = "block";
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = "none";
}

function applySettings() {
    width = parseInt(document.getElementById('width').value);
    height = parseInt(document.getElementById('height').value);
    bombs = parseInt(document.getElementById('bombs').value);
    hollow_cells = width * height - bombs;

    if (width > 50 || height > 50) {
        alert('Число клеток по вертикали и горизонтали не может превышать 50');
        return;
    }

    
    if (bombs >= width * height) {
        alert('Количество мин не может быть больше или равно общему количеству клеток!');
        return;
    }
    
    drawCells();
    reset_game();
    closeSettings();
}