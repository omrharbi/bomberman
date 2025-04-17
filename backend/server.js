const { log } = require('console');
const http = require('http');
const WebSocket = require('ws');

let players = [];

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
});

let nextRoomID = 1;
const rooms = new Map(); 

class Player {
  constructor(nickname, id, conn) {
    this.nickname = nickname;
    this.id = id;
    this.conn = conn;
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
      if (room.players.size < 4 && !room.started) {
        return room;
      }
    }
    const room = new Room(nextRoomID++);
    rooms.set(room.id, room);
    return room;
  }
  
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {    
    
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        switch (parsedMessage.type) {
          case "newPlayer":
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const player = new Player(parsedMessage.nickname, id, ws);
            const room = findAvailableRoom();
            room.addPlayer(player);            
            room.broadcast({
                type: 'updatePlayers',
                playerCount: room.players.size,
              });
            console.log(`Player ${parsedMessage.nickname} joined room ${room.id}`)
            setTimeout(() => {
                if (room.players.size >= 2 && !room.started) {
                  startRoom(room);
                }
              }, 10000);
            break;
          case "chatMsg":
           
            break
          default:
            break;
        }
       
    });

    ws.on('close', () => {
        
    })
})
function startRoom(room) {
    room.started = true;
    for (const player of room.players.values()) {
        log('Starting game for room', room.id);
      game(player, room);
    }
  }
function game(player, room) {
    player.conn.send(JSON.stringify({
      type: 'startGame',
      nickname: player.nickname,
    }));
  
    player.conn.on('message', (message) => {
      let data;
      try {
        data = JSON.parse(message);
      } catch (err) {
        console.error('Invalid JSON:', err);
        return;
      }
      broadcastChatMessage(data, room);
    });
  
    player.conn.on('close', () => {
      room.removePlayer(player.id);
    });
  }
  function broadcastChatMessage(data, room) {
    room.broadcast(data);
  }
server.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});

function sand(data) {
  players.forEach((player) =>{
    player.ws.send(JSON.stringify(data));
  })
}