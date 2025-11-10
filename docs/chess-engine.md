# Chess Engine Documentation

## Overview

The chess engine validates all moves according to FIDE rules, including special moves like en passant, castling, and pawn promotion.

## Class Structure

```plantuml
@startuml
!theme plain

class ChessEngine {
  -board: Piece[][]
  -turn: string
  -moveHistory: Move[]
  -enPassantTarget: Square | null
  -castlingRights: object
  -gameStatus: string
  
  +getPiece(row, col): Piece | null
  +setPiece(row, col, piece): void
  +getLegalMoves(row, col): Move[]
  +getAllLegalMoves(color): Move[]
  +makeMove(fromRow, fromCol, toRow, toCol, promotion): Result
  +isInCheck(color): boolean
  +isSquareAttacked(row, col, byColor): boolean
  +getBoardState(): BoardState
  +clone(): ChessEngine
}

class Piece {
  type: string
  color: string
}

class Move {
  from: Square
  to: Square
  piece: Piece
  captured: Piece | null
  promotion: string | null
  enPassant: boolean
  castling: string | null
}

ChessEngine --> Piece : contains
ChessEngine --> Move : generates

@enduml
```

## Move Generation Flow

```plantuml
@startuml
!theme plain

start

:getLegalMoves(row, col);

:Get piece at square;

if (No piece?) then (yes)
  :Return [];
  stop
endif

:Get possible moves for piece type;

repeat for each possible move
  :Check if move is legal;
  
  if (Would leave king in check?) then (yes)
    :Skip move;
  else (no)
    :Add to legal moves;
  endif
repeat

:Return legal moves;

stop

@enduml
```

## Piece Movement Rules

### Pawn Movement

```plantuml
@startuml
!theme plain

start

:Get pawn position;

if (Starting rank?) then (yes)
  :Can move 1 or 2 squares forward;
else (no)
  :Can move 1 square forward;
endif

:Check forward squares;

if (Square blocked?) then (yes)
  :Stop forward movement;
else (no)
  :Add forward move;
endif

:Check diagonal captures;

if (Enemy piece diagonal?) then (yes)
  :Add capture move;
endif

:Check en passant;

if (En passant available?) then (yes)
  :Add en passant capture;
endif

if (Reached 8th rank?) then (yes)
  :Mark for promotion;
endif

stop

@enduml
```

### King Movement

```plantuml
@startuml
!theme plain

start

:Get king position;

:Check 8 adjacent squares;

repeat for each direction
  if (Square on board?) then (no)
    :Skip;
  else (yes)
    if (Own piece?) then (yes)
      :Skip;
    else (no)
      :Add move;
    endif
  endif
repeat

:Check castling;

if (Kingside castling available?) then (yes)
  if (Squares clear and not attacked?) then (yes)
    :Add castling move;
  endif
endif

if (Queenside castling available?) then (yes)
  if (Squares clear and not attacked?) then (yes)
    :Add castling move;
  endif
endif

stop

@enduml
```

## Move Validation

```plantuml
@startuml
!theme plain

start

:makeMove(fromRow, fromCol, toRow, toCol);

if (Piece exists?) then (no)
  :Return error;
  stop
endif

if (Correct turn?) then (no)
  :Return error;
  stop
endif

:Get legal moves for piece;

if (Target in legal moves?) then (no)
  :Return error;
  stop
endif

:Make temporary move;

if (Own king in check?) then (yes)
  :Restore board;
  :Return error;
  stop
endif

:Execute move permanently;

:Handle special cases;
:Update game state;
:Switch turn;

:Check game status;

:Return success;

stop

@enduml
```

## Special Moves

### En Passant

```plantuml
@startuml
!theme plain

participant "Pawn A" as PawnA
participant "Engine" as E
participant "Pawn B" as PawnB

PawnA -> E: Move two squares
E -> E: Set enPassantTarget
E --> PawnB: En passant available

PawnB -> E: Capture en passant
E -> E: Remove PawnA
E -> E: Place PawnB on target square
E -> E: Clear enPassantTarget

@enduml
```

### Castling

```plantuml
@startuml
!theme plain

start

if (King and rook unmoved?) then (no)
  stop
endif

if (No pieces between?) then (no)
  stop
endif

if (King not in check?) then (no)
  stop
endif

if (Squares not attacked?) then (no)
  stop
endif

:Move king 2 squares;
:Move rook to other side;

stop

@enduml
```

### Pawn Promotion

```plantuml
@startuml
!theme plain

start

:Pawn reaches 8th rank;

if (Promotion piece specified?) then (yes)
  :Replace with piece;
else (no)
  :Default to queen;
endif

:Continue game;

stop

@enduml
```

## Check Detection

```plantuml
@startuml
!theme plain

start

:isInCheck(color);

:Find king position;

:Get opponent color;

:Check if king square attacked;

if (Attacked?) then (yes)
  :Return true;
else (no)
  :Return false;
endif

stop

@enduml
```

## Attack Detection

```plantuml
@startuml
!theme plain

start

:isSquareAttacked(row, col, byColor);

repeat for each piece of byColor
  :Check if piece can attack square;
  
  switch (piece type)
  case pawn
    :Check diagonal attack;
  case knight
    :Check L-shaped moves;
  case bishop
    :Check diagonal path;
  case rook
    :Check horizontal/vertical path;
  case queen
    :Check all directions;
  case king
    :Check adjacent squares;
  endswitch
  
  if (Can attack?) then (yes)
    :Return true;
  endif
repeat

:Return false;

stop

@enduml
```

## Game State Management

```plantuml
@startuml
!theme plain

object "Board State" {
  board: Piece[][]
  turn: string
  gameStatus: string
  enPassantTarget: Square | null
  moveHistory: Move[]
}

object "Castling Rights" {
  white: {
    kingside: boolean
    queenside: boolean
  }
  black: {
    kingside: boolean
    queenside: boolean
  }
}

ChessEngine --> "Board State"
ChessEngine --> "Castling Rights"

@enduml
```

## State Transitions

```plantuml
@startuml
!theme plain

[*] --> Initialized : new ChessEngine()

Initialized --> Active : First move

Active --> Active : Valid move
Active --> Check : King attacked
Active --> Checkmate : No moves + in check
Active --> Stalemate : No moves + not in check

Check --> Active : Check resolved
Check --> Checkmate : Cannot resolve

Checkmate --> [*]
Stalemate --> [*]

@enduml
```

## Board Representation

```
Row 0: Black back rank (rook, knight, bishop, queen, king, bishop, knight, rook)
Row 1: Black pawns
Row 2-5: Empty squares
Row 6: White pawns
Row 7: White back rank (rook, knight, bishop, queen, king, bishop, knight, rook)
```

## Coordinate System

- **Rows**: 0-7 (0 = black's back rank, 7 = white's back rank)
- **Columns**: 0-7 (0 = a-file, 7 = h-file)
- **Squares**: [row][col] format

## Move History

Each move is recorded with:
- `from`: Source square
- `to`: Target square
- `piece`: Piece type moved
- `captured`: Captured piece (if any)
- `promotion`: Promotion piece (if pawn promotion)

## Clone Function

The engine can clone itself for AI search:

```plantuml
@startuml
!theme plain

start

:clone();

:Create new ChessEngine;

:Copy board (deep copy);

:Copy all state variables;

:Return cloned engine;

stop

note right
  Used by AI to test
  moves without modifying
  original game state
end note

@enduml
```
