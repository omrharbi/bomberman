import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end("WebSocket game server is running.");
});

const wss = new WebSocketServer({ server });

let nextRoomID = 1;
const rooms = new Map();

class Player {
  constructor(nickname, id, conn) {
    this.nickname = nickname;
    this.id = id;
    this.conn = conn;
    this.lives = 3;
  }
  loseLife() {
    this.lives -= 1;
  }

  isAlive() {
    return this.lives > 0;
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

  for (const player of room.players.values()) {
    console.log(`Player ${player.nickname} in room ${room.id}`);
    const players = Array.from(room.players.values()).map(player => ({
      nickname: player.nickname,
      lives: player.lives,
      playerId: player.id,
    }));
    startGameForPlayer(player, room, players);
  }
}

function startGameForPlayer(player, room, players) {
  
  player.conn.send(JSON.stringify({
    type: 'startGame',
    nickname: player.nickname,
    lives: player.lives,
    players: players,
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

    room.broadcast({
      type: 'updateLives',
      playerId: player.id,
      lives: player.lives,
      nickname: player.nickname,
    });

    if (!player.isAlive()) {
      room.broadcast({
        type: 'playerDied',
        playerId: player.id,
        nickname: player.nickname,
      });
    }

    room.broadcast({
      type: 'chatMsg',
      nickname: player.nickname,
      messageText: data.messageText || ''
    });
  });

  player.conn.on('close', () => {
    room.removePlayer(player.id);
    room.broadcast({ type: 'updatePlayers', playerCount: room.players.size, playerId : player.id });
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