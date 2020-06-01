'use strict'

function renderBoard(board) {
    //The DOM
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var cell = '';
            var srtClass = `class="cell cell-${i}-${j}"`;
            var clickFunctions = `onclick="cellClicked(${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"`;
            if (board[i][j].isShown && board[i][j].isMine) {
                cell = MINE;
            }
            strHTML += `<td ${srtClass} ${clickFunctions}>${cell}</td>`;
        }
        strHTML += '</tr>';
    }
    var elTbody = document.querySelector('.board');
    elTbody.innerHTML = strHTML;
}


function buildBoard(num) {
    //The mat MODEL
    var board = [];
    for (var i = 0; i < num; i++) {
        board[i] = [];
        for (var j = 0; j < num; j++) {
            board[i][j] = creatCellPbject();
        }
    }
    return board;
}

function creatCellPbject() {
    //The MODEL items
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
    return cell;
}

function startTimerAndMines(cellI, cellJ) {
    if (!gGameIntreval) {
        randomPlacingMine(gBoard, gLevel.mines, cellI, cellJ);
        gStartTimer = Date.now();
        gGameIntreval = setInterval(function () {
            gGame.secsPassed = +((Date.now() - gStartTimer) / 1000).toFixed(2);
            gElTimer.innerText = gGame.secsPassed;
        }, 300);
    }
}


function randomPlacingMine(board, maxMine, cellI, cellJ) {
    var countMine = 0;
    while (countMine < maxMine) {
        var ranadI = getRandomInt(0, board.length);
        var ranadJ = getRandomInt(0, board[0].length);
        if (ranadI === cellI && ranadJ === cellJ) continue;
        if (!board[ranadI][ranadJ].isMine) {
            board[ranadI][ranadJ].isMine = true;
            countMine++;
        }
    }
    setMinesNegsCount(board)
    return board;
}


function setMinesNegsCount(board) {
    //Updating the MODEL with mines
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var countNegs = countNeighbors(i, j, board);
            board[i][j].minesAroundCount = countNegs;
        }
    }
    return board;
}


function countNeighbors(cellI, cellJ, board) {
    //Updating the MODEL with sum of neighbors
    var neighborsSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine) neighborsSum++;
        }
    }
    return neighborsSum;
}