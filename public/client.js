// Chess Game Client

let ws = null;
let gameId = null;
let playerColor = null;
let selectedSquare = null;
let possibleMoves = [];
let board = null;
let currentGameState = null;
let pendingPromotion = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeBoard();
  setupEventListeners();
});

function initializeBoard() {
  const chessboard = document.getElementById('chessboard');
  chessboard.innerHTML = '';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
      square.dataset.row = row;
      square.dataset.col = col;
      square.addEventListener('click', () => handleSquareClick(row, col));
      chessboard.appendChild(square);
    }
  }
}

function setupEventListeners() {
  document.getElementById('createGameBtn').addEventListener('click', createGame);
  document.getElementById('joinGameBtn').addEventListener('click', showJoinModal);
  document.getElementById('playAIWhiteBtn').addEventListener('click', () => playWithAI('white'));
  document.getElementById('playAIBlackBtn').addEventListener('click', () => playWithAI('black'));
  document.getElementById('joinGameConfirmBtn').addEventListener('click', joinGame);
  document.getElementById('gameIdInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinGame();
  });
  
  document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('joinModal').classList.add('hidden');
  });
  
  // Promotion pieces
  document.querySelectorAll('.promotion-piece').forEach(piece => {
    piece.addEventListener('click', () => {
      if (pendingPromotion) {
        completeMove(pendingPromotion.fromRow, pendingPromotion.fromCol, 
                    pendingPromotion.toRow, pendingPromotion.toCol, 
                    piece.dataset.piece);
      }
    });
  });
}

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('Connected to server');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleServerMessage(data);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateStatus('Connection error. Please refresh the page.');
  };
  
  ws.onclose = () => {
    console.log('Disconnected from server');
    updateStatus('Disconnected from server. Please refresh the page.');
  };
}

function handleServerMessage(data) {
  switch (data.type) {
    case 'gameCreated':
      gameId = data.gameId;
      playerColor = data.color;
      updateGameInfo(`Game ID: ${gameId} | You are playing as ${playerColor}`);
      renderBoard(data);
      break;
      
    case 'gameJoined':
      gameId = data.gameId;
      playerColor = data.color;
      updateGameInfo(`Game ID: ${gameId} | You are playing as ${playerColor}`);
      renderBoard(data);
      break;
      
    case 'playerJoined':
      updateStatus('Opponent joined! Game starting...');
      break;
      
    case 'gameState':
      renderBoard(data);
      updateGameStatus(data.gameStatus);
      break;
      
    case 'error':
      updateStatus(`Error: ${data.message}`);
      break;
  }
}

function createGame() {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connectWebSocket();
    setTimeout(() => createGame(), 100);
    return;
  }
  
  ws.send(JSON.stringify({ type: 'createGame' }));
  updateStatus('Game created! Waiting for opponent...');
}

function showJoinModal() {
  document.getElementById('joinModal').classList.remove('hidden');
}

function joinGame() {
  const gameIdInput = document.getElementById('gameIdInput').value.trim();
  if (!gameIdInput) {
    alert('Please enter a game ID');
    return;
  }
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connectWebSocket();
    setTimeout(() => joinGame(), 100);
    return;
  }
  
  ws.send(JSON.stringify({ type: 'joinGame', gameId: gameIdInput }));
  document.getElementById('joinModal').classList.add('hidden');
  document.getElementById('gameIdInput').value = '';
  updateStatus('Joining game...');
}

function playWithAI(color) {
  const aiLevel = document.getElementById('aiLevel').value;
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    connectWebSocket();
    setTimeout(() => playWithAI(color), 100);
    return;
  }
  
  ws.send(JSON.stringify({ 
    type: 'playWithAI', 
    color: color,
    aiLevel: aiLevel 
  }));
  updateStatus(`Starting game with AI (${aiLevel}) as ${color}...`);
}

function handleSquareClick(row, col) {
  if (!currentGameState || currentGameState.turn !== playerColor) {
    return;
  }
  
  if (currentGameState.gameStatus !== 'active') {
    return;
  }
  
  const piece = currentGameState.board[row][col];
  
  // If clicking on a possible move
  const possibleMove = possibleMoves.find(m => m.row === row && m.col === col);
  if (possibleMove && selectedSquare) {
    if (piece && piece.type === 'pawn' && (row === 0 || row === 7)) {
      // Show promotion modal
      pendingPromotion = {
        fromRow: selectedSquare.row,
        fromCol: selectedSquare.col,
        toRow: row,
        toCol: col
      };
      showPromotionModal();
    } else {
      completeMove(selectedSquare.row, selectedSquare.col, row, col);
    }
    return;
  }
  
  // If clicking on own piece
  if (piece && piece.color === playerColor) {
    selectedSquare = { row, col };
    updatePossibleMoves();
    return;
  }
  
  // Deselect
  selectedSquare = null;
  possibleMoves = [];
  updatePossibleMoves();
}

function updatePossibleMoves() {
  // Clear previous highlights
  document.querySelectorAll('.square').forEach(square => {
    square.classList.remove('selected', 'possible-move', 'possible-capture');
  });
  
  if (!selectedSquare) return;
  
  // Highlight selected square
  const selectedEl = document.querySelector(`[data-row="${selectedSquare.row}"][data-col="${selectedSquare.col}"]`);
  if (selectedEl) selectedEl.classList.add('selected');
  
  // Get legal moves for selected piece
  const piece = currentGameState.board[selectedSquare.row][selectedSquare.col];
  if (!piece || piece.color !== playerColor) return;
  
  // Calculate legal moves (simplified - in production, get from server)
  possibleMoves = getLegalMovesForPiece(selectedSquare.row, selectedSquare.col);
  
  // Highlight possible moves
  possibleMoves.forEach(move => {
    const targetPiece = currentGameState.board[move.row][move.col];
    const squareEl = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
    if (squareEl) {
      if (targetPiece) {
        squareEl.classList.add('possible-capture');
      } else {
        squareEl.classList.add('possible-move');
      }
    }
  });
}

function getLegalMovesForPiece(row, col) {
  // Calculate possible moves based on piece type
  const piece = currentGameState.board[row][col];
  if (!piece) return [];
  
  const moves = [];
  const { type, color } = piece;
  
  // Simple move generation for UI feedback
  // Full validation happens on server
  switch (type) {
    case 'pawn':
      const direction = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;
      
      // Forward moves
      if (!currentGameState.board[row + direction]?.[col]) {
        moves.push({ row: row + direction, col });
        if (row === startRow && !currentGameState.board[row + 2 * direction]?.[col]) {
          moves.push({ row: row + 2 * direction, col });
        }
      }
      
      // Captures
      for (const dcol of [-1, 1]) {
        const targetRow = row + direction;
        const targetCol = col + dcol;
        const target = currentGameState.board[targetRow]?.[targetCol];
        if (target && target.color !== color) {
          moves.push({ row: targetRow, col: targetCol });
        }
      }
      break;
      
    case 'knight':
      const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [drow, dcol] of offsets) {
        const newRow = row + drow;
        const newCol = col + dcol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = currentGameState.board[newRow][newCol];
          if (!target || target.color !== color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
      break;
      
    case 'bishop':
    case 'rook':
    case 'queen':
      const directions = type === 'bishop' ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
                        type === 'rook' ? [[-1, 0], [1, 0], [0, -1], [0, 1]] :
                        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      
      for (const [drow, dcol] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + drow * i;
          const newCol = col + dcol * i;
          if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break;
          
          const target = currentGameState.board[newRow][newCol];
          if (!target) {
            moves.push({ row: newRow, col: newCol });
          } else {
            if (target.color !== color) {
              moves.push({ row: newRow, col: newCol });
            }
            break;
          }
        }
      }
      break;
      
    case 'king':
      const kingOffsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
      for (const [drow, dcol] of kingOffsets) {
        const newRow = row + drow;
        const newCol = col + dcol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = currentGameState.board[newRow][newCol];
          if (!target || target.color !== color) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
      break;
  }
  
  return moves;
}

function isKingInCheck(boardState, color) {
  // Find king
  let kingRow = -1, kingCol = -1;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState.board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        kingRow = row;
        kingCol = col;
        break;
      }
    }
    if (kingRow !== -1) break;
  }
  
  if (kingRow === -1) return false;
  
  // Check if any opponent piece can attack the king
  const opponentColor = color === 'white' ? 'black' : 'white';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState.board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getLegalMovesForPiece(row, col);
        if (moves.some(m => m.row === kingRow && m.col === kingCol)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function completeMove(fromRow, fromCol, toRow, toCol, promotion = 'queen') {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  
  ws.send(JSON.stringify({
    type: 'makeMove',
    fromRow,
    fromCol,
    toRow,
    toCol,
    promotion
  }));
  
  selectedSquare = null;
  possibleMoves = [];
  pendingPromotion = null;
  hidePromotionModal();
  updateStatus('Move sent...');
}

function showPromotionModal() {
  document.getElementById('promotionModal').classList.remove('hidden');
}

function hidePromotionModal() {
  document.getElementById('promotionModal').classList.add('hidden');
}

function renderBoard(boardState) {
  if (!boardState) {
    console.error('No board state provided');
    return;
  }
  
  currentGameState = boardState;
  board = boardState.board;
  
  // Clear board
  document.querySelectorAll('.square').forEach(square => {
    square.innerHTML = '';
    square.classList.remove('check');
  });
  
  // Render pieces
  if (!board || !Array.isArray(board)) {
    console.error('Invalid board state:', boardState);
    return;
  }
  
  for (let row = 0; row < 8; row++) {
    if (!board[row] || !Array.isArray(board[row])) {
      console.error(`Invalid board row ${row}:`, board[row]);
      continue;
    }
    
    for (let col = 0; col < 8; col++) {
      const piece = board[row] ? board[row][col] : null;
      const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
      
      if (!square) {
        console.error(`Square not found for row ${row}, col ${col}`);
        continue;
      }
      
      if (piece && piece.type && piece.color) {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'piece';
        const svg = getPieceSVG(piece.type, piece.color);
        if (svg) {
          pieceDiv.innerHTML = svg;
          square.appendChild(pieceDiv);
        }
      }
      
      // Highlight check
      if (piece && piece.type === 'king') {
        const kingColor = piece.color;
        if (boardState.turn === kingColor && isKingInCheck(boardState, kingColor)) {
          square.classList.add('check');
        }
      }
    }
  }
  
  // Update turn indicator
  const turnIndicator = document.getElementById('turnIndicator');
  turnIndicator.textContent = `Current turn: ${boardState.turn}`;
  turnIndicator.className = `turn-indicator ${boardState.turn}`;
  
  // Update possible moves if square is selected
  if (selectedSquare) {
    updatePossibleMoves();
  }
  
  // Clear selection if not player's turn
  if (boardState.turn !== playerColor) {
    selectedSquare = null;
    possibleMoves = [];
    updatePossibleMoves();
  }
}

function updateGameStatus(status) {
  const statusText = document.getElementById('statusText');
  
  if (!currentGameState) return;
  
  switch (status) {
    case 'checkmate':
      statusText.textContent = `Checkmate! ${currentGameState.turn === 'white' ? 'Black' : 'White'} wins!`;
      statusText.style.color = '#ff4757';
      break;
    case 'stalemate':
      statusText.textContent = 'Stalemate! Game is a draw.';
      statusText.style.color = '#ffa502';
      break;
    case 'active':
      const inCheck = isKingInCheck(currentGameState, currentGameState.turn);
      if (inCheck) {
        statusText.textContent = `${currentGameState.turn} is in check!`;
        statusText.style.color = '#ff4757';
      } else {
        statusText.textContent = 'Game in progress';
        statusText.style.color = '#48bb78';
      }
      break;
  }
}

function updateStatus(message) {
  const statusText = document.getElementById('statusText');
  statusText.textContent = message;
  statusText.style.color = '#667eea';
}

function updateGameInfo(info) {
  document.getElementById('gameInfo').textContent = info;
}

// Get piece SVG (pieces.js should be loaded before this script)
function getPieceSVG(type, color) {
  if (typeof PIECES !== 'undefined' && PIECES[color] && PIECES[color][type]) {
    return PIECES[color][type];
  }
  return '';
}
