import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import Player from "./player.js";
import Room from "./rooms.js";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket game server is running.");
});

const wss = new WebSocketServer({ server });

let nextRoomID = 1;
const rooms = new Map();
// Store timeouts at room level
const roomTimeouts = new Map();

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
  // Prevent multiple calls to startRoom for the same room
  if (room.started) {
    console.log(
      `Room ${room.id} is already started, ignoring duplicate start request`
    );
    return;
  }

  room.started = true;
  console.log(`Starting game in room ${room.id}`);

  // Clear any existing timeout for this room
  if (roomTimeouts.has(room.id)) {
    clearTimeout(roomTimeouts.get(room.id));
    roomTimeouts.delete(room.id);
  }

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
    [1, 1], // Player 1
    [14, 13], // Player 2
    [1, 15], // Player 3
    [12, 1], // Player 4
  ];

  const playersArray = Array.from(room.players.values());

  // Place players directly in the map with values 5, 6, 7, 8
  for (let i = 0; i < playersArray.length; i++) {
    const pos = positionPlayers[i];
    const player = playersArray[i];
    if (pos) {
      const [row, col] = pos;
      map[row][col] = 5 + i; // Set player number on map
      player.x = col * 40;
      player.y = row * 40;
    }
  }

  // Start game for all players
  for (const player of playersArray) {
    console.log(`Player ${player.nickname} in room ${room.id}`);
    startGameForPlayer(player, room, playersArray, map);
    console.log("playerid", player.id);
  }
}

function startGameForPlayer(player, room, playersArray, map) {
  player.conn.send(
    JSON.stringify({
      type: "startGame",
      nickname: player.nickname,
      lives: player.lives,
      players: playersArray,
      MyId: player.id,
      map: map,
    })
  );
  room.setMapData(map, 40);

  player.conn.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error("Invalid message:", err);
      return;
    }

    if (data.type === "loseLife") {
      player.loseLife(); // Decrease lives
    }

    switch (data.type) {
      case "chatMsg":
        room.broadcast({
          type: "chatMsg",
          nickname: player.nickname,
          messageText: data.messageText || "",
        });
        break;
      default:
        break;
    }
  });

  player.conn.on("close", () => {
    console.log(`Player ${player.nickname} disconnected`);
    room.removePlayer(player.id);
    room.broadcast({
      type: "updatePlayers",
      playerCount: room.players.size,
      playerId: player.id,
    });
  });
}

wss.on("connection", (ws) => {
  let currentPlayer;
  let currentRoom;

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error("Bad message format:", err);
      return;
    }

    switch (data.type) {
      case "newPlayer":
        const id = Date.now() + Math.floor(Math.random() * 1000);
        currentPlayer = new Player(data.nickname, id, ws);
        currentRoom = findAvailableRoom();
        currentRoom.addPlayer(currentPlayer);

        currentRoom.broadcast({
          type: "updatePlayers",
          playerCount: currentRoom.players.size,
        });

        console.log(`Player ${data.nickname} joined Room ${currentRoom.id}`);

        // Handle game start conditions
        if (
          (currentRoom.players.size == 2 || currentRoom.players.size == 3) &&
          !currentRoom.started
        ) {
          if (!roomTimeouts.has(currentRoom.id)) {
            //clearTimeout(roomTimeouts.get(currentRoom.id));
            const timeout = setTimeout(() => {
              startRoom(currentRoom);
            }, 20000);
            roomTimeouts.set(currentRoom.id, timeout);
          }
          /******************************* */
          if (!currentRoom.countInterval) {
            currentRoom.countP = 0;
            currentRoom.countInterval = setInterval(() => {
              currentRoom.countP++;
              currentRoom.broadcast({
                type: "updatePlayers",
                playerCount: currentRoom.players.size,
                countP: currentRoom.countP,
              });
              if (currentRoom.countP >= 20) {
                clearInterval(currentRoom.countInterval);
                currentRoom.countInterval = null;
              }
            }, 1000);
          }
        } else if (currentRoom.players.size == 4 && !currentRoom.started) {
          // Clear existing timeout if any
          if (roomTimeouts.has(currentRoom.id)) {
            clearTimeout(roomTimeouts.get(currentRoom.id));
            roomTimeouts.delete(currentRoom.id);
          }
          // Start immediately
          clearInterval(currentRoom.countInterval);
          currentRoom.countInterval = null;
          startRoom(currentRoom);
        }

        break;
      case "playerMove":
        currentPlayer.Updatemove(data, currentRoom);
        break;
      case "placeBomb":
        currentPlayer.placebomb(currentRoom);
        break;
      case "HitByExplosion":
        currentPlayer.isPlayerHitByExplosion(data, currentRoom);
        break;
      default:
        console.log("Unknown message type:", data.type);
        break;
    }
  });

  ws.on("close", () => {
    if (currentRoom && currentPlayer) {
      currentRoom.removePlayer(currentPlayer.id);
      currentRoom.broadcast({
        type: "updatePlayers",
        playerCount: currentRoom.players.size,
      });
    }
  });
});

// Start server
server.listen(8080, () => {
  console.log("Server is running at http://localhost:8080");
});
