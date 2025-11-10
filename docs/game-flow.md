# Game Flow Documentation

## Game State Machine

```plantuml
@startuml
!theme plain

[*] --> WaitingForPlayers : createGame / playWithAI

WaitingForPlayers --> Active : Second player joins / AI ready

Active --> Active : Valid move made
Active --> Check : King in check
Active --> Checkmate : No legal moves + in check
Active --> Stalemate : No legal moves + not in check

Check --> Active : Check resolved
Check --> Checkmate : Checkmate

Checkmate --> [*]
Stalemate --> [*]

note right of Active
  Players alternate turns
  Moves validated by engine
end note

note right of Check
  King is under attack
  Must resolve or lose
end note

@enduml
```

## Turn Flow

```plantuml
@startuml
!theme plain

start

:Player selects piece;
:Highlight possible moves;

if (Click on valid square?) then (yes)
  if (Pawn promotion?) then (yes)
    :Show promotion modal;
    :Player selects piece;
  else (no)
  endif
  
  :Send makeMove to server;
  
  if (Move valid?) then (yes)
    :Update board;
    :Switch turn;
    
    if (AI's turn?) then (yes)
      :AI calculates move;
      :AI makes move;
      :Update board;
      :Switch turn;
    else (no)
    endif
    
    if (Check?) then (yes)
      :Highlight king;
      :Show check status;
    else (no)
    endif
    
    if (Checkmate?) then (yes)
      :End game;
      :Show winner;
    else (no)
      if (Stalemate?) then (yes)
        :End game;
        :Show draw;
      else (no)
      endif
    endif
  else (no)
    :Show error message;
  endif
else (no)
  :Deselect piece;
endif

stop

@enduml
```

## Move Validation Flow

```plantuml
@startuml
!theme plain

start

:Receive makeMove request;

if (Player in game?) then (no)
  :Return error "Not in game";
  stop
else (yes)
endif

if (Player's turn?) then (no)
  :Return error "Not your turn";
  stop
else (yes)
endif

:Get piece at from square;

if (Piece exists?) then (no)
  :Return error "Invalid move";
  stop
else (yes)
endif

if (Piece belongs to player?) then (no)
  :Return error "Invalid move";
  stop
else (yes)
endif

:Get legal moves for piece;

if (Target square in legal moves?) then (no)
  :Return error "Illegal move";
  stop
else (yes)
endif

:Make temporary move;
:Check if own king in check;

if (King in check?) then (yes)
  :Restore board;
  :Return error "Illegal move";
  stop
else (no)
endif

:Execute move;
:Handle special cases;
:Update game state;
:Return success;

stop

@enduml
```

## Special Move Handling

### En Passant Flow

```plantuml
@startuml
!theme plain

start

:Pawn moves two squares;
:Set enPassantTarget to jumped square;

:Opponent pawn adjacent?;

if (Yes) then (yes)
  :En passant available;
  :Opponent can capture;
  :Capture pawn on jumped square;
else (no)
endif

:Clear enPassantTarget after move;

stop

@enduml
```

### Castling Flow

```plantuml
@startuml
!theme plain

start

if (King and rook unmoved?) then (no)
  stop
else (yes)
endif

if (Squares between clear?) then (no)
  stop
else (yes)
endif

:Check if squares attacked;

if (King in check?) then (yes)
  stop
else (no)
endif

if (Squares king moves through attacked?) then (yes)
  stop
else (no)
endif

:Move king two squares;
:Move rook to other side of king;
:Revoke castling rights;

stop

@enduml
```

### Pawn Promotion Flow

```plantuml
@startuml
!theme plain

start

:Pawn reaches 8th rank;

if (Player selected promotion?) then (no)
  :Show promotion modal;
  :Wait for selection;
else (yes)
endif

:Replace pawn with selected piece;
:Continue game;

stop

@enduml
```

## Game Lifecycle

```plantuml
@startuml
!theme plain

participant "Player 1" as P1
participant "Server" as S
participant "Engine" as E
participant "Player 2" as P2

== Game Creation ==
P1 -> S: createGame
S -> E: new ChessEngine()
S --> P1: gameCreated

== Player Joins ==
P2 -> S: joinGame(gameId)
S -> E: getBoardState()
S --> P1: playerJoined
S --> P2: gameJoined

== Gameplay Loop ==
loop Until game ends
  P1 -> S: makeMove()
  S -> E: makeMove()
  E -> E: validateMove()
  E -> E: updateBoard()
  E --> S: MoveResult
  S --> P1: gameState
  S --> P2: gameState
  
  alt Check detected
    S --> P1: gameState (check: true)
    S --> P2: gameState (check: true)
  end
  
  alt Checkmate
    S --> P1: gameState (status: checkmate)
    S --> P2: gameState (status: checkmate)
  end
end

@enduml
```

## Error Handling Flow

```plantuml
@startuml
!theme plain

start

:Receive message;

if (Valid JSON?) then (no)
  :Log error;
  :Send "Invalid message format";
  stop
else (yes)
endif

if (Known message type?) then (no)
  :Log error;
  :Send "Unknown message type";
  stop
else (yes)
endif

:Route to handler;

try {
  :Execute handler;
} catch (Exception) {
  :Log error with stack trace;
  :Send "Server error";
}

stop

@enduml
```
