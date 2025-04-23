import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("WebSocket game server is running.");
});

const wss = new WebSocketServer({ server });

let nextRoomID = 1;
const rooms = new Map();

// class Player {
//   constructor(nickname, id, conn) {
//     this.nickname = nickname;
//     this.id = id;
//     this.conn = conn;
//     this.lives = 3;
//   }
//   loseLife() {
//     this.lives -= 1;
//   }

//   isAlive() {
//     return this.lives > 0;
//   }
// }
class Player {
  constructor(nickname, id, conn) {
    this.nickname = nickname;
    this.id = id;
    this.conn = conn;
    // Game-related properties
    this.lives = 3;
    this.x = 1;
    this.y = 1;
    this.bombsPlaced = 0;
    this.bombPower = 1;
    this.positionX = 52;
    this.positionY = 0;
    this.width = 22;
    this.height = 40;
    this.speed = 7;
    this.isMoving = false;
    this.isDead = false;
    this.direction = 'up';
    this.style = "assets/images/playerStyle.png"; // Just the URL string
  }

  loseLife() {
    this.lives -= 1;
  }

  isAlive() {
    return this.lives > 0;
  }

  setDirection(direction) {
    this.direction = direction;
  }

}

class Room {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.started = false;
  }

  addPlayer(player) {
    this.players.set(player.id, player);
  }

  removePlayer(playerID) {
    this.players.delete(playerID);
  }

  broadcast(data) {
    for (const player of this.players.values()) {
      if (player.conn.readyState === WebSocket.OPEN) {
        player.conn.send(JSON.stringify(data));
      }
    }
  }
  getAllPlayerIDs() {
    return [...this.players.keys()];
  }
}

function findAvailableRoom() {
  for (const room of rooms.values()) {
    if (!room.started && room.players.size < 4) {
      return room;
    }
  }
  const room = new Room(nextRoomID++);
  rooms.set(room.id, room);
  return room;
}

function startRoom(room) {
  room.started = true;
  console.log(`Starting game in room ${room.id}`);

  let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 3, 2, 0, 3, 0, 1],
    [1, 0, 4, 0, 4, 0, 4, 3, 4, 3, 4, 0, 4, 0, 4, 0, 1],
    [1, 3, 0, 0, 0, 0, 3, 3, 0, 3, 0, 3, 0, 0, 0, 0, 1],
    [1, 0, 4, 3, 4, 0, 4, 0, 4, 0, 4, 0, 4, 0, 4, 3, 1],
    [1, 3, 0, 3, 0, 3, 0, 2, 0, 2, 0, 3, 0, 3, 3, 3, 1],
    [1, 0, 4, 0, 4, 3, 4, 3, 4, 3, 4, 3, 4, 0, 4, 0, 1],
    [1, 3, 3, 3, 0, 3, 3, 0, 3, 3, 0, 3, 0, 3, 0, 3, 1],
    [1, 0, 4, 3, 4, 0, 4, 3, 4, 3, 4, 0, 4, 3, 4, 0, 1],
    [1, 3, 0, 3, 0, 3, 3, 0, 3, 3, 0, 3, 0, 3, 0, 3, 1],
    [1, 0, 4, 0, 4, 0, 4, 3, 4, 0, 4, 0, 4, 0, 4, 0, 1],
    [1, 0, 0, 0, 3, 3, 3, 2, 3, 2, 3, 3, 0, 0, 0, 3, 1],
    [1, 0, 4, 0, 4, 0, 4, 0, 4, 3, 4, 0, 4, 0, 4, 3, 1],
    [1, 3, 3, 3, 2, 3, 0, 3, 0, 3, 0, 3, 2, 0, 0, 3, 1],
    [1, 0, 4, 3, 4, 0, 4, 0, 4, 0, 4, 3, 4, 3, 4, 0, 1],
    [1, 3, 3, 0, 3, 3, 0, 0, 3, 3, 0, 3, 3, 3, 3, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const positionPlayers = [
    [1, 1],   // Player 1
    [14, 13], // Player 2
    [1, 15],  // Player 3
    [12, 1],  // Player 4
  ];

  const playersArray = Array.from(room.players.values());

  // Place players directly in the map with values 5, 6, 7, 8
  for (let i = 0; i < playersArray.length; i++) {
    const pos = positionPlayers[i];
    if (pos) {
      const [row, col] = pos;
      map[row][col] = 5 + i; // Set player number on map
    }
  }

  // Prepare player data with the shared map
  const players = playersArray.map((player, index) => {
    const pos = positionPlayers[index] || [1, 1]; // fallback if needed
    return {
      nickname: player.nickname,
      lives: player.lives,
      playerId: player.id,
      playerIndex: index,
      row: pos[0],
      col: pos[1],
    };
  });

  // Start game for all players
  for (const player of playersArray) {
    console.log(`Player ${player.nickname} in room ${room.id}`);
    startGameForPlayer(player, room, players,map);
  }
}




function startGameForPlayer(player, room, players,map) {

  player.conn.send(JSON.stringify({
    type: 'startGame',
    nickname: player.nickname,
    lives: player.lives,
    players: players,
    MyId: player.id,
    map : map,
  }));

  player.conn.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error('Invalid message:', err);
      return;
    }

    if (data.type === 'loseLife') {
      player.loseLife();  // Decrease lives
    }
    // room.broadcast({
    //   type: 'updateLives',
    //   playerId: player.id,
    //   lives: player.lives,
    //   nickname: player.nickname,
    // });

    // if (!player.isAlive()) {
    //   room.broadcast({
    //     type: 'playerDied',
    //     playerId: player.id,
    //     nickname: player.nickname,
    //   });
    // }
    switch (data.type) {
      case "chatMsg":
        room.broadcast({
          type: 'chatMsg',
          nickname: player.nickname,
          messageText: data.messageText || ''
        });
        break;
      case "playerMove":
        room.broadcast({
          type: 'playerMove',
          PlayerId: player.id,
          position: data.position,
        });
        break;
      case "placeBomb":
        room.broadcast({
          type: 'placeBomb',
          position: data.position,
          gift : Math.random() < 0.3,
          index: Math.floor(Math.random() * 3),
        });
        break;
      default:
        break;
    }
  });

  player.conn.on('close', () => {
    room.removePlayer(player.id);
    room.broadcast({ type: 'updatePlayers', playerCount: room.players.size, playerId: player.id });
  });
}

wss.on('connection', (ws) => {
  let currentPlayer;
  let currentRoom;

  ws.on('message', (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error('Bad message format:', err);
      return;
    }

    switch (data.type) {
      case "newPlayer":
        const id = Date.now() + Math.floor(Math.random() * 1000);
        currentPlayer = new Player(data.nickname, id, ws);
        currentRoom = findAvailableRoom();
        currentRoom.addPlayer(currentPlayer);

        currentRoom.broadcast({
          type: 'updatePlayers',
          playerCount: currentRoom.players.size,
        });

        console.log(`Player ${data.nickname} joined Room ${currentRoom.id}`);
        //startRoom(currentRoom);
        setTimeout(() => {
          if (currentRoom.players.size >= 2 && !currentRoom.started) {
            startRoom(currentRoom);
          }
        }, 5000);
        break;

      default:
        console.log("Unknown message type:", data.type);
        break;
    }
  });

  ws.on('close', () => {
    if (currentRoom && currentPlayer) {
      currentRoom.removePlayer(currentPlayer.id);
      currentRoom.broadcast({
        type: 'updatePlayers',
        playerCount: currentRoom.players.size,
      });
    }
  });
});

// Start server
server.listen(8080, () => {
  console.log("Server is running at http://localhost:8080");
});