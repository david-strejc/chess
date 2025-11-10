# 📚 Chess Game Documentation

```
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║        Comprehensive Documentation                    ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
```

Welcome to the comprehensive documentation for the Chess Game application.

## 📑 Documentation Index

```
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │  1. 📖 [About](./about.md)                          │
    │     Project vision, architecture philosophy, stats  │
    │                                                     │
    │  2. 🏗️  [Architecture](./architecture.md)           │
    │     System architecture and component design       │
    │                                                     │
    │  3. 🔌 [API Documentation](./api.md)                │
    │     WebSocket API and message protocols            │
    │                                                     │
    │  4. 🎯 [Game Flow](./game-flow.md)                  │
    │     Game state management and turn logic           │
    │                                                     │
    │  5. 🧠 [AI Algorithm](./ai-algorithm.md)             │
    │     AI player implementation and algorithms        │
    │                                                     │
    │  6. ♟️  [Chess Engine](./chess-engine.md)           │
    │     Move validation and game rules                 │
    │                                                     │
    │  7. 🚀 [Installation Guide](./installation.md)      │
    │     Setup and deployment instructions              │
    │                                                     │
    │  8. 💻 [Development Guide](./development.md)        │
    │     Contributing and extending the codebase        │
    │                                                     │
    └─────────────────────────────────────────────────────┘
```

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
