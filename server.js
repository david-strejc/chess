// Chess Game Server

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');
const ChessEngine = require('./chess-engine');
const AIPlayer = require('./ai-player');

// Logging setup
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, `server-${new Date().toISOString().split('T')[0]}.log`);

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
  console.log(logMessage);
  
  try {
    fs.appendFileSync(logFile, logMessage + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

function debug(message, data = null) {
  log('DEBUG', message, data);
}

function info(message, data = null) {
  log('INFO', message, data);
}

function error(message, err = null) {
  log('ERROR', message, err ? { message: err.message, stack: err.stack } : null);
}

// Global error handlers
process.on('uncaughtException', (err) => {
  error('Uncaught Exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  error('Unhandled Rejection', reason);
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

const games = new Map();
const players = new Map();

info('Server initializing...');

wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(7);
  info(`Client connected`, { clientId });
  ws.clientId = clientId;

  ws.on('message', (message) => {
    try {
      debug(`Received message from ${clientId}`, { messageLength: message.length });
      const data = JSON.parse(message);
      debug(`Parsed message from ${clientId}`, { type: data.type });
      handleMessage(ws, data);
    } catch (err) {
      error(`Error parsing message from ${clientId}`, err);
      try {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      } catch (sendErr) {
        error(`Failed to send error message to ${clientId}`, sendErr);
      }
    }
  });

  ws.on('error', (err) => {
    error(`WebSocket error for ${clientId}`, err);
  });

  ws.on('close', () => {
    info(`Client disconnected`, { clientId });
    // Clean up player
    try {
      for (const [gameId, game] of games.entries()) {
        if (game.whitePlayer === ws || game.blackPlayer === ws) {
          debug(`Cleaning up player from game ${gameId}`, { clientId });
          if (game.whitePlayer === ws) game.whitePlayer = null;
          if (game.blackPlayer === ws) game.blackPlayer = null;
          broadcastGameState(gameId);
        }
      }
      players.delete(ws);
    } catch (err) {
      error(`Error cleaning up client ${clientId}`, err);
    }
  });
});

function handleMessage(ws, data) {
  const clientId = ws.clientId || 'unknown';
  debug(`Handling message type: ${data.type}`, { clientId });
  
  try {
    switch (data.type) {
      case 'createGame':
        createGame(ws, data);
        break;
      case 'joinGame':
        joinGame(ws, data);
        break;
      case 'makeMove':
        makeMove(ws, data);
        break;
      case 'playWithAI':
        playWithAI(ws, data);
        break;
      default:
        debug(`Unknown message type: ${data.type}`, { clientId });
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  } catch (err) {
    error(`Error handling message type ${data.type}`, err);
    try {
      ws.send(JSON.stringify({ type: 'error', message: 'Server error processing request' }));
    } catch (sendErr) {
      error(`Failed to send error response`, sendErr);
    }
  }
}

function createGame(ws, data) {
  try {
    const gameId = generateGameId();
    debug(`Creating game ${gameId}`, { clientId: ws.clientId });
    
    const game = {
      id: gameId,
      engine: new ChessEngine(),
      whitePlayer: ws,
      blackPlayer: null,
      aiPlayer: null,
      aiLevel: null
    };
    games.set(gameId, game);
    players.set(ws, { gameId, color: 'white' });

    const boardState = game.engine.getBoardState();
    debug(`Game ${gameId} created, sending board state`, { 
      clientId: ws.clientId,
      turn: boardState.turn 
    });
    
    ws.send(JSON.stringify({
      type: 'gameCreated',
      gameId,
      color: 'white',
      board: boardState.board,
      turn: boardState.turn,
      gameStatus: boardState.gameStatus
    }));
    
    info(`Game ${gameId} created successfully`);
  } catch (err) {
    error(`Error creating game`, err);
    throw err;
  }
}

function joinGame(ws, data) {
  const gameId = data.gameId;
  const game = games.get(gameId);

  if (!game) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
    return;
  }

  if (game.blackPlayer) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
    return;
  }

  game.blackPlayer = ws;
  players.set(ws, { gameId, color: 'black' });

  // Notify both players
  game.whitePlayer.send(JSON.stringify({
    type: 'playerJoined',
    color: 'black'
  }));

  ws.send(JSON.stringify({
    type: 'gameJoined',
    gameId,
    color: 'black',
    board: game.engine.getBoardState()
  }));

  broadcastGameState(gameId);
}

function playWithAI(ws, data) {
  try {
    const gameId = generateGameId();
    const aiLevel = data.aiLevel || 'medium';
    const playerColor = data.color || 'white';
    const aiColor = playerColor === 'white' ? 'black' : 'white';

    debug(`Creating AI game ${gameId}`, { 
      clientId: ws.clientId, 
      aiLevel, 
      playerColor, 
      aiColor 
    });

    const game = {
      id: gameId,
      engine: new ChessEngine(),
      whitePlayer: playerColor === 'white' ? ws : null,
      blackPlayer: playerColor === 'black' ? ws : null,
      aiPlayer: new AIPlayer(aiLevel),
      aiLevel,
      aiColor
    };
    games.set(gameId, game);
    players.set(ws, { gameId, color: playerColor });

    const boardState = game.engine.getBoardState();
    ws.send(JSON.stringify({
      type: 'gameCreated',
      gameId,
      color: playerColor,
      board: boardState.board,
      turn: boardState.turn,
      gameStatus: boardState.gameStatus,
      aiLevel
    }));

    info(`AI game ${gameId} created`, { aiLevel, playerColor });

    // If AI goes first
    if (aiColor === 'white') {
      debug(`AI goes first in game ${gameId}, scheduling move`);
      setTimeout(() => makeAIMove(gameId), 500);
    }
  } catch (err) {
    error(`Error creating AI game`, err);
    throw err;
  }
}

function makeMove(ws, data) {
  try {
    const player = players.get(ws);
    if (!player) {
      debug(`Move attempt by player not in game`, { clientId: ws.clientId });
      ws.send(JSON.stringify({ type: 'error', message: 'Not in a game' }));
      return;
    }

    const game = games.get(player.gameId);
    if (!game) {
      error(`Game ${player.gameId} not found for move`, { clientId: ws.clientId });
      ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
      return;
    }

    // Check if it's player's turn
    const expectedColor = game.engine.turn;
    const playerColor = player.color;
    
    debug(`Move attempt in game ${player.gameId}`, {
      clientId: ws.clientId,
      from: { row: data.fromRow, col: data.fromCol },
      to: { row: data.toRow, col: data.toCol },
      expectedColor,
      playerColor
    });
    
    if (expectedColor !== playerColor) {
      debug(`Not player's turn in game ${player.gameId}`, { 
        clientId: ws.clientId, 
        expectedColor, 
        playerColor 
      });
      ws.send(JSON.stringify({ type: 'error', message: 'Not your turn' }));
      return;
    }

    // Make the move
    const result = game.engine.makeMove(
      data.fromRow,
      data.fromCol,
      data.toRow,
      data.toCol,
      data.promotion || 'queen'
    );

    if (!result.success) {
      debug(`Move failed in game ${player.gameId}`, { 
        clientId: ws.clientId, 
        error: result.error 
      });
      ws.send(JSON.stringify({ type: 'error', message: result.error }));
      return;
    }

    info(`Move made in game ${player.gameId}`, {
      from: { row: data.fromRow, col: data.fromCol },
      to: { row: data.toRow, col: data.toCol },
      captured: result.captured?.type,
      check: result.check,
      checkmate: result.checkmate
    });

    broadcastGameState(player.gameId);

    // If playing with AI and it's AI's turn
    if (game.aiPlayer && game.engine.turn === game.aiColor && game.engine.gameStatus === 'active') {
      debug(`Scheduling AI move in game ${player.gameId}`);
      setTimeout(() => makeAIMove(player.gameId), 500);
    }
  } catch (err) {
    error(`Error making move`, err);
    try {
      ws.send(JSON.stringify({ type: 'error', message: 'Server error processing move' }));
    } catch (sendErr) {
      error(`Failed to send error response`, sendErr);
    }
  }
}

function makeAIMove(gameId) {
  try {
    const game = games.get(gameId);
    if (!game) {
      debug(`Game ${gameId} not found for AI move`);
      return;
    }
    
    if (!game.aiPlayer) {
      debug(`No AI player in game ${gameId}`);
      return;
    }
    
    if (game.engine.turn !== game.aiColor) {
      debug(`Not AI's turn in game ${gameId}`, { 
        turn: game.engine.turn, 
        aiColor: game.aiColor 
      });
      return;
    }

    if (game.engine.gameStatus !== 'active') {
      debug(`Game ${gameId} is not active`, { status: game.engine.gameStatus });
      return;
    }

    debug(`AI calculating move for game ${gameId}`, { 
      aiLevel: game.aiLevel, 
      aiColor: game.aiColor 
    });
    
    const moveStartTime = Date.now();
    const move = game.aiPlayer.getMove(game.engine);
    const moveTime = Date.now() - moveStartTime;
    
    if (!move) {
      error(`AI returned no move for game ${gameId}`);
      return;
    }

    debug(`AI move calculated for game ${gameId}`, {
      from: { row: move.from.row, col: move.from.col },
      to: { row: move.to.row, col: move.to.col },
      timeMs: moveTime
    });

    const result = game.engine.makeMove(
      move.from.row,
      move.from.col,
      move.to.row,
      move.to.col
    );

    if (result.success) {
      info(`AI move made in game ${gameId}`, {
        from: { row: move.from.row, col: move.from.col },
        to: { row: move.to.row, col: move.to.col },
        captured: result.captured?.type,
        check: result.check,
        checkmate: result.checkmate,
        timeMs: moveTime
      });
      broadcastGameState(gameId);
    } else {
      error(`AI move failed in game ${gameId}`, { error: result.error });
    }
  } catch (err) {
    error(`Error making AI move in game ${gameId}`, err);
  }
}

function broadcastGameState(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  const boardState = game.engine.getBoardState();
  const state = {
    type: 'gameState',
    board: boardState.board,
    turn: boardState.turn,
    gameStatus: boardState.gameStatus,
    enPassantTarget: boardState.enPassantTarget,
    moveHistory: boardState.moveHistory
  };

  if (game.whitePlayer) {
    game.whitePlayer.send(JSON.stringify(state));
  }
  if (game.blackPlayer) {
    game.blackPlayer.send(JSON.stringify(state));
  }
}

function generateGameId() {
  return Math.random().toString(36).substring(2, 9);
}

const PORT = process.env.PORT || 3001;

server.on('error', (err) => {
  error('Server error', err);
});

server.listen(PORT, () => {
  info(`Chess server running on http://localhost:${PORT}`, { port: PORT });
  debug('Server started successfully');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  info('SIGINT received, shutting down gracefully');
  server.close(() => {
    info('Server closed');
    process.exit(0);
  });
});
