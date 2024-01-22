//TETRIS GAME
import './style.css';

// Dimensionamiento del tablero
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const score = document.querySelector('span');
const quitButton = document.getElementById('quit-button');

let audio = null;

const blockSize = 20;
const boardWidth = 14;
const boardHeight = 30;

let scoreV = 0;

canvas.width = blockSize * boardWidth;
canvas.height = blockSize * boardHeight;

context.scale(blockSize, blockSize);

// Módulo: Tablero
const board = createBoard(boardWidth, boardHeight);

function createBoard(width, height) {
  return Array(height).fill().map(() => Array(width).fill(0));
}

// Módulo: Piezas
const piece = {
  position: { x: 5, y: 5 },
  shape: [[1, 1], [1, 1]]
};

const pieces = [
  [[1, 1], [1, 1]],
  [[1, 1, 1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]]
];

// Módulo: Dibujo y actualización del tablero
let drop = 0;
let lastTime = 0;

function refresh(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  drop += deltaTime;

  if (drop > 1000) {
    piece.position.y++;
    drop = 0;

    if (checkCollision()) {
      piece.position.y--;
      createPiece();
      cleanRows();
    }
  }
  draw();
  window.requestAnimationFrame(refresh);
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = 'yellow';
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'red';
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });
  score.innerText = scoreV;
}

// Módulo: Colisión
function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      const newX = x + piece.position.x;
      const newY = y + piece.position.y;

      if (
        value !== 0 &&
        (newX < 0 || newX >= boardWidth || newY >= boardHeight || newY < 0 ||
          board[newY]?.[newX] !== 0)
      ) {
        return true;
      }

      return false;
    });
  });
}

// Módulo: Reinicio de pieza
function resetPiece() {
  piece.position.x = Math.floor(boardWidth / 2 - 2);
  piece.position.y = 0;
  piece.shape = pieces[Math.floor(Math.random() * pieces.length)];

  if (checkCollision()) {
    window.alert('Fin del juego');
    board.forEach((row) => row.fill(0));
  }
}

// Módulo: Crear Pieza (acoplar)
function createPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    });
  });

  resetPiece();
}

// Módulo: Limpiar líneas
function cleanRows() {
  const rowsToDelete = [];

  board.forEach((row, y) => {
    if (row.every(value => value === 1)) {
      rowsToDelete.push(y);
    }
  });

  if (rowsToDelete.length > 0) {
    scoreV += 10 * Math.pow(2, rowsToDelete.length - 1);
  }

  rowsToDelete.forEach(y => {
    board.splice(y, 1);
    const newRow = Array(boardWidth).fill(0);
    board.unshift(newRow);
  });
}

// Módulo: Fin del juego
function endGame() {
  audio.pause();
  board.forEach((row) => row.fill(0));
  scoreV = 0;
  draw();
  refresh();
  window.alert('Juego finalizado');
  window.location.reload();
}

// Módulo: Movimiento de las piezas
document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    piece.position.x--;
    if (checkCollision()) {
      piece.position.x++;
    }
  }

  if (event.key === 'ArrowRight') {
    piece.position.x++;
    if (checkCollision()) {
      piece.position.x--;
    }
  }

  if (event.key === 'ArrowDown') {
    piece.position.y++;
    if (checkCollision()) {
      piece.position.y--;
      createPiece();
      cleanRows();
    }
  }

  if (event.key === 'ArrowUp') {
    const rotated = [];

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = [];

      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i]);
      }
      rotated.push(row);
    }
    const previousShape = piece.shape;
    piece.shape = rotated;
    if (checkCollision()) {
      piece.shape = previousShape;
    }
  }
});

// Evento de clic para el botón de salir
quitButton.addEventListener('click', () => {
  endGame();
});

// Evento de clic para iniciar/reiniciar el juego
document.querySelector('section').addEventListener('click', () => {
  refresh();

  if (!audio) {
    audio = new Audio('./public/Tetris.mp3');
    audio.volume = 0.3;
    audio.addEventListener('ended', () => {
      audio.currentTime = 0.1;
      audio.play();
    });

    audio.play();
  } else {
    endGame();
  }
});

// Evento de clic para el botón de silenciar
const muteButton = document.getElementById('mute-button');

muteButton.addEventListener('click', () => {
  if (audio) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
});
