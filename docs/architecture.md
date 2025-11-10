# Architecture Overview

## System Architecture

```plantuml
@startuml
!theme plain
skinparam componentStyle rectangle

package "Client Layer" {
  [Web Browser] as Browser
  [HTML/CSS/JS] as Frontend
}

package "Server Layer" {
  [Express Server] as Express
  [WebSocket Server] as WS
  [Game Manager] as GameMgr
}

package "Game Logic" {
  [Chess Engine] as Engine
  [AI Player] as AI
}

package "Data Storage" {
  [Games Map] as Games
  [Players Map] as Players
}

Browser --> Frontend
Frontend <--> WS : WebSocket
WS --> Express
WS --> GameMgr
GameMgr --> Engine
GameMgr --> AI
GameMgr --> Games
GameMgr --> Players
AI --> Engine

note right of WS
  Real-time bidirectional
  communication
end note

note right of Engine
  Validates all moves
  Manages game state
end note

@enduml
```

## Component Diagram

```plantuml
@startuml
!theme plain

class ChessEngine {
  -board: Piece[][]
  -turn: string
  -moveHistory: Move[]
  -enPassantTarget: Square
  -castlingRights: object
  +getLegalMoves(row, col): Move[]
  +makeMove(from, to): Result
  +isInCheck(color): boolean
  +getBoardState(): BoardState
  +clone(): ChessEngine
}

class AIPlayer {
  -level: string
  -depths: object
  -nodesEvaluated: number
  +getMove(engine): Move
  -negamax(engine, depth, alpha, beta): Result
  -evaluate(engine): number
  -orderMoves(moves): Move[]
}

class GameManager {
  -games: Map<GameId, Game>
  -players: Map<WebSocket, Player>
  +createGame(ws): GameId
  +joinGame(ws, gameId): void
  +makeMove(ws, move): void
  +playWithAI(ws, level): GameId
  +broadcastGameState(gameId): void
}

class WebSocketHandler {
  -wss: WebSocketServer
  +handleConnection(ws): void
  +handleMessage(ws, data): void
  +broadcast(gameId, message): void
}

ChessEngine --> AIPlayer : used by
GameManager --> ChessEngine : manages
GameManager --> AIPlayer : creates
WebSocketHandler --> GameManager : uses

@enduml
```

## Data Flow

```plantuml
@startuml
!theme plain

actor Player
participant "Web Browser" as Browser
participant "WebSocket Server" as WS
participant "Game Manager" as GM
participant "Chess Engine" as Engine
participant "AI Player" as AI

Player -> Browser: Click piece
Browser -> WS: makeMove message
WS -> GM: handleMessage()
GM -> Engine: makeMove()
Engine -> Engine: validateMove()
Engine -> Engine: updateBoard()
Engine --> GM: MoveResult
GM -> WS: broadcastGameState()
WS -> Browser: gameState message
Browser -> Browser: renderBoard()

alt AI's turn
  GM -> AI: getMove()
  AI -> Engine: getAllLegalMoves()
  AI -> AI: negamax()
  AI --> GM: Move
  GM -> Engine: makeMove()
  GM -> WS: broadcastGameState()
end

@enduml
```

## Deployment Architecture

```plantuml
@startuml
!theme plain

node "Client Machine" {
  [Web Browser] as Browser
}

cloud "Network" {
}

node "Server Machine" {
  [Node.js Process] as Node
  [Express HTTP Server] as HTTP
  [WebSocket Server] as WS
  database "In-Memory Storage" {
    [Games Map] as Games
    [Players Map] as Players
  }
  folder "File System" {
    [Log Files] as Logs
  }
}

Browser --> HTTP : HTTP/HTTPS
Browser --> WS : WebSocket
HTTP --> Node
WS --> Node
Node --> Games
Node --> Players
Node --> Logs

note right of Node
  Single process
  No database required
  Stateless design
end note

@enduml
```

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - HTTP server framework
- **ws** - WebSocket library
- **Custom Chess Engine** - Move validation and game logic

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling and animations
- **Vanilla JavaScript** - Client-side logic
- **SVG** - Chess piece graphics

### Infrastructure
- **File System** - Logging
- **In-Memory Storage** - Game state (Maps)
- **WebSocket Protocol** - Real-time communication
