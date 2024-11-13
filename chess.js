var blockSize = 90;

var rows = 8;
var cols = 8;

var context;
var board;

var gameOver = false;
var whiteWon = false;

var position = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
// Position is set Traditional FEN Notation (FEN)

var pieces = Array.from({ length: rows }, () => Array(cols).fill(null));
// The one (1) line above was written with the assistance of Blackbox AI

var difficulty = 0;

var move = 1;
var playerColorWhite = false;

let selectedPiece = null;
let selectedPiecePosition = null;

let validMoves = [];


window.onload = function() {
    board = document.getElementById("chessboard");

    board.width = cols * blockSize;
    board.height = rows * blockSize;
    context = board.getContext("2d");

    let hard = document.getElementById("hard");
    let medium = document.getElementById("medium");
    let easy = document.getElementById("easy");

    document.getElementById("hard").onclick = hard;
    document.getElementById("medium").onclick = medium;
    document.getElementById("easy").onclick = easy;
    document.getElementById("reset").onclick = reset;

    const difficulty = document.getElementById("difficulty");

    board.addEventListener("click", handleBoardClick);


    drawBoard();
    parseFEN(position);
    drawPieces();
}

function drawBoard(validMoves = [], selectedPiecePosition = null) {
    // Drawing the board
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, board.width, board.height);
    context.strokeStyle = "#000000";
    
    // Alternating between light and dark squares
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if ((i + j) % 2 == 0) {
                context.fillStyle = "#f0d4b4"; // Light square
            } else {
                context.fillStyle = "#c08464"; // Dark square
            }
            // Fill in squares
            context.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);
        }
    }
    context.strokeRect(0, 0, board.width, board.height);

    // Highlight valid moves in red
    validMoves.forEach(([row, col]) => {
        context.fillStyle = "rgba(255, 0, 0, 0.7)";
        context.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
    });

    // Highlight selected piece in orange
    if (selectedPiecePosition) {
        context.fillStyle = "#f58142";
        context.fillRect(selectedPiecePosition[1] * blockSize, selectedPiecePosition[0] * blockSize, blockSize, blockSize);
    }
}

function parseFEN(fen) {
    let ranks = fen.split(' ')[0].split('/');
    for (let i = 0; i < ranks.length; i++) {
        let rank = ranks[i];
        let fileIndex = 0;
        for (let char of rank) {
            if (isNaN(char)) {
                pieces[i][fileIndex] = char; // Set the piece
                fileIndex++;
            } else {
                fileIndex += parseInt(char); // Skip empty squares
            }
        }
    }
}


function drawPieces() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let piece = pieces[i][j];
            if (piece) {
                let pieceImg = new Image();
                if(piece == piece.toLowerCase()) {
                    pieceImg.src = "./Chess_Pieces/" + piece + piece + ".png";
                }
                else{
                    pieceImg.src = "./Chess_Pieces/" + piece + ".png";
                }

                pieceImg.onload = function() {
                    context.drawImage(pieceImg, j * blockSize, i * blockSize, blockSize, blockSize);
                }
            }
        }
    }
}

function handleBoardClick(event) {
    const rect = board.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / blockSize);
    const row = Math.floor(y / blockSize);

    if (selectedPiece) {
        // Attempt to move the piece
        if (isValidMove(selectedPiece, selectedPiecePosition, [row, col])) {
            pieces[row][col] = selectedPiece; // Move the piece
            pieces[selectedPiecePosition[0]][selectedPiecePosition[1]] = null; // Clear the old position

            selectedPiece = null; // Deselect the piece
            validMoves = []; // Clear valid moves
            drawBoard();
            drawPieces();
            move++;
            console.log(move);

        } else {
            // Invalid move, deselect the piece
            selectedPiece = null;
            validMoves = []; // Clear valid moves
            drawBoard();
            drawPieces();
        }
    } else {
        // Select a piece   
        selectedPiece = pieces[row][col];
        selectedPiecePosition = [row, col];

        // Highlight valid moves
        if (selectedPiece) {
            validMoves = getValidMoves(selectedPiece, selectedPiecePosition);
            drawBoard(validMoves, selectedPiecePosition);
            drawPieces();
        }
    }
}

function getValidMoves(piece, position) {
    const validMoves = [];
    const [fromRow, fromCol] = position;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const to = [row, col];
            if (isValidMove(piece, position, to)) {
                validMoves.push(to);
            }
        }
    }

    return validMoves;
}

function isValidMove(piece, from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    if (!piece) return false; // No piece selected
    if (toRow < 0 || toRow >= rows || toCol < 0 || toCol >= cols) return false; // Move out of bounds

    const targetPiece = pieces[toRow][toCol];
    if(targetPiece !== null) {
        if ((targetPiece == targetPiece.toLowerCase() && piece.toLowerCase() == piece) || targetPiece == targetPiece.toUpperCase() && piece.toUpperCase() == piece) {
            return false; // Can't capture your own piece
        }
    }
    if(piece && (move % 2 === 0 && piece === piece.toUpperCase()) || (move % 2 === 1 && piece === piece.toLowerCase())) {
        return false; // Can't move if it's not your turn
    }
    switch (piece.toLowerCase()) {
        case 'p': // Pawn
            return isValidPawnMove(piece, from, to);
        case 'r': // Rook
            return isValidRookMove(from, to);
        case 'n': // Knight
            return isValidKnightMove(from, to);
        case 'b': // Bishop
            return isValidBishopMove(from, to);
        case 'q': // Queen
            return isValidQueenMove(from, to);
        case 'k': // King
            return isValidKingMove(piece, from, to);
        default:
            return false;
    }
}

// Pawn move validation
function isValidPawnMove(piece, from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    const direction = (piece === 'p' ? 1 : -1);
    
    // Normal move (one square forward)
    if (toCol === fromCol && pieces[toRow][toCol] === null) {
        if (toRow === fromRow + direction) return true; // Move forward one square
        // First move can be two squares
        if (fromRow === (piece === 'p' ? 1 : 6) && toRow === fromRow + 2 * direction) {
            return pieces[fromRow + direction][fromCol] === null; // Ensure the square in front is empty
        }
    }

    // Capture
    if ((Math.abs(toCol - fromCol) == 1) && toRow == (fromRow + direction) && pieces[toRow][toCol]!== null) {
        const targetPiece = pieces[toRow][toCol];
        return true; // Ensure there's an opponent's piece
    }
    return false; // Invalid move
}

// Rook move validation
function isValidRookMove(from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    if (fromRow !== toRow && fromCol !== toCol) return false; // Must move in a straight line

    // Check for obstacles
    const stepRow = (toRow - fromRow) === 0 ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
    const stepCol = (toCol - fromCol) === 0 ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);
    let currentRow = fromRow + stepRow;
    let currentCol = fromCol + stepCol;

    while (currentRow !== toRow || currentCol !== toCol) {
        if (pieces[currentRow][currentCol] !== null) return false; // Obstacle found
        currentRow += stepRow;
        currentCol += stepCol;
    }
    return true;
}

// Knight move validation
function isValidKnightMove(from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

// Bishop move validation
function isValidBishopMove(from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    // Must move diagonally
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;

    // Check for obstacles
    const stepRow = (toRow - fromRow) > 0 ? 1 : -1; // Moving down or up
    const stepCol = (toCol - fromCol) > 0 ? 1 : -1; // Moving right or left
    let currentRow = fromRow + stepRow;
    let currentCol = fromCol + stepCol;

    // Move along the diagonal and check if there are any pieces blocking the way
    while (currentRow !== toRow && currentCol !== toCol) {
        if (pieces[currentRow][currentCol] !== null) {
            return false; // An obstacle is found
        }
        currentRow += stepRow;
        currentCol += stepCol;
    }

    return true; // No obstacles found
}

// Queen move validation
function isValidQueenMove(from, to) {
    return isValidRookMove(from, to) || isValidBishopMove(from, to); // Queen can move like, both, rooks, and bishops
}

// King move validation
// King move validation
function isValidKingMove(piece, from, to) {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // King moves one square in any direction
    if (rowDiff > 1 || colDiff > 1 || (rowDiff === 0 && colDiff === 0)) {
        return false; // Invalid move
    }

    // Check if the move puts the king in check
    const kingColor = (piece === piece.toUpperCase() ? 'w' : 'b'); // Determine king's color

    // Temporarily make the move
    const originalPieceAtTarget = pieces[toRow][toCol];
    pieces[toRow][toCol] = piece; // Move the king to the target square
    pieces[fromRow][fromCol] = null; // Clear the original square

    const isInCheck = isSquareUnderAttack(kingColor === 'w' ? 'b' : 'w', to); // Check if the new position is under attack

    // Undo the temporary move
    pieces[fromRow][fromCol] = piece; // Restore the king's original position
    pieces[toRow][toCol] = originalPieceAtTarget; // Restore the target square

    return !isInCheck; // Valid move if the king is not in check after the move
}
function isSquareUnderAttack(color, square) {
    const [targetRow, targetCol] = square;

        // Check if the target square is under attack by pawns first
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let piece = pieces[row][col];
                if (piece && ((color === 'b' && piece === piece.toLowerCase()) || 
                            (color === 'w' && piece === piece.toUpperCase()))) {
                    // Check if the opponent's piece is a pawn
                    if (piece === 'p') { // Black pawn
                        if ((col - 1 === targetCol && row + 1 === targetRow) || 
                            (col + 1 === targetCol && row + 1 === targetRow)) {
                            return true; // Target square is under attack by black pawn
                        }
                    } else if (piece === 'P') { // White pawn
                        if ((col - 1 === targetCol && row - 1 === targetRow) || 
                            (col + 1 === targetCol && row - 1 === targetRow)) {
                            return true; // Target square is under attack by white pawn
                        }
                    }
                    else {
                        if(isValidMove(piece, [row, col], square)) {
                            return true; // The square is under attack
                    }
                }
            }
        }
    }
    return false; // The square is not under attack
}
function isSquareDefended(color, square) {
    const [targetRow, targetCol] = square;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const piece = pieces[row][col];
            if (piece && ((color === 'b' && piece === piece.toLowerCase()) || 
                           (color === 'w' && piece === piece.toUpperCase()))) {
                const fromPosition = [row, col];
                if (isValidMove(piece, fromPosition, square)) {
                    return true; // The square is defended
                }
            }
        }
    }

    return false; // The square is not defended
}
function isKingInCheck(color, kingSquare) {

    return isSquareUnderAttack((color === 'w' ? 'b' : 'w'), kingSquare);
}

function isKingMated(color, square) {
    const kingMoves = getValidMoves(kingColor, kingSquare); // Get all possible moves for the king
    if(!kingMoves.length) {
        return true; // The king can't move
    }
    else {
        return false;
    }
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
function reset() {
    location.reload();
}
