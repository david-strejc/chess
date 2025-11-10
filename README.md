# Chess Game

A full-featured two-player chess game playable in the browser with AI opponents.

## Features

- ✅ **Two-player gameplay** via WebSocket
- ✅ **Legal move validation** including:
  - En passant
  - Castling (kingside and queenside)
  - Pawn promotion
  - Check/checkmate detection
  - Stalemate detection
- ✅ **AI opponents** with three difficulty levels:
  - Easy (depth 1)
  - Medium (depth 2)
  - Hard (depth 3)
- ✅ **Beautiful SVG chess pieces**
- ✅ **Real-time game updates**
- ✅ **Move highlighting** and visual feedback
- ✅ **Responsive design**

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Play

### Two-Player Mode

1. **Create a game**: Click "Create Game" to start a new game. You'll receive a Game ID.
2. **Join a game**: Another player clicks "Join Game" and enters the Game ID.
3. **Play**: Click on a piece to select it, then click on a highlighted square to move.

### Play with AI

1. Select AI difficulty (Easy, Medium, or Hard)
2. Choose to play as White or Black
3. The AI will automatically make moves when it's their turn

## Game Rules

- **Turn-based**: Players take turns moving pieces
- **Legal moves only**: The server validates all moves
- **Special moves**:
  - **En passant**: Capture a pawn that just moved two squares
  - **Castling**: Move king and rook simultaneously (if conditions are met)
  - **Pawn promotion**: Promote pawns to queen, rook, bishop, or knight when reaching the 8th rank
- **Check/Checkmate**: The game ends when a king is checkmated
- **Stalemate**: The game ends in a draw if a player has no legal moves but is not in check

## Technical Details

- **Backend**: Node.js with Express and WebSocket (ws)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Chess Engine**: Custom implementation with full move validation
- **AI**: Minimax algorithm with alpha-beta pruning

## Project Structure

```
chess/
├── server.js          # Express server with WebSocket
├── chess-engine.js    # Chess game logic and move validation
├── ai-player.js       # AI implementation with minimax
├── package.json       # Dependencies
└── public/
    ├── index.html     # Main HTML file
    ├── style.css      # Styling
    ├── client.js      # Client-side JavaScript
    └── pieces.js      # SVG chess pieces
```

## License

MIT
