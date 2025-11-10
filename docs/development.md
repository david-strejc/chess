# Development Guide

## Code Structure

```
chess/
├── server.js          # Main server file
├── chess-engine.js    # Chess logic
├── ai-player.js       # AI implementation
├── package.json       # Dependencies
├── public/            # Client files
│   ├── index.html
│   ├── style.css
│   ├── client.js
│   └── pieces.js
├── logs/              # Server logs
└── docs/              # Documentation
```

## Architecture Overview

```plantuml
@startuml
!theme plain

package "Server" {
  [server.js] as Server
  [chess-engine.js] as Engine
  [ai-player.js] as AI
}

package "Client" {
  [index.html] as HTML
  [client.js] as Client
  [style.css] as CSS
  [pieces.js] as Pieces
}

Server --> Engine : uses
Server --> AI : uses
HTML --> Client : loads
Client --> Pieces : uses
Client <--> Server : WebSocket

@enduml
```

## Adding Features

### Adding a New Message Type

1. **Server Side** (`server.js`):

```javascript
function handleMessage(ws, data) {
  switch (data.type) {
    // ... existing cases
    case 'newMessageType':
      handleNewMessageType(ws, data);
      break;
  }
}

function handleNewMessageType(ws, data) {
  // Implementation
}
```

2. **Client Side** (`public/client.js`):

```javascript
function handleServerMessage(data) {
  switch (data.type) {
    // ... existing cases
    case 'newMessageType':
      handleNewMessageType(data);
      break;
  }
}
```

### Adding a New AI Evaluation Feature

Edit `ai-player.js`:

```javascript
evaluate(engine) {
  let score = 0;
  
  // ... existing evaluation
  
  // Add new feature
  score += this.evaluateNewFeature(engine, 'white') - 
           this.evaluateNewFeature(engine, 'black');
  
  return score;
}

evaluateNewFeature(engine, color) {
  // Implementation
  return value;
}
```

### Adding a New Chess Rule

Edit `chess-engine.js`:

1. Add move generation logic in appropriate piece method
2. Add validation in `makeMove()`
3. Update `getLegalMoves()` if needed

## Testing

### Manual Testing

1. **Two-Player Game**:
   - Create game in one browser
   - Join with game ID in another browser
   - Test moves

2. **AI Game**:
   - Start AI game
   - Make moves and observe AI responses
   - Test all difficulty levels

3. **Special Moves**:
   - Test en passant
   - Test castling
   - Test pawn promotion
   - Test check/checkmate

### Unit Testing Structure

```javascript
// Example test structure
describe('ChessEngine', () => {
  it('should validate legal moves', () => {
    const engine = new ChessEngine();
    const moves = engine.getLegalMoves(6, 4); // White pawn
    expect(moves.length).toBeGreaterThan(0);
  });
  
  it('should prevent illegal moves', () => {
    const engine = new ChessEngine();
    const result = engine.makeMove(6, 4, 5, 4); // Valid
    expect(result.success).toBe(true);
    
    const result2 = engine.makeMove(5, 4, 4, 4); // Valid
    expect(result2.success).toBe(true);
    
    const result3 = engine.makeMove(4, 4, 3, 4); // Invalid (wrong turn)
    expect(result3.success).toBe(false);
  });
});
```

## Debugging

### Server Logs

```bash
# View real-time logs
tail -f logs/server-$(date +%Y-%m-%d).log

# Search for errors
grep ERROR logs/server-*.log

# Search for specific game
grep "gameId" logs/server-*.log
```

### Client Debugging

Open browser console (F12) to see:
- WebSocket messages
- Client-side errors
- Game state updates

### AI Debugging

AI logs to console:
- Search depth
- Nodes evaluated
- Best move found
- Evaluation scores

## Code Style

### JavaScript Style

- Use `const` for constants
- Use `let` for variables
- Use arrow functions where appropriate
- Use template literals for strings
- Use async/await for asynchronous code

### Naming Conventions

- **Classes**: PascalCase (`ChessEngine`)
- **Functions**: camelCase (`makeMove`)
- **Variables**: camelCase (`gameId`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_DEPTH`)

## Performance Optimization

### Server Optimization

1. **Connection Pooling**: Reuse WebSocket connections
2. **Caching**: Cache evaluated positions (future)
3. **Compression**: Compress WebSocket messages (future)

### AI Optimization

1. **Move Ordering**: Already implemented
2. **Alpha-Beta Pruning**: Already implemented
3. **Transposition Table**: Future enhancement
4. **Iterative Deepening**: Already implemented

## Extending the AI

### Adding Opening Book

```javascript
class AIPlayer {
  constructor(level) {
    // ... existing code
    this.openingBook = new Map();
  }
  
  getMove(engine) {
    // Check opening book first
    const fen = engine.getFEN();
    if (this.openingBook.has(fen)) {
      return this.openingBook.get(fen);
    }
    
    // Otherwise use search
    return this.search(engine);
  }
}
```

### Adding Endgame Tablebase

```javascript
class AIPlayer {
  getMove(engine) {
    const pieceCount = this.countPieces(engine);
    
    if (pieceCount <= 5) {
      // Use tablebase for endgames
      return this.getTablebaseMove(engine);
    }
    
    // Otherwise use search
    return this.search(engine);
  }
}
```

## Database Integration

### Adding MongoDB

```javascript
const MongoClient = require('mongodb').MongoClient;

class GameManager {
  async saveGame(gameId, gameState) {
    await this.db.collection('games').updateOne(
      { gameId },
      { $set: { state: gameState, updatedAt: new Date() } },
      { upsert: true }
    );
  }
  
  async loadGame(gameId) {
    return await this.db.collection('games').findOne({ gameId });
  }
}
```

## Adding Authentication

```javascript
const jwt = require('jsonwebtoken');

function authenticate(ws, token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ws.userId = decoded.userId;
    ws.username = decoded.username;
    return true;
  } catch (err) {
    return false;
  }
}
```

## Adding Spectator Mode

```javascript
function addSpectator(gameId, ws) {
  const game = games.get(gameId);
  if (!game.spectators) {
    game.spectators = [];
  }
  game.spectators.push(ws);
}

function broadcastToSpectators(gameId, message) {
  const game = games.get(gameId);
  if (game.spectators) {
    game.spectators.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}
```

## Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests** (if applicable)
5. **Update documentation**
6. **Submit a pull request**

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] No console.log statements (use logging functions)
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] Tests pass (if applicable)
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

## Future Enhancements

1. **Database Persistence**: Save games to database
2. **User Accounts**: Authentication and user profiles
3. **Game History**: Replay past games
4. **Tournament Mode**: Multiple games, rankings
5. **Analysis Mode**: Move analysis and suggestions
6. **Mobile App**: React Native or similar
7. **Chess Variants**: Chess960, Three-check, etc.

## Resources

- [FIDE Laws of Chess](https://www.fide.com/FIDE/handbook/LawsOfChess.pdf)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Chess Programming Wiki](https://www.chessprogramming.org/)
