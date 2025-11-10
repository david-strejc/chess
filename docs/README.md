# Chess Game Documentation

Welcome to the comprehensive documentation for the Chess Game application.

## Documentation Index

1. [Architecture Overview](./architecture.md) - System architecture and component design
2. [API Documentation](./api.md) - WebSocket API and message protocols
3. [Game Flow](./game-flow.md) - Game state management and turn logic
4. [AI Algorithm](./ai-algorithm.md) - AI player implementation and algorithms
5. [Chess Engine](./chess-engine.md) - Move validation and game rules
6. [Installation Guide](./installation.md) - Setup and deployment instructions
7. [Development Guide](./development.md) - Contributing and extending the codebase

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:3001 in your browser.

## Features

- ✅ Two-player gameplay via WebSocket
- ✅ Legal move validation (en passant, castling, pawn promotion)
- ✅ AI opponents with multiple difficulty levels
- ✅ Real-time game updates
- ✅ Beautiful SVG chess pieces
- ✅ Comprehensive logging and error handling

## Project Structure

```
chess/
├── server.js          # Express server with WebSocket
├── chess-engine.js     # Chess game logic and move validation
├── ai-player.js        # AI implementation with minimax
├── package.json        # Dependencies
├── public/             # Client-side files
│   ├── index.html
│   ├── style.css
│   ├── client.js
│   └── pieces.js
├── logs/               # Server logs
└── docs/               # Documentation
```
