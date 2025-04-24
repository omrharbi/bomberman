import WebSocket, { WebSocketServer } from "ws";

export default class Room {
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

  setMapData(map, tileSize) {
    this.map = map;
    this.tileSize = tileSize;
  }

  destroy(data) {
    this.map[data.row][data.col] = 0;
  }
}
