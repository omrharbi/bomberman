export default class Player {
  constructor(nickname, id, conn) {
    this.x = 0;
    this.y = 0;
    // this.row ;
    // this.col ;
    this.nickname = nickname;
    this.id = id;
    this.playerElement = null;
    this.conn = conn;
    this.bombsPlaced = 0;
    this.bombPower = 1;
    this.positionX = 52;
    this.positionY = 0;
    this.width = 21;
    this.height = 40;
    this.lives = 3;
    this.speed = 30;
    this.isMoving = false;
    this.isDead = false;
    this.direction = "up";
    this.movementStartTime = null;

    // this.map = null; // Add this line
    // this.tileSize = 40;
  }

  loseLife() {
    this.lives -= 1;
  }

  isAlive() {
    return this.lives > 0;
  }

  UpdatePlayerElement(data) {
    this.playerElement = data.playerElement;
    console.log(this.x, this.y, this.nickname);
  }

  Updatemove(data, room) {
    let movementStartTime = null;
    let lastSendTime = 0;
    const updateInterval = 50;
    const now = Date.now();
    const deltaTime = data.deltaTime;
    const moveSpeed = this.speed * deltaTime;

    const prevX = this.x;
    const prevY = this.y;

    switch (data.direction) {
      case "up":
        this.y -= moveSpeed;
        this.direction = "up";
        this.isMoving = true;
        break;
      case "down":
        this.y += moveSpeed;
        this.direction = "down";
        this.isMoving = true;
        break;
      case "left":
        this.x -= moveSpeed;
        this.direction = "left";
        this.isMoving = true;
        break;
      case "right":
        this.x += moveSpeed;
        this.direction = "right";
        this.isMoving = true;
        break;
      default:
        break;
    }

    const spriteMap = {
      up: [
        { x: 55, y: 82 },
        { x: 28, y: 82 },
        { x: 55, y: 82 },
        { x: 81, y: 82 },
      ],
      right: [
        { x: 30, y: 41 },
        { x: 55, y: 41 },
        { x: 30, y: 41 },
        { x: -5, y: 41 },
      ],
      down: [
        { x: 52, y: 0 },
        { x: 27, y: 0 },
        { x: 52, y: 0 },
        { x: 78, y: 0 },
      ],
      left: [
        { x: -5, y: 124 },
        { x: 30, y: 124 },
        { x: -5, y: 124 },
        { x: 82, y: 124 },
      ],
    };


    if (this.#checkCollision(room)) {
      this.x = prevX;
      this.y = prevY;
    }
    if (this.isMoving) {
      const currentSprite = spriteMap[this.direction];

      if (!this.movementStartTime) this.movementStartTime = Date.now();
      const elapsed = Date.now() - this.movementStartTime;
      const frameDuration = 200;
      const frameIndex =
        Math.floor(elapsed / frameDuration) % currentSprite.length;
      this.positionX = currentSprite[frameIndex].x;
      this.positionY = currentSprite[frameIndex].y;

      const Data = {
        type: "playerMove",
        position: {
          x: this.x,
          y: this.y,
          spriteX: this.positionX,
          spriteY: this.positionY,
          direction: this.direction,
        },
        Id: this.id,
      };

      room.broadcast(Data);
      this.isMoving = false;
    } else {
      if (movementStartTime) {
        const frames = spriteMap[this.direction];
        if (frames) {
          this.positionX = frames[0].x;
          this.positionY = frames[0].y;
        }
        movementStartTime = null;
        this.isMoving = false;
        this.movementStartTime = null;
      }
    }
  }

  #checkCollision(room) {

    const playerLeft = this.x;
    const playerTop = this.y;
    const playerRight = this.x + this.width;
    const playerBottom = this.y + this.height;

    const playerCenterX = this.x + this.width / 2;
    const playerCenterY = this.y + this.height / 2;

    const playerTileX = Math.floor(playerCenterX / room.tileSize);
    const playerTileY = Math.floor(playerCenterY / room.tileSize);

    for (let y = playerTileY - 1; y <= playerTileY + 1; y++) {
      for (let x = playerTileX - 1; x <= playerTileX + 1; x++) {
        if (y >= 0 && y < room.map.length && x >= 0 && x < room.map[0].length) {
          const tileType = room.map[y][x];

          if (
            tileType === 1 ||
            tileType === 2 ||
            tileType === 3 ||
            tileType === 4
          ) {
            const tileLeft = x * room.tileSize;
            const tileTop = y * room.tileSize;
            const tileRight = tileLeft + room.tileSize;
            const tileBottom = tileTop + room.tileSize;

            if (
              playerLeft < tileRight - 6 &&
              playerRight > tileLeft - 4 &&
              playerTop < tileBottom - 16 &&
              playerBottom > tileTop
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
  placebomb(room) {
    const row = Math.floor((this.y + 20) / room.tileSize);
    const col = Math.floor((this.x + 20) / room.tileSize);

    room.broadcast({
      type: "placeBomb",
      position: {
        row: row,
        col: col,
      },
      gift: Math.random() < 0.3,
      index: Math.floor(Math.random() * 3),
    });
  }

//   setMapData(map, tileSize) {
//     this.map = map;
//     this.tileSize = tileSize;
//   }

  isPlayerHitByExplosion(data) {
    const playerCenterX = this.x + this.width / 2;
    const playerCenterY = this.y + this.height / 2;

    const playerTileRow = Math.floor(playerCenterY / this.tileSize);
    const playerTileCol = Math.floor(playerCenterX / this.tileSize);

    if (data.row === playerTileRow && data.col === playerTileCol) {
      this.loseLife();
      console.log("💥 Player hit by explosion!");
      if (!this.isAlive()) {
        this.isDead = true;
        console.log("💀 Player is dead!");
      }
    }
  }
}
