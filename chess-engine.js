// Chess Engine with Legal Move Validation

class ChessEngine {
  constructor() {
    this.board = this.createInitialBoard();
    this.turn = 'white';
    this.moveHistory = [];
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };
    this.gameStatus = 'active'; // active, checkmate, stalemate, draw
  }

  createInitialBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place pieces
    const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    // Black pieces (top)
    for (let col = 0; col < 8; col++) {
      board[0][col] = { type: pieces[col], color: 'black' };
      board[1][col] = { type: 'pawn', color: 'black' };
    }
    
    // White pieces (bottom)
    for (let col = 0; col < 8; col++) {
      board[7][col] = { type: pieces[col], color: 'white' };
      board[6][col] = { type: 'pawn', color: 'white' };
    }
    
    return board;
  }

  getPiece(row, col) {
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
    return this.board[row][col];
  }

  setPiece(row, col, piece) {
    this.board[row][col] = piece;
  }

  getAllLegalMoves(color) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece && piece.color === color) {
          const pieceMoves = this.getLegalMoves(row, col);
          moves.push(...pieceMoves.map(m => ({
            from: { row, col },
            to: m,
            piece: piece
          })));
        }
      }
    }
    return moves;
  }

  getLegalMoves(row, col) {
    const piece = this.getPiece(row, col);
    if (!piece) return [];

    const moves = this.getPossibleMoves(row, col, piece);
    const legalMoves = [];

    for (const move of moves) {
      if (this.isLegalMove(row, col, move.row, move.col)) {
        legalMoves.push(move);
      }
    }

    return legalMoves;
  }

  getPossibleMoves(row, col, piece) {
    const moves = [];
    const { type, color } = piece;

    switch (type) {
      case 'pawn':
        return this.getPawnMoves(row, col, color);
      case 'rook':
        return this.getRookMoves(row, col, color);
      case 'knight':
        return this.getKnightMoves(row, col, color);
      case 'bishop':
        return this.getBishopMoves(row, col, color);
      case 'queen':
        return this.getQueenMoves(row, col, color);
      case 'king':
        return this.getKingMoves(row, col, color);
      default:
        return [];
    }
  }

  getPawnMoves(row, col, color) {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    // Move forward one square
    if (!this.getPiece(row + direction, col)) {
      moves.push({ row: row + direction, col });
      
      // Move forward two squares from starting position
      if (row === startRow && !this.getPiece(row + 2 * direction, col)) {
        moves.push({ row: row + 2 * direction, col });
      }
    }

    // Capture diagonally
    for (const dcol of [-1, 1]) {
      const targetRow = row + direction;
      const targetCol = col + dcol;
      const target = this.getPiece(targetRow, targetCol);
      
      if (target && target.color !== color) {
        moves.push({ row: targetRow, col: targetCol });
      }
    }

    // En passant
    if (this.enPassantTarget) {
      const epRow = this.enPassantTarget.row;
      const epCol = this.enPassantTarget.col;
      // For en passant, the capturing pawn must be on the row immediately in front of the target
      // The target square is the square the pawn jumped over (the square to capture TO)
      // White pawns: if target is row 5, pawn must be on row 4 (5 - 1) to capture to row 5
      // Black pawns: if target is row 2, pawn must be on row 3 (2 + 1) to capture to row 2
      // So: pawn row should be (epRow - direction) to capture to epRow
      if (row === (epRow - direction) && Math.abs(col - epCol) === 1) {
        moves.push({ row: epRow, col: epCol, enPassant: true });
      }
    }

    return moves;
  }

  getRookMoves(row, col, color) {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [drow, dcol] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + drow * i;
        const newCol = col + dcol * i;
        const target = this.getPiece(newRow, newCol);

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

    return moves;
  }

  getKnightMoves(row, col, color) {
    const moves = [];
    const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

    for (const [drow, dcol] of offsets) {
      const newRow = row + drow;
      const newCol = col + dcol;
      const target = this.getPiece(newRow, newCol);

      if (!target || target.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }

    return moves;
  }

  getBishopMoves(row, col, color) {
    const moves = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [drow, dcol] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + drow * i;
        const newCol = col + dcol * i;
        const target = this.getPiece(newRow, newCol);

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

    return moves;
  }

  getQueenMoves(row, col, color) {
    return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)];
  }

  getKingMoves(row, col, color) {
    const moves = [];
    const offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

    for (const [drow, dcol] of offsets) {
      const newRow = row + drow;
      const newCol = col + dcol;
      const target = this.getPiece(newRow, newCol);

      if (!target || target.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }

    // Castling
    const rights = this.castlingRights[color];
    if (color === 'white' && row === 7 && col === 4) {
      // Kingside
      if (rights.kingside && !this.getPiece(7, 5) && !this.getPiece(7, 6) && 
          this.getPiece(7, 7)?.type === 'rook' && this.getPiece(7, 7)?.color === 'white') {
        if (!this.isSquareAttacked(7, 4, 'black') && 
            !this.isSquareAttacked(7, 5, 'black') && 
            !this.isSquareAttacked(7, 6, 'black')) {
          moves.push({ row: 7, col: 6, castling: 'kingside' });
        }
      }
      // Queenside
      if (rights.queenside && !this.getPiece(7, 1) && !this.getPiece(7, 2) && !this.getPiece(7, 3) &&
          this.getPiece(7, 0)?.type === 'rook' && this.getPiece(7, 0)?.color === 'white') {
        if (!this.isSquareAttacked(7, 4, 'black') && 
            !this.isSquareAttacked(7, 3, 'black') && 
            !this.isSquareAttacked(7, 2, 'black')) {
          moves.push({ row: 7, col: 2, castling: 'queenside' });
        }
      }
    } else if (color === 'black' && row === 0 && col === 4) {
      // Kingside
      if (rights.kingside && !this.getPiece(0, 5) && !this.getPiece(0, 6) &&
          this.getPiece(0, 7)?.type === 'rook' && this.getPiece(0, 7)?.color === 'black') {
        if (!this.isSquareAttacked(0, 4, 'white') && 
            !this.isSquareAttacked(0, 5, 'white') && 
            !this.isSquareAttacked(0, 6, 'white')) {
          moves.push({ row: 0, col: 6, castling: 'kingside' });
        }
      }
      // Queenside
      if (rights.queenside && !this.getPiece(0, 1) && !this.getPiece(0, 2) && !this.getPiece(0, 3) &&
          this.getPiece(0, 0)?.type === 'rook' && this.getPiece(0, 0)?.color === 'black') {
        if (!this.isSquareAttacked(0, 4, 'white') && 
            !this.isSquareAttacked(0, 3, 'white') && 
            !this.isSquareAttacked(0, 2, 'white')) {
          moves.push({ row: 0, col: 2, castling: 'queenside' });
        }
      }
    }

    return moves;
  }

  isSquareAttacked(row, col, byColor) {
    // Check all pieces of the attacking color
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.getPiece(r, c);
        if (piece && piece.color === byColor) {
          // Use a simplified attack check that doesn't recurse
          if (this.canPieceAttackSquare(r, c, piece, row, col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  canPieceAttackSquare(fromRow, fromCol, piece, toRow, toCol) {
    // Simplified attack check without recursion
    const { type, color } = piece;
    
    switch (type) {
      case 'pawn':
        const direction = color === 'white' ? -1 : 1;
        return (toRow === fromRow + direction) && 
               (toCol === fromCol - 1 || toCol === fromCol + 1);
               
      case 'knight':
        const knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        return knightOffsets.some(([drow, dcol]) => 
          fromRow + drow === toRow && fromCol + dcol === toCol
        );
        
      case 'bishop':
        if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
        
      case 'rook':
        if (toRow !== fromRow && toCol !== fromCol) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
        
      case 'queen':
        const sameRow = toRow === fromRow;
        const sameCol = toCol === fromCol;
        const sameDiagonal = Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol);
        if (!sameRow && !sameCol && !sameDiagonal) return false;
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
        
      case 'king':
        return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
        
      default:
        return false;
    }
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const drow = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const dcol = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let r = fromRow + drow;
    let c = fromCol + dcol;
    
    while (r !== toRow || c !== toCol) {
      if (this.getPiece(r, c)) return false;
      r += drow;
      c += dcol;
    }
    
    return true;
  }

  findKing(color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row, col };
        }
      }
    }
    return null;
  }

  isInCheck(color) {
    const king = this.findKing(color);
    if (!king) return false;
    const opponentColor = color === 'white' ? 'black' : 'white';
    return this.isSquareAttacked(king.row, king.col, opponentColor);
  }

  isLegalMove(fromRow, fromCol, toRow, toCol) {
    // Check bounds
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) return false;

    const piece = this.getPiece(fromRow, fromCol);
    if (!piece) return false;

    // Make the move temporarily
    const captured = this.getPiece(toRow, toCol);
    this.setPiece(toRow, toCol, piece);
    this.setPiece(fromRow, fromCol, null);

    // Check if this leaves own king in check
    const inCheck = this.isInCheck(piece.color);

    // Restore the board
    this.setPiece(fromRow, fromCol, piece);
    this.setPiece(toRow, toCol, captured);

    return !inCheck;
  }

  makeMove(fromRow, fromCol, toRow, toCol, promotion = 'queen') {
    const piece = this.getPiece(fromRow, fromCol);
    if (!piece || piece.color !== this.turn) {
      return { success: false, error: 'Invalid move' };
    }

    const legalMoves = this.getLegalMoves(fromRow, fromCol);
    const move = legalMoves.find(m => m.row === toRow && m.col === toCol);
    
    if (!move) {
      return { success: false, error: 'Illegal move' };
    }

    // Execute the move
    const captured = this.getPiece(toRow, toCol);
    this.setPiece(toRow, toCol, piece);
    this.setPiece(fromRow, fromCol, null);

    // Handle en passant
    if (move.enPassant) {
      const epRow = this.enPassantTarget.row;
      const epCol = this.enPassantTarget.col;
      this.setPiece(epRow, epCol, null);
    }

    // Handle castling
    if (move.castling) {
      if (move.castling === 'kingside') {
        const rook = this.getPiece(toRow, 7);
        this.setPiece(toRow, 7, null);
        this.setPiece(toRow, 5, rook);
      } else {
        const rook = this.getPiece(toRow, 0);
        this.setPiece(toRow, 0, null);
        this.setPiece(toRow, 3, rook);
      }
      this.castlingRights[piece.color] = { kingside: false, queenside: false };
    }

    // Update castling rights
    if (piece.type === 'king') {
      this.castlingRights[piece.color] = { kingside: false, queenside: false };
    }
    if (piece.type === 'rook') {
      if (fromRow === 7 && fromCol === 0) this.castlingRights.white.queenside = false;
      if (fromRow === 7 && fromCol === 7) this.castlingRights.white.kingside = false;
      if (fromRow === 0 && fromCol === 0) this.castlingRights.black.queenside = false;
      if (fromRow === 0 && fromCol === 7) this.castlingRights.black.kingside = false;
    }

    // Set en passant target
    this.enPassantTarget = null;
    if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
      this.enPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
    }

    // Pawn promotion
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
      this.setPiece(toRow, toCol, { type: promotion, color: piece.color });
    }

    // Record move
    this.moveHistory.push({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: piece.type,
      captured: captured?.type,
      promotion
    });

    // Switch turn
    this.turn = this.turn === 'white' ? 'black' : 'white';

    // Check game status
    const allLegalMoves = this.getAllLegalMoves(this.turn);
    const inCheck = this.isInCheck(this.turn);

    if (allLegalMoves.length === 0) {
      this.gameStatus = inCheck ? 'checkmate' : 'stalemate';
    } else {
      this.gameStatus = 'active';
    }

    return {
      success: true,
      captured,
      promotion: piece.type === 'pawn' && (toRow === 0 || toRow === 7),
      check: inCheck,
      checkmate: this.gameStatus === 'checkmate',
      stalemate: this.gameStatus === 'stalemate'
    };
  }

  getBoardState() {
    return {
      board: this.board.map(row => [...row]),
      turn: this.turn,
      gameStatus: this.gameStatus,
      enPassantTarget: this.enPassantTarget,
      moveHistory: [...this.moveHistory]
    };
  }

  clone() {
    const clone = new ChessEngine();
    clone.board = this.board.map(row => row.map(piece => piece ? {...piece} : null));
    clone.turn = this.turn;
    clone.moveHistory = [...this.moveHistory];
    clone.enPassantTarget = this.enPassantTarget ? {...this.enPassantTarget} : null;
    clone.castlingRights = JSON.parse(JSON.stringify(this.castlingRights));
    clone.gameStatus = this.gameStatus;
    return clone;
  }
}

module.exports = ChessEngine;
