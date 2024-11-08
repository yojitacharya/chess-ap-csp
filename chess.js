var blockSize = 90;

var rows = 8;
var cols = 8;

var context;
var board;

var gameOver = false;
var whiteWon = false;

var boardView = [];

var difficulty = 0;

var move = 1;
var playerColorWhite = true;

window.onload = function() {
    board = document.getElementById("chessboard");

    board.width = cols * blockSize;
    board.height = rows * blockSize;
    context = board.getContext("2d");

    document.getElementById("hard").onclick = hard();
    document.getElementById("medium").onclick = medium();
    document.getElementById("easy").onclick = easy();

    drawBoard();
}

function drawBoard() {
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, board.width, board.height);
    context.strokeStyle = "#505050";
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if((i + j) % 2 == 0) {
                context.fillStyle = "#FFFFFF";
            } 
            else {
                context.fillStyle = "#000000";
            }
            context.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);
            context.strokeRect(j * blockSize, i * blockSize, blockSize, blockSize);
        }
    }
    context.strokeRect(0, 0, board.width, board.height);
}

function drawPieces() {
    
}




function hard() {
    difficulty = 3;
}

function medium() {
    difficulty = 2;
}
function easy() {
    difficulty = 1;
}
