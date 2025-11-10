# About This Project

```
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║              ♟️  Chess Game - About                        ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
```

## 🎯 Project Vision

This chess game was built to demonstrate modern web technologies, real-time communication, and advanced AI algorithms in a classic game setting. The project combines:

- **Real-time multiplayer** gameplay via WebSockets
- **Advanced AI** using minimax/negamax algorithms
- **Complete chess rules** implementation
- **Beautiful UI** with SVG graphics
- **Comprehensive documentation** with visual diagrams

```
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │  🎯 Goals                                           │
    │                                                     │
    │  • Create a fully functional chess game             │
    │  • Implement all standard chess rules               │
    │  • Build an intelligent AI opponent                │
    │  • Provide excellent user experience               │
    │  • Document everything thoroughly                  │
    │                                                     │
    └─────────────────────────────────────────────────────┘
```

## 🏗️ Architecture Philosophy

The project follows a clean, modular architecture:

```
    ╔═══════════════════════════════════════════════╗
    ║  Separation of Concerns                      ║
    ║                                               ║
    ║  • Server (server.js)        - Communication ║
    ║  • Engine (chess-engine.js)  - Game Logic    ║
    ║  • AI (ai-player.js)         - Intelligence  ║
    ║  • Client (public/)          - User Interface║
    ╚═══════════════════════════════════════════════╝
```

### Design Principles

1. **Modularity**: Each component has a single responsibility
2. **Testability**: Logic separated from I/O for easy testing
3. **Extensibility**: Easy to add new features or AI improvements
4. **Documentation**: Everything is thoroughly documented

## 🧠 AI Development

The AI implementation represents a journey from basic to advanced:

### Evolution

```
    ┌─────────────────────────────────────────────┐
    │  Stage 1: Basic Minimax                    │
    │  ├─ Simple depth-3 search                  │
    │  ├─ Basic material evaluation              │
    │  └─ Limited intelligence                   │
    └─────────────────────────────────────────────┘
                    ↓
    ┌─────────────────────────────────────────────┐
    │  Stage 2: Enhanced Negamax                  │
    │  ├─ Depth 4-6 search                       │
    │  ├─ Alpha-beta pruning                     │
    │  ├─ Move ordering                          │
    │  └─ Better evaluation                      │
    └─────────────────────────────────────────────┘
                    ↓
    ┌─────────────────────────────────────────────┐
    │  Stage 3: Advanced Features                │
    │  ├─ Iterative deepening                    │
    │  ├─ Quiescence search                      │
    │  ├─ Comprehensive evaluation               │
    │  └─ Positional understanding               │
    └─────────────────────────────────────────────┘
```

### Current Capabilities

The AI evaluates positions using:

- **Material balance** - Piece values
- **Positional factors** - Piece-square tables
- **Pawn structure** - Doubled, isolated, passed pawns
- **King safety** - Checks, pawn shields
- **Center control** - Central squares
- **Piece coordination** - Rooks on open files, bishop pairs

## 🎮 Game Features

### Complete Rule Implementation

Every standard chess rule is implemented:

```
    ╔═══════════════════════════════════════════════╗
    ║  Standard Moves                              ║
    ║  ├─ Pawn moves (1 or 2 squares)             ║
    ║  ├─ Knight L-shaped moves                    ║
    ║  ├─ Bishop diagonal moves                    ║
    ║  ├─ Rook horizontal/vertical moves          ║
    ║  ├─ Queen all directions                     ║
    ║  └─ King one square in any direction        ║
    ║                                               ║
    ║  Special Moves                               ║
    ║  ├─ En passant capture                      ║
    ║  ├─ Castling (kingside & queenside)         ║
    ║  ├─ Pawn promotion                          ║
    ║  └─ Check/Checkmate/Stalemate detection     ║
    ╚═══════════════════════════════════════════════╝
```

### Real-Time Communication

WebSocket enables instant updates:

```
    Client 1  ←→  WebSocket Server  ←→  Client 2
                    ↕
                 Game State
```

## 🛠️ Technology Stack

### Backend

```
    ┌─────────────────────────────────────────┐
    │  Node.js                                │
    │  ├─ Express (HTTP server)              │
    │  ├─ WebSocket (ws library)              │
    │  └─ File System (logging)              │
    └─────────────────────────────────────────┘
```

### Frontend

```
    ┌─────────────────────────────────────────┐
    │  Vanilla JavaScript                     │
    │  ├─ HTML5                               │
    │  ├─ CSS3                                │
    │  └─ SVG (chess pieces)                  │
    └─────────────────────────────────────────┘
```

### Algorithms

```
    ┌─────────────────────────────────────────┐
    │  Chess AI                              │
    │  ├─ Negamax algorithm                   │
    │  ├─ Alpha-beta pruning                 │
    │  ├─ Iterative deepening                │
    │  ├─ Move ordering (MVV-LVA)            │
    │  └─ Quiescence search                  │
    └─────────────────────────────────────────┘
```

## 📊 Project Statistics

```
    ╔═══════════════════════════════════════════════╗
    ║  Code Statistics                              ║
    ║                                               ║
    ║  • ~6,000 lines of code                      ║
    ║  • 20+ source files                          ║
    ║  • 2,400+ lines of documentation             ║
    ║  • 8 comprehensive documentation files        ║
    ║  • 15+ PlantUML diagrams                     ║
    ╚═══════════════════════════════════════════════╝
```

## 🎓 Learning Outcomes

This project demonstrates:

1. **WebSocket Programming**: Real-time bidirectional communication
2. **Game Logic**: Complex rule implementation and validation
3. **AI Algorithms**: Search algorithms and evaluation functions
4. **State Management**: Game state synchronization
5. **Error Handling**: Robust error handling and logging
6. **Documentation**: Comprehensive technical documentation

## 🚀 Future Enhancements

Potential improvements:

```
    ┌─────────────────────────────────────────────┐
    │  Planned Features                          │
    │                                             │
    │  • Transposition tables                    │
    │  • Opening book                            │
    │  • Endgame tablebase                       │
    │  • Game history and replay                 │
    │  • User accounts                           │
    │  • Tournament mode                         │
    │  • Mobile app                              │
    │  • Chess variants (Chess960, etc.)        │
    └─────────────────────────────────────────────┘
```

## 🤝 Contributing

We welcome contributions! Areas where help is appreciated:

- **Bug fixes**: Report and fix issues
- **Features**: Add new functionality
- **Documentation**: Improve docs
- **Testing**: Add unit/integration tests
- **Performance**: Optimize algorithms
- **UI/UX**: Enhance user interface

See [Development Guide](./development.md) for details.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

```
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   MIT License - Free to use, modify, and distribute ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
```

## 🙏 Acknowledgments

- **FIDE**: For the official chess rules
- **Chess Programming Wiki**: For AI algorithm references
- **Open Source Community**: For inspiration and tools

## 📞 Contact

- **Repository**: https://github.com/david-strejc/chess
- **Issues**: https://github.com/david-strejc/chess/issues

---

<div align="center">

```
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   Thank you for checking out this project!           ║
    ║                                                       ║
    ║   Happy playing! ♟️                                    ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
```

</div>
