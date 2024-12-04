let height = 12;
let width = 12;
let bombs = 20;
let hollow_cells = height * width - bombs;

let bombMap = [];
let cellMap = [];
let gameStarted = false;
let game = document.querySelector('.game');
let game_result_container = document.querySelector('.game_result_container');
let reset_game_button = document.querySelector('.reset_game')
let smile = document.querySelector('.smile');
let timer = document.querySelector('.timer');
let bombs_cnt = document.querySelector('.bombs');

let volumeDisplay = document.querySelector('.volumeDisplay')
let volumeSlider = document.querySelector('.explosionVolume');
let sound_icon = document.querySelector('.soundIcon');

let explosionSound = new Audio('sounds/explosion.mp3');
let winSound = new Audio('sounds/win.mp3');
let startSound = new Audio('sounds/start.mp3');
let clickSound = new Audio('sounds/click.mp3');
let flagTickSound = new Audio('sounds/flag_tick.mp3');
let flagRemoveSound = new Audio('sounds/flag_remove.mp3');
let settingsSound = new Audio('sounds/settings.mp3')

let soundsMap = [explosionSound, winSound, startSound, clickSound, flagRemoveSound, flagTickSound, settingsSound]
explosionSound.volume = 0.04;
winSound.volume = 0.04;
startSound.volume = 0.04;
clickSound.volume = 0.04;
flagTickSound.volume = 0.04;
flagRemoveSound.volume = 0.04;
settingsSound.volume = 0.04;

let toggleSoundButton = document.querySelector('.toggle_sound_button');

let is_game_over = false;
let bomb_label = -1;
let opened_cells = 0;
let founded_bombs = 0;
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

let is_animating = false;

let error_field = document.querySelector('.error_field')
    
function drawCells() {
    playSound(startSound);
    const scale = window.devicePixelRatio;
    let width1 = 60/scale;
    let width2 = 30/scale;
    game.style.gridTemplateColumns = (height < 20 && width < 20) ? `repeat(${width}, ${width1}px)` : `repeat(${width}, ${width2}px)`
    let class_name = (height < 20 && width < 20) ? "game__cell" : "game__cell--mini";


    for (let x = 0; x < height; x++) {
        let bombRow = [];
        let cellRow = [];
        for (let y = 0; y < width; y++) {
            let cell = document.createElement('div');
            cell.classList.add(class_name);

            if (class_name === 'game__cell--mini') {
                cell.style.width = `${width2}px`;
                cell.style.height = `${width2}px`;
                cell.style.fontSize = `${1.2}rem`;
            } else {
                cell.style.width = `${width1}px`
                cell.style.height = `${width1}px`
                cell.style.fontSize = `${1.5}rem`;
            }

            cell.dataset.x = x;
            cell.dataset.y = y;
            game.append(cell);
            bombRow.push(0);
            cellRow.push(cell);
        }
        bombMap.push(bombRow);
        cellMap.push(cellRow);
    }
    const gameResult = document.querySelector('.game_result');
    const parentWidth = game_result_container.offsetWidth;
    gameResult.style.fontSize = `${parentWidth / 12}px`;
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

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

function updateVolume(volume) {
    soundsMap.forEach((sound) => {
        sound.volume = volume
    })

    volumeDisplay.textContent = `${Math.round(volume * 100)}%`;
}

volumeSlider.addEventListener('input', () => {
    last_volume = volumeSlider.value;
    if (volumeSlider.value != 0) {
        sound_icon.src = "images/sound.png";
        toggleSoundButton.value = 1;
        toggleSoundImage();
    } else {
        toggleSoundButton.value = '0';
        toggleSoundImage();
        sound_icon.src = 'images/mute_sound.png'
    }
    let volume = volumeSlider.value;
    updateVolume(volume);
});

function createImage(src) {
    let element = new Image();
    element.src = src;
    return element;
}

function visualizeBomb(cell) {
    let bomb_element = createImage('images/мина.png');
    bomb_element.classList.add('bomb-image');
    cell.append(bomb_element);

    let explosion_gif = new Image();
    explosion_gif.src = "images/explosion.gif";
    explosion_gif.classList.add('explosion_gif');
    cell.append(explosion_gif)
    setTimeout(() => {
        explosion_gif.remove();
    }, 390);

    let crash_number = Math.floor(Math.random() * 3) + 1;
    let earth_crashed = createImage(`images/crashed_earth${crash_number}.png`);
    earth_crashed.classList.add("crashed_earth");

    let darkening = document.createElement('div');
    darkening.classList.add('darkening-effect');

    cell.append(darkening);
    cell.append(earth_crashed)

    let explosion = document.createElement('div');
    explosion.classList.add('explosion');
    let rect = cell.getBoundingClientRect();

    explosion.style.left = `${rect.left + window.scrollX + rect.width / 2 - 25}px`;
    explosion.style.top = `${rect.top + window.scrollY + rect.height / 2 - 25}px`;

    document.body.appendChild(explosion);

    setTimeout(() => explosion.remove(), 700);
}
function game_lose() {
    is_animating = true;
    is_game_over = true;
    smile.innerHTML = '😵';
    game_result_container.querySelector('.game_result').style.visibility = 'visible';
    game_result_container.querySelector('.game_result').style.color = 'red';
    game_result_container.querySelector('.game_result').innerHTML = 'Вы проиграли!';
    clearInterval(timerInterval);

    
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
            if (!is_animating) return;
            
            let bomb_count = 0;
            
            diagonal.forEach(({ x, y }) => {
                const cell = cellMap[x][y];
                const value = bombMap[x][y];
                
                cell.classList.add('game__cell--lose__anim');

                setTimeout(() => {
                    if (!is_animating) return;

                    if (value === bomb_label) {
                        bomb_count++;
                        if (cell.classList.contains('game__cell--flag')) {
                            cell.textContent = ''
                        }
                        if (!cell.classList.contains('game__cell--bomb')) {
                            visualizeBomb(cell)
                        }

                        cell.classList.add('game__cell--bomb');
                        
                        playSound(explosionSound);
                        
                    } else {
                        cell.classList.add('game__cell--lose');
                        if (cell.classList.contains('game__cell--flag')) {
                            cell.textContent = '';
                            let container = document.createElement('div');

                            container.classList.add('mine-container');

                            let bomb_element = createImage('images/мина.png');
                            bomb_element.classList.add('bomb-image');
                            container.append(bomb_element);

                            let cross = document.createElement('span');
                            cross.textContent = '❌';
                            container.append(cross);

                            cell.append(container);
                        }
                        else if (value > 0) {
                            cell.textContent = value;
                            cell.style.color = value_colors[value];
                        } else {
                            cell.textContent = '';
                        }
                    }
                }, 300);
            });
            
            
            setTimeout(() => {
                if (bomb_count > 0) {
                    const duration = Math.min(1.5 / bomb_count, 1.5);
    
                    game.classList.add('screen-shake');
                    game.style.setProperty('--explosion_duration', `${duration}s`)
    
                    setTimeout(() => {
                        game.classList.remove('screen-shake');
                    }, duration * 1000);
                }
            }, diagonal.length * 120)
        }, i * 200);
    });

    setTimeout(() => {
        is_animating = false;
    }, (diagonals.length+1) * 200);
}




function game_win() {
    clearInterval(timerInterval);
    playSound(winSound);
    for (let x = 0; x < height; x++) {
        for (let y = 0; y < width; y++) {
            if (bombMap[x][y] == bomb_label) {
                if (cellMap[x][y].classList.contains('game__cell--flag')) cellMap[x][y].textContent = '';
                bomb_element = createImage('images/мина.png');
                bomb_element.classList.add('bomb-image');

                cellMap[x][y].append(bomb_element);
                cellMap[x][y].classList.add('game__cell--bomb--win');
            } else {
                cellMap[x][y].classList.add('game__cell--win');
            }
        }
    }

    triggerConfetti();

    is_game_over = true;
    smile.innerHTML = '🥳';
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
    is_animating = false;

    opened_cells = 0;
    founded_bombs = 0;
    bombMap = [];
    cellMap = [];
    gameStarted = false;
    is_game_over = false;
    timeElapsed = 0;

    bombs_cnt.querySelector('.mine_counter').innerHTML = bombs;

    game.innerHTML = '';
    game_result_container.querySelector('.game_result').style.visibility = 'hidden';
    smile.innerHTML = '🙂';
    clear_timer();
    drawCells();
    resetSelectedCell();

    reset_game_button.blur();
}

function start_timer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        timer.querySelector('.time_counter').innerHTML = timeElapsed;
    }, 1000);
}

function clear_timer() {
    clearInterval(timerInterval);
    timer.querySelector('.time_counter').innerHTML = timeElapsed;
}

function openCell(x, y, is_recursive_call=false) {
    let cell = cellMap[x][y];
    if (cell.classList.contains('game__cell--open') || cell.classList.contains('game__cell--flag')) return;

    cell.classList.add('game__cell--open');
    let value = bombMap[x][y];

    if (value === bomb_label && !is_recursive_call) {
        visualizeBomb(cell)
        cell.classList.add('game__cell--bomb');
        cell.style.backgroundColor = 'red';
        playSound(explosionSound);
        game_lose();
        return;

    } else if (value > 0) {
        playSound(clickSound);
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
        bombs_cnt.querySelector('.mine_counter').innerHTML = parseInt(bombs_cnt.querySelector('.mine_counter').innerHTML) + 1;
        playSound(flagRemoveSound);
    } else if (bombs_cnt.querySelector('.mine_counter').innerHTML == 0) return; else {
        bombs_cnt.querySelector('.mine_counter').innerHTML = parseInt(bombs_cnt.querySelector('.mine_counter').innerHTML) - 1;
        playSound(flagTickSound);
    }
    cell.classList.toggle('game__cell--flag');
    cell.textContent = cell.classList.contains('game__cell--flag') ? '🚩' : '';
}

drawCells();

game.addEventListener('click', (e) => {
    if (is_animating) return;

    if (is_game_over) {
        reset_game();
        return;
    }
    
    let cell = e.target;
    if (!cell.classList.contains('game__cell') && !cell.classList.contains('game__cell--mini')) return;


    let x = parseInt(cell.dataset.x);
    let y = parseInt(cell.dataset.y);

    if (!gameStarted || is_game_over) {
        placeBombs(x, y);
        bombs_cnt.querySelector('.mine_counter').innerHTML = bombs;
        gameStarted = true;
        is_game_over = false;
        start_timer();
    }
    removeSelectedCell();
    currentCellX = x;
    currentCellY = y;
    updateSelectedCell();

    if (!cell.classList.contains('game__cell--open')) openCell(x, y);
    else if (bombMap[x][y] > 0) openSurroundingCells(x, y);
});

game.addEventListener('contextmenu', (e) => {
    if (is_animating) return;

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

document.addEventListener('keydown', (e) => {
    if (is_animating) return;

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
                bombs_cnt.querySelector('.mine_counter').innerHTML = bombs
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
    if (is_game_over) {
        smile.innerHTML = '😵';
        return;
    }
    smile.innerHTML = '🙂';
});

smile.addEventListener('mousedown', () => {
    smile.innerHTML = '😲';
});

let last_smile = "";

smile.addEventListener('mouseover', () => {
    last_smile = smile.innerHTML;
    smile.innerHTML = '🤨';
});

smile.addEventListener('mouseout', () => {
    smile.innerHTML = is_game_over ? last_smile : "🙂";
});

function openSettings() {
    playSound(settingsSound);
    let modal = document.querySelector('.settings-modal');

    const container = document.querySelector('.game_container');
    const containerRect = container.getBoundingClientRect();

    modal.style.display = "block";
    modal.style.width = `${containerRect.width}px`;
    modal.style.height = `${containerRect.height}px`;
    modal.style.top = `${containerRect.top}px`;
    modal.style.left = `${containerRect.left}px`;
}

function toggleSoundImage() {
    var src;

    if (toggleSoundButton.value !== '1') {
        src = "images/mute_sound.png";
    } else {
        src = "images/sound.png";
    }
    newImage = createImage(src);
    toggleSoundButton.innerHTML = '';
    toggleSoundButton.appendChild(newImage);
}

let last_volume;
function toggleSound() {
    playSound(clickSound);
    if (toggleSoundButton.value === '1') {
        toggleSoundButton.value = 0;

        soundsMap.forEach((sound) => {
            sound.volume = 0;
        })

        last_volume = volumeSlider.value;
        volumeSlider.value = 0;
        sound_icon.src = "images/mute_sound.png";
        updateVolume(0);
    } else {
        toggleSoundButton.value = 1;
        
        volumeSlider.value = last_volume;
        updateVolume(last_volume);
        
        soundsMap.forEach((sound) => {
            sound.volume = volumeSlider.value;
        })
        sound_icon.src = "images/sound.png";
    }
    toggleSoundImage();

}

function closeSettings() {
    playSound(clickSound);
    document.querySelector('.settings-modal').style.display = "none";
}

function toggleCustomFields() {
    let difficulty = document.querySelector('.difficulty').value;
    let customSettings = document.querySelector('.customSettings');

    if (difficulty === 'custom') {
        customSettings.style.display = 'block';
    } else {
        customSettings.style.display = 'none';
    }
}

function make_error(error) {
    error_field.innerHTML = error;
    error_field.style.display = 'block';

    setTimeout(() => {
        error_field.style.display = 'none';
    }, 5000);
}
function applySettings() {
    playSound(clickSound);
    let difficulty = document.querySelector('.difficulty').value;

    if (difficulty === 'easy') {
        height = 8;
        width = 8;
        bombs = 10;
    } else if (difficulty === 'medium') {
        height = 12;
        width = 12;
        bombs = 20;
    } else if (difficulty === 'hard') {
        height = 16;
        width = 16;
        bombs = 40;
    } else if (difficulty === 'custom') {
        let height_ = parseInt(document.querySelector('.height').value);
        let width_ = parseInt(document.querySelector('.width').value);
        let bombs_ = parseInt(document.querySelector('.bombs_number').value);

        if (isNaN(height_) || isNaN(width_) || isNaN(bombs_)) {
            make_error('Некорректные введенные значения');
            return;
        }

        width = width_;
        height = height_;
        bombs = bombs_;

        if (height < 8 || width < 8) {
            make_error('Число клеток по вертикали и горизонтали не может быть меньше 8')
            return;
        }
        if (height > 30 || width > 30) {
            make_error('Число клеток по вертикали и горизонтали не может превышать 30');
            return;
        }

        if (bombs >= (height * width) * 0.9) {
            make_error('Количество мин не может быть таким большим!')
            return;
        }
    }

    hollow_cells = height * width - bombs;

    drawCells(); 
    reset_game();

    closeSettings();
}