// Advanced AI Player with Deep Search and Sophisticated Evaluation

const ChessEngine = require('./chess-engine');

class AIPlayer {
  constructor(level = 'medium') {
    this.level = level;
    this.depths = {
      easy: 4,
      medium: 5,
      hard: 6
    };
    this.transpositionTable = new Map();
    this.nodesEvaluated = 0;
  }

  getMove(engine) {
    try {
      this.nodesEvaluated = 0;
      const maxDepth = this.depths[this.level] || 5;
      const aiColor = engine.turn;
      const perspective = aiColor === 'white' ? 1 : -1;
      
      console.log(`[AI] Starting move calculation for ${aiColor} (level: ${this.level}, depth: ${maxDepth})`);
      
      // Iterative deepening for better move selection
      let bestMove = null;
      for (let depth = 1; depth <= maxDepth; depth++) {
        console.log(`[AI] Searching at depth ${depth}`);
        const result = this.negamax(engine, depth, -Infinity, Infinity, perspective);
        if (result.move) {
          bestMove = result.move;
          console.log(`[AI] Best move at depth ${depth}: ${JSON.stringify({from: bestMove.from, to: bestMove.to, score: result.score})}`);
        }
        // If we found a checkmate, we can stop early
        if (Math.abs(result.score) > 9000) {
          console.log(`[AI] Checkmate found, stopping search`);
          break;
        }
      }
      
      console.log(`[AI] (${this.level}) evaluated ${this.nodesEvaluated} nodes at depth ${maxDepth}`);
      if (!bestMove) {
        console.error(`[AI] ERROR: No move found!`);
      }
      return bestMove;
    } catch (err) {
      console.error(`[AI] ERROR in getMove:`, err);
      throw err;
    }
  }

  negamax(engine, depth, alpha, beta, perspective) {
    this.nodesEvaluated++;
    
    // Terminal node evaluation
    if (depth === 0) {
      return { score: perspective * this.evaluate(engine), move: null };
    }

    // Check game status
    if (engine.gameStatus === 'checkmate') {
      // If it's checkmate, the side whose turn it is lost
      const winnerPerspective = engine.turn === 'white' ? -1 : 1;
      return { score: perspective * winnerPerspective * 10000, move: null };
    }
    if (engine.gameStatus === 'stalemate') {
      return { score: 0, move: null };
    }

    const currentColor = engine.turn;
    const moves = this.orderMoves(engine, engine.getAllLegalMoves(currentColor), currentColor);

    if (moves.length === 0) {
      const inCheck = engine.isInCheck(currentColor);
      const currentPerspective = currentColor === 'white' ? 1 : -1;
      return { score: inCheck ? (perspective * currentPerspective * -10000) : 0, move: null };
    }

    let bestMove = null;
    let bestScore = -Infinity;

    for (const move of moves) {
      const newEngine = engine.clone();
      const result = newEngine.makeMove(
        move.from.row,
        move.from.col,
        move.to.row,
        move.to.col
      );

      if (!result.success) continue;

      // Quiescence search for captures/checks at leaf nodes
      let score;
      if (depth === 1 && (result.captured || result.check)) {
        score = -this.negamax(newEngine, 2, -beta, -alpha, -perspective).score;
      } else {
        score = -this.negamax(newEngine, depth - 1, -beta, -alpha, -perspective).score;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      alpha = Math.max(alpha, score);
      if (alpha >= beta) {
        break; // Beta cutoff
      }
    }

    return { score: bestScore, move: bestMove };
  }

  orderMoves(engine, moves, color) {
    // Move ordering: captures first, then checks, then other moves
    const ordered = [];
    const captures = [];
    const checks = [];
    const others = [];

    for (const move of moves) {
      const targetPiece = engine.getPiece(move.to.row, move.to.col);
      const piece = engine.getPiece(move.from.row, move.from.col);
      
      // Test if move gives check
      const testEngine = engine.clone();
      testEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
      const givesCheck = testEngine.isInCheck(color === 'white' ? 'black' : 'white');

      if (targetPiece) {
        // Capture - order by MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
        const captureValue = this.getPieceValue(targetPiece.type) - this.getPieceValue(piece.type);
        captures.push({ move, value: captureValue });
      } else if (givesCheck) {
        checks.push(move);
      } else {
        others.push(move);
      }
    }

    // Sort captures by value (highest first)
    captures.sort((a, b) => b.value - a.value);
    ordered.push(...captures.map(c => c.move));
    ordered.push(...checks);
    ordered.push(...others);

    return ordered;
  }

  getPieceValue(type) {
    const values = {
      pawn: 100,
      knight: 320,
      bishop: 330,
      rook: 500,
      queen: 900,
      king: 20000
    };
    return values[type] || 0;
  }

  evaluate(engine) {
    // Perspective: positive = white is better, negative = black is better
    if (engine.gameStatus === 'checkmate') {
      return engine.turn === 'white' ? -10000 : 10000;
    }
    if (engine.gameStatus === 'stalemate') {
      return 0;
    }

    let score = 0;

    // Material evaluation with piece-square tables
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = engine.getPiece(row, col);
        if (piece) {
          const materialValue = this.getPieceValue(piece.type);
          const positionValue = this.getPieceSquareValue(piece, row, col);
          const totalValue = materialValue + positionValue;
          
          if (piece.color === 'white') {
            score += totalValue;
          } else {
            score -= totalValue;
          }
        }
      }
    }

    // Mobility (weighted by piece type)
    const whiteMoves = engine.getAllLegalMoves('white');
    const blackMoves = engine.getAllLegalMoves('black');
    score += (whiteMoves.length - blackMoves.length) * 8;

    // Pawn structure
    score += this.evaluatePawnStructure(engine, 'white') - this.evaluatePawnStructure(engine, 'black');

    // King safety
    score += this.evaluateKingSafety(engine, 'white') - this.evaluateKingSafety(engine, 'black');

    // Center control
    score += this.evaluateCenterControl(engine, 'white') - this.evaluateCenterControl(engine, 'black');

    // Piece coordination
    score += this.evaluatePieceCoordination(engine, 'white') - this.evaluatePieceCoordination(engine, 'black');

    return score;
  }

  getPieceSquareValue(piece, row, col) {
    const tables = this.getPieceSquareTables();
    const table = tables[piece.type];
    if (!table) return 0;

    // Flip table for black pieces
    const actualRow = piece.color === 'white' ? 7 - row : row;
    return table[actualRow][col] || 0;
  }

  getPieceSquareTables() {
    return {
      pawn: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
      ],
      knight: [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50]
      ],
      bishop: [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 10, 10, 10, 10, 10, 10, -10],
        [-10, 5, 0, 0, 0, 0, 5, -10],
        [-20, -10, -10, -10, -10, -10, -10, -20]
      ],
      rook: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 10, 10, 10, 10, 10, 10, 5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [0, 0, 0, 5, 5, 0, 0, 0]
      ],
      queen: [
        [-20, -10, -10, -5, -5, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 5, 5, 5, 0, -10],
        [-5, 0, 5, 5, 5, 5, 0, -5],
        [0, 0, 5, 5, 5, 5, 0, -5],
        [-10, 5, 5, 5, 5, 5, 0, -10],
        [-10, 0, 5, 0, 0, 0, 0, -10],
        [-20, -10, -10, -5, -5, -10, -10, -20]
      ],
      king: [
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [20, 30, 10, 0, 0, 10, 30, 20]
      ]
    };
  }

  evaluatePawnStructure(engine, color) {
    let score = 0;
    const pawns = [];
    
    // Collect all pawns
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = engine.getPiece(row, col);
        if (piece && piece.type === 'pawn' && piece.color === color) {
          pawns.push({ row, col });
        }
      }
    }

    // Doubled pawns (penalty)
    const files = {};
    for (const pawn of pawns) {
      files[pawn.col] = (files[pawn.col] || 0) + 1;
    }
    for (const count of Object.values(files)) {
      if (count > 1) score -= 20 * (count - 1);
    }

    // Isolated pawns (penalty)
    for (const pawn of pawns) {
      const col = pawn.col;
      let hasNeighbor = false;
      for (const otherPawn of pawns) {
        if (otherPawn.col === col - 1 || otherPawn.col === col + 1) {
          hasNeighbor = true;
          break;
        }
      }
      if (!hasNeighbor) score -= 15;
    }

    // Passed pawns (bonus)
    for (const pawn of pawns) {
      const direction = color === 'white' ? -1 : 1;
      let isPassed = true;
      for (let r = pawn.row + direction; r >= 0 && r < 8; r += direction) {
        for (let c = Math.max(0, pawn.col - 1); c <= Math.min(7, pawn.col + 1); c++) {
          const piece = engine.getPiece(r, c);
          if (piece && piece.type === 'pawn' && piece.color !== color) {
            isPassed = false;
            break;
          }
        }
        if (!isPassed) break;
      }
      if (isPassed) {
        const rankBonus = color === 'white' ? (7 - pawn.row) * 20 : pawn.row * 20;
        score += 30 + rankBonus;
      }
    }

    return score;
  }

  evaluateKingSafety(engine, color) {
    let score = 0;
    
    // Find king
    let kingRow = -1, kingCol = -1;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = engine.getPiece(row, col);
        if (piece && piece.type === 'king' && piece.color === color) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    if (kingRow === -1) return 0;

    // Check if king is in check
    const opponentColor = color === 'white' ? 'black' : 'white';
    if (engine.isSquareAttacked(kingRow, kingCol, opponentColor)) {
      score -= 50;
    }

    // Pawn shield bonus
    const direction = color === 'white' ? 1 : -1;
    const shieldRow = kingRow + direction;
    if (shieldRow >= 0 && shieldRow < 8) {
      for (let col = Math.max(0, kingCol - 1); col <= Math.min(7, kingCol + 1); col++) {
        const piece = engine.getPiece(shieldRow, col);
        if (piece && piece.type === 'pawn' && piece.color === color) {
          score += 10;
        }
      }
    }

    return score;
  }

  evaluateCenterControl(engine, color) {
    let score = 0;
    const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
    const extendedCenter = [[2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 5], [4, 2], [4, 5], [5, 2], [5, 3], [5, 4], [5, 5]];

    for (const [row, col] of centerSquares) {
      if (engine.isSquareAttacked(row, col, color)) score += 15;
      const piece = engine.getPiece(row, col);
      if (piece && piece.color === color) score += 20;
    }

    for (const [row, col] of extendedCenter) {
      if (engine.isSquareAttacked(row, col, color)) score += 5;
    }

    return score;
  }

  evaluatePieceCoordination(engine, color) {
    let score = 0;
    
    // Rooks on open/semi-open files
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = engine.getPiece(row, col);
        if (piece && piece.type === 'rook' && piece.color === color) {
          // Check if file is open (no pawns of either color)
          let hasPawn = false;
          for (let r = 0; r < 8; r++) {
            const p = engine.getPiece(r, col);
            if (p && p.type === 'pawn') {
              hasPawn = true;
              break;
            }
          }
          if (!hasPawn) score += 20; // Open file
          else {
            // Check if semi-open (no own pawns)
            let hasOwnPawn = false;
            for (let r = 0; r < 8; r++) {
              const p = engine.getPiece(r, col);
              if (p && p.type === 'pawn' && p.color === color) {
                hasOwnPawn = true;
                break;
              }
            }
            if (!hasOwnPawn) score += 10; // Semi-open file
          }
        }
      }
    }

    // Bishop pair bonus
    let bishopCount = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = engine.getPiece(row, col);
        if (piece && piece.type === 'bishop' && piece.color === color) {
          bishopCount++;
        }
      }
    }
    if (bishopCount >= 2) score += 30;

    return score;
  }
}

module.exports = AIPlayer;
