'use strict'

const MINE = '💣';
const FLAG = '🚩';
const SMILEYS = ['😀', '😱', '😜']

var gBoard;
var gLevel = { size: 4, mines: 2 };
var gGame;
var gGameIntreval;
var gStartTimer;
var gElTimer = document.querySelector('.timer');
var gSafeClickCount = 3;
var gBestScore = window.localStorage;


function initGame() {
    document.querySelector('.smiley').innerHTML = SMILEYS[0];
    gBoard = buildBoard(gLevel.size);
    gGame = { isOn: true, shownCount: 0, markedCount: 0, secsPassed: 0, lives: 3 };
    gSafeClickCount = 3;
    clearInterval(gGameIntreval);
    gGameIntreval = null;
    gStartTimer = null;
    setupLives();
    gElTimer.innerHTML = 0;
    document.querySelector('.safe').innerHTML = gSafeClickCount
    renderBoard(gBoard);
}


function expandShown(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i < 0 || i >= gBoard.length) continue;
            if (j < 0 || j >= gBoard[cellI].length) continue;
            if (gBoard[i][j].isMine) continue;
            if (!gBoard[i][j].isShown) {
                renderCell(i, j)
                if (gBoard[i][j].minesAroundCount === 0) {
                    expandShown(i, j);
                }
            }
        }
    }
}


function renderCell(cellI, cellJ) {
    var className = `cell-${cellI}-${cellJ}`;
    var elTd = document.querySelector(`.${className}`);
    var cell = gBoard[cellI][cellJ];
    if (cell.minesAroundCount > 0) elTd.innerText = gBoard[cellI][cellJ].minesAroundCount;
    //update MODEL
    cell.isShown = true;
    gGame.shownCount++;
    //update DOM
    elTd.classList.add('color');
    //console.log(elTd);
}

function boardSize(elButton) {
    var boardSize = elButton.innerText;
    switch (boardSize) {
        case 'Small':
            gLevel.size = 4;
            gLevel.mines = 2;
            gBestScore.clear()
            initGame()
            break;
        case 'Medium':
            gLevel.size = 8;
            gLevel.mines = 12;
            gBestScore.clear()
            initGame()
            break;
        case 'Large':
            gLevel.size = 12;
            gLevel.mines = 30;
            gBestScore.clear()
            initGame()
            break;
    }
}

function setupLives() {
    //Updating the lives on the DOM
    var livesContainer = document.querySelector('.lives-container');
    var strHTML = '<p class="lives">❤️</p>';
    strHTML.repeat(3);
    livesContainer.innerHTML = strHTML;
}

function cellClicked(cellI, cellJ) {
    startTimerAndMines(cellI, cellJ);
    var cell = gBoard[cellI][cellJ];

    if (!cell.isMine) {
        (cell.minesAroundCount !== 0) ? renderCell(cellI, cellJ) : expandShown(cellI, cellJ);
        checkGameOver();
    } else {
        if (gGame.lives > 0) {
            document.querySelector('.board-container').classList.toggle('animate__headShake');
            var gameLives = document.querySelectorAll('.lives');
            if (gameLives) gameLives[0].remove();
            gGame.lives--;
            var cellSow = document.querySelector(`.cell-${cellI}-${cellJ}`);
            cellSow.innerHTML = MINE;
            setTimeout(function () {
                cellSow.innerHTML = ' ';
                document.querySelector('.board-container').classList.toggle('animate__headShake');
            }, 1000);
        } else {
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[i].length; j++) {
                    if (gBoard[i][j].isMine) {
                        var cellSow = document.querySelector(`.cell-${i}-${j}`);
                        cellSow.innerHTML = MINE;
                    }
                }
                gGame.isOn = false;
                console.log('You losed!')
                gameOver();
            }
        }
        document.querySelector('.smiley').innerHTML = SMILEYS[1];
    }
}

function safeClick(elBtn) {
    if (gSafeClickCount === 0) return;
    elBtn.disabled = true;
    var isReleventCellFound = false;
    var cell;
    while (!isReleventCellFound) {
        var ranadI = getRandomInt(0, gBoard.length);
        var ranadJ = getRandomInt(0, gBoard[0].length);
        cell = gBoard[ranadI][ranadJ];
        if (!cell.isShown && !cell.isMine) isReleventCellFound = true
    }

    var classCell = `cell-${ranadI}-${ranadJ}`;
    document.querySelector(`.${classCell}`).setAttribute("style", "background-color: #ffd2b4");
    setTimeout(function () {
        document.querySelector(`.${classCell}`).removeAttribute("style", "background-color: #ffd2b4");
        elBtn.disabled = false;
    }, 1500);
    gSafeClickCount--;
    document.querySelector('.safe').innerHTML = gSafeClickCount;
}


function cellMarked(elCell, i, j) {
    startTimerAndMines();
    var cell = gBoard[i][j];

    if (cell.isMarked) {
        //update MODEL
        cell.isMarked = false;
        gGame.markedCount--;
        //mark on page update DOM
        elCell.innerText = '';
    } else {
        //update MODEL
        cell.isMarked = true;
        gGame.markedCount++;
        //mark on page update DOM
        elCell.innerText = FLAG;
        checkGameOver();
    }
}


function checkGameOver() {
    var showCount = gGame.shownCount;
    var marketCount = gGame.markedCount;
    var sumGamePices = gLevel.size * gLevel.size;
    if (showCount + marketCount === sumGamePices && marketCount === gLevel.mines) {
        gGame.isOn = false;
        //Setup localStorage
        if (!gBestScore.getItem('bestScore')) {
            gBestScore.setItem('bestScore', gGame.secsPassed);
            document.querySelector('.score').innerHTML = gGame.secsPassed;
        } else {
            var bestTime = +localStorage.getItem('bestScore');
            if (gGame.secsPassed < bestTime) {
                bestTime = gGame.secsPassed;
                //updating localStorage
                gBestScore.setItem('bestScore', bestTime)
                document.querySelector('.score').innerHTML = bestTime;
            }
        }
        clearInterval(gGameIntreval);
        gGameIntreval = null;
        document.querySelector('.smiley').innerHTML = SMILEYS[2];
        console.log('You won');
        gameOver();
    }
}

function gameOver() {
    if (!gGame.isOn) {
        var cells = document.querySelectorAll('.cell');
        for (var i = 0; i < cells.length; i++) {
            cells[i].removeAttribute('onclick');
            cells[i].removeAttribute('oncontextmenu');
        }
        clearInterval(gGameIntreval);
        gGameIntreval = null;
    }
}