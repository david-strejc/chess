# ♟️ Chess Game

```
    ____ _                          ____                      
   / ___| |__   ___  ___ ___       / ___| __ _ _ __ ___   ___ 
  | |   | '_ \ / _ \/ __/ __|     | |  _ / _` | '_ ` _ \ / _ \
  | |___| | | |  __/\__ \__ \     | |_| | (_| | | | | | |  __/
   \____|_| |_|\___||___/___/      \____|\__,_|_| |_| |_|\___|
                                                                
   ╔═══════════════════════════════════════════════════════════╗
   ║                                                           ║
   ║     A beautiful two-player chess game with AI            ║
   ║     Play in your browser • Real-time WebSocket • Smart AI ║
   ║                                                           ║
   ╚═══════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

## 🎮 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Open your browser
# http://localhost:3001
```

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🎯 Features                                                │
│                                                             │
│  ✓ Two-player gameplay via WebSocket                       │
│  ✓ Legal move validation (en passant, castling, etc.)      │
│  ✓ AI opponents with 3 difficulty levels                   │
│  ✓ Beautiful SVG chess pieces                              │
│  ✓ Real-time game updates                                  │
│  ✓ Comprehensive logging and error handling                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### 🎯 Game Modes

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  👥 Two-Player Mode                                         │
│     • Create a game and share the game ID                   │
│     • Real-time synchronization                            │
│     • Turn-based gameplay                                   │
│                                                             │
│  🤖 AI Opponent Mode                                        │
│     • Easy   - Quick moves, depth 4                        │
│     • Medium - Balanced play, depth 5                      │
│     • Hard   - Challenging, depth 6                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🧠 AI Intelligence

The AI uses advanced algorithms:

```
    ╔═══════════════════════════════════════════════╗
    ║  Negamax Algorithm                            ║
    ║  ├─ Alpha-Beta Pruning                       ║
    ║  ├─ Iterative Deepening                      ║
    ║  ├─ Move Ordering (MVV-LVA)                 ║
    ║  ├─ Quiescence Search                        ║
    ║  └─ Advanced Evaluation Function             ║
    ║     ├─ Material Balance                      ║
    ║     ├─ Piece-Square Tables                   ║
    ║     ├─ Pawn Structure Analysis              ║
    ║     ├─ King Safety                           ║
    ║     ├─ Center Control                        ║
    ║     └─ Piece Coordination                    ║
    ╚═══════════════════════════════════════════════╝
```

### ♟️ Chess Rules

All standard chess rules are implemented:

```
    ┌─────────────────────────────────────────┐
    │  ✓ Pawn moves and captures             │
    │  ✓ En passant                          │
    │  ✓ Castling (kingside & queenside)     │
    │  ✓ Pawn promotion                      │
    │  ✓ Check detection                     │
    │  ✓ Checkmate detection                 │
    │  ✓ Stalemate detection                 │
    └─────────────────────────────────────────┘
```

## 📁 Project Structure

```
chess/
├── 📄 server.js              # Express + WebSocket server
├── 🧩 chess-engine.js        # Chess game logic & validation
├── 🤖 ai-player.js           # AI implementation
├── 📦 package.json           # Dependencies
├── 📖 README.md              # This file
│
├── 📁 public/                # Client-side files
│   ├── index.html            # Main HTML
│   ├── style.css             # Styling
│   ├── client.js             # Client logic
│   └── pieces.js             # SVG chess pieces
│
├── 📁 docs/                  # Comprehensive documentation
│   ├── README.md             # Documentation index
│   ├── architecture.md       # System architecture
│   ├── api.md                # WebSocket API docs
│   ├── game-flow.md          # Game flow diagrams
│   ├── ai-algorithm.md       # AI algorithm details
│   ├── chess-engine.md       # Engine documentation
│   ├── installation.md       # Setup guide
│   └── development.md        # Development guide
│
└── 📁 logs/                  # Server logs (gitignored)
```

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/david-strejc/chess.git
cd chess

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on `http://localhost:3001` by default.

## 🎮 How to Play

### Two-Player Game

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Player 1: Click "Create Game"                          │
│  2. Share the Game ID with Player 2                        │
│  3. Player 2: Enter Game ID and click "Join Game"         │
│  4. Start playing!                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Play Against AI

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Select your color (White or Black)                     │
│  2. Choose AI difficulty (Easy, Medium, Hard)              │
│  3. Click "Play with AI"                                    │
│  4. Make your move and watch the AI respond!               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

```
📚 Documentation Index
├── 📖 [README](./docs/README.md)              - Documentation overview
├── 🏗️  [Architecture](./docs/architecture.md)  - System design & diagrams
├── 🔌 [API](./docs/api.md)                    - WebSocket API reference
├── 🎯 [Game Flow](./docs/game-flow.md)        - Game state & flow diagrams
├── 🧠 [AI Algorithm](./docs/ai-algorithm.md)   - AI implementation details
├── ♟️  [Chess Engine](./docs/chess-engine.md)  - Engine internals
├── 🚀 [Installation](./docs/installation.md)  - Setup & deployment
└── 💻 [Development](./docs/development.md)     - Contributing guide
```

## 🎨 Screenshots

```
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║    8  ♜ ♞ ♝ ♛ ♚ ♝ ♞ ♜                    ║
    ║    7  ♟ ♟ ♟ ♟ ♟ ♟ ♟ ♟                    ║
    ║    6  ⬜ ⬛ ⬜ ⬛ ⬜ ⬛ ⬜ ⬛                  ║
    ║    5  ⬛ ⬜ ⬛ ⬜ ⬛ ⬜ ⬛ ⬜                  ║
    ║    4  ⬜ ⬛ ⬜ ⬛ ⬜ ⬛ ⬜ ⬛                  ║
    ║    3  ⬛ ⬜ ⬛ ⬜ ⬛ ⬜ ⬛ ⬜                  ║
    ║    2  ♙ ♙ ♙ ♙ ♙ ♙ ♙ ♙                    ║
    ║    1  ♖ ♘ ♗ ♕ ♔ ♗ ♘ ♖                    ║
    ║       a b c d e f g h                    ║
    ║                                           ║
    ║    Turn: White                            ║
    ║    Status: Active                         ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
```

## 🔧 Configuration

### Environment Variables

```bash
PORT=3001  # Server port (default: 3001)
```

### Logging

Logs are automatically created in the `logs/` directory:
- Daily logs: `logs/server-YYYY-MM-DD.log`
- Server output: `logs/server-output.log`

## 🧪 Testing

```bash
# Start the server
npm start

# In another terminal, test the connection
curl http://localhost:3001
```

## 🚀 Deployment

See [Installation Guide](./docs/installation.md) for detailed deployment instructions including:
- Production setup with PM2
- Docker deployment
- systemd service configuration
- Scaling strategies

## 🤝 Contributing

Contributions are welcome! Please see the [Development Guide](./docs/development.md) for:
- Code structure
- Adding new features
- Testing guidelines
- Code style

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

```
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   Made with ♟️  and ❤️                                ║
    ║                                                       ║
    ║   Enjoy your games!                                   ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
```

## 🔗 Links

- **Repository**: https://github.com/david-strejc/chess
- **Issues**: https://github.com/david-strejc/chess/issues
- **Documentation**: [docs/](./docs/)

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

</div>
