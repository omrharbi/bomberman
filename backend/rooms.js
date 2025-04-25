import WebSocket, { WebSocketServer } from "ws";

export default class Room {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.started = false;
    this.rewards = {};
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

  setMapData(map, tileSize) {
    this.map = map;
    this.tileSize = tileSize;
  }

  addReward(row, col, index) {
    const powerUpTypes = ["bomb", "speed", "fire"];
    const rewardType = powerUpTypes[index];
    this.rewards[`${row}_${col}`] = rewardType;
    
    this.broadcast({
      type: "rewardAdded",
      position: {
        row: row,
        col: col
      },
      rewardType: rewardType
    });
  }
  
  // Remove a reward from the map (when collected)
  removeReward(row, col) {
    delete this.rewards[`${row}_${col}`];
  }
}
