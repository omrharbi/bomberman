import { log } from "console";

export default class Player {
  constructor(nickname, id, conn) {
    this.x = 0;
    this.y = 0;
    this.nickname = nickname;
    this.id = id;
    this.conn = conn;
    this.bombsPlaced = 0;
    this.positionX = 52;
    this.positionY = 0;
    this.width = 21;
    this.height = 40;
    this.lives = 3;
    this.speed = 25;
    this.fire = 1;
    this.isMoving = false;
    this.isDead = false;
    this.direction = "up";
    this.movementStartTime = null;
    this.timePlacbomb = 3000;
    this.lastTimePlacbomb = 0;
    this.rewards = {
      bombing: false,
      speed: false,
      fire: false,
    };
    this.setTimeoutbomb = null;
    this.setTimeoutspeed = null;
    this.setTimeoutfire = null;
    this.overlappingBombs = new Set();
    this.userPx = 5
  }

  loseLife() {
    if (!this.isAlive()) {return}
    this.lives -= 1;
  }

  isAlive() {
    return this.lives > 0;
  }

  Updatemove(data, room) {
    if (!this.isAlive()) {
      return;
    }
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
    } else {
      this.#checkRewardCollection(room);
      this.#updateBombOverlap(room);
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
        element: this.playerElement,
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

  #checkCollision(room, moveSpeed) {
    const playerLeft = this.x;
    const playerTop = this.y;
    const playerRight = this.x + this.width;
    const playerBottom = this.y + this.height;
    let isTouchingRightWall = false;

    const playerCenterX = this.x + this.width / 2;
    const playerCenterY = this.y + this.height / 2;
    const playerTileX = Math.floor(playerCenterX / room.tileSize);
    const playerTileY = Math.floor(playerCenterY / room.tileSize);
    for (let y = playerTileY - 1; y <= playerTileY + 1; y++) {
      for (let x = playerTileX - 1; x <= playerTileX + 1; x++) {
        if (y >= 0 && y < room.map.length && x >= 0 && x < room.map[0].length) {
          const tileType = room.map[y][x];
          const tileTypes = room.map[y][x + 1];
          // Check for collision with wall, block, or bomb (if player is not overlapping it)
          if (
            tileType === 1 ||
            tileType === 2 ||
            tileType === 3 ||
            (tileType === 4 && !this.overlappingBombs.has(`${y}_${x}`))
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
              if (this.direction === "down") {
                const rightEdgeCollision =
                  Math.abs(playerRight - tileLeft + 5) <= 19.75;
                const right = Math.abs(playerRight - tileLeft) > 38;
                console.log(Math.abs(playerRight - tileLeft + 5));

                if (tileType === 0 || tileTypes === 0) {
                  if (rightEdgeCollision) {
                    if (playerLeft <= tileLeft) {
                      isTouchingRightWall = true;
                      this.userPx = Math.min(this.userPx + 0.5, 9);
                      this.x -= this.userPx;
                    }

                    return false;
                  }
                  if (right) {
                    if (playerLeft >= tileLeft) {
                      isTouchingRightWall = true;
                      this.userPx = Math.min(this.userPx + 1, 6);
                      this.x += this.userPx;
                    }
                    return false;
                  }
                }
                return true;
              }

              if (this.direction === "up") {
                if (tileType === 0 || tileTypes === 0) {
                  // console.log(
                  //   "tileType",
                  //   tileType,
                  //   tileTypes,
                  //   "tileTypes",
                  //   "here2"
                  // );

                  const rightEdgeCollision =
                    Math.abs(playerRight - tileLeft + 5) >=48 
                    ||   Math.abs(playerRight - tileLeft) <= 13;
                    // ||
                    // Math.abs(playerRight - tileLeft - 5) > 30;

                  // const liftEdgeCollision =
                  //   Math.abs(playerRight - tileLeft) <= 13;
                    console.log(
                    rightEdgeCollision,
                    Math.abs(playerRight - tileLeft + 5),
                    Math.abs(playerRight - tileLeft - 5),
                    // liftEdgeCollision,
                  );

                  if (rightEdgeCollision ) {
                    if ( rightEdgeCollision && playerLeft <= tileLeft) {
                      isTouchingRightWall = true;
                      this.userPx = Math.min(this.userPx + 1, 9);
                      this.x -= this.userPx;
                    } else if (playerRight >= tileLeft) {
                      isTouchingRightWall = true;
                      this.userPx = Math.min(this.userPx + 1, 9);
                      this.x += this.userPx;
                    }
                    return false;
                  }
                }

                this.y -= this.userPx; // Move the player vertically upward
                return true; // Allow movement
              }

              if (this.direction === "left") {
                if (tileType === 0 || tileTypes === 0) {
                  const bottomEdgeCollision =
                    Math.abs(playerBottom - tileTop) < 15 && tileTop > 0;
                  if (bottomEdgeCollision) {
                    isTouchingRightWall = true;
                    this.userPx = Math.min(this.userPx + 1, 6);
                    this.y -= this.userPx;
                    return false;
                  }
                }
                return true;
              }
              if (this.direction === "right") {
                // console.log(
                //   "tileType",
                //   tileType,
                //   tileTypes,
                //   "tileTypes",
                //    "here"
                // );
                if (tileType === 0 || tileTypes === 0) {
                  const rightEdgeCollision =
                    Math.abs(playerBottom - tileTop) < 15;
                  if (rightEdgeCollision) {
                    if (playerBottom > tileTop) {
                      isTouchingRightWall = true;
                      this.userPx = Math.min(this.userPx + 1, 6);
                      this.y -= this.userPx;
                      this.x += this.userPx;
                      return false;
                    }
                  }
                }
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  #updateBombOverlap(room) {
    const playerCenterX = this.x + this.width / 2;
    const playerCenterY = this.y + this.height / 2;

    const playerTileX = Math.floor(playerCenterX / room.tileSize);
    const playerTileY = Math.floor(playerCenterY / room.tileSize);

    const tileKey = `${playerTileY}_${playerTileX}`;

    const toRemove = [];
    for (const bombKey of this.overlappingBombs) {
      const [bombRow, bombCol] = bombKey.split("_").map(Number);
      const bombTileLeft = bombCol * room.tileSize;
      const bombTileTop = bombRow * room.tileSize;
      const bombTileRight = bombTileLeft + room.tileSize;
      const bombTileBottom = bombTileTop + room.tileSize;

      const outside =
        this.x + this.width < bombTileLeft ||
        this.x > bombTileRight - 6 ||
        this.y + this.height < bombTileTop ||
        this.y > bombTileBottom - 16;

      if (outside) {
        toRemove.push(bombKey);
      }
    }

    for (const key of toRemove) {
      console.log(`Removing bomb overlap: ${key}`);
      this.overlappingBombs.delete(key);
    }

    const mapValid =
      playerTileY >= 0 &&
      playerTileY < room.map.length &&
      playerTileX >= 0 &&
      playerTileX < room.map[0].length;

    if (mapValid) {
      const tileValue = room.map[playerTileY][playerTileX];

      if (tileValue === 4) {
        this.overlappingBombs.add(tileKey);
      }
    }
  }

  placebomb(room) {
    if (!this.rewards.bombing) {
      if (Date.now() - this.lastTimePlacbomb < this.timePlacbomb) {
        return;
      }
    }
    this.lastTimePlacbomb = Date.now();
    if (!this.isAlive()) {
      return;
    }

    this.bombsPlaced = 1;
    const row = Math.floor((this.y + 20) / room.tileSize);
    const col = Math.floor((this.x + 20) / room.tileSize);
    const gift = Math.random() < 0.3;
    const index = Math.floor(Math.random() * 3); // Random index for the gift
    const directions = [
      { dr: -1, dc: 0 }, // Up
      { dr: 0, dc: 1 }, // Right
      { dr: 1, dc: 0 }, // Down
      { dr: 0, dc: -1 }, // Left
    ];
    if (this.rewards.fire) {
      directions.push(
        { dr: -2, dc: 0 }, // Up 2 tiles
        { dr: 0, dc: 2 }, // Right 2 tiles
        { dr: 2, dc: 0 }, // Down 2 tiles
        { dr: 0, dc: -2 } // Left 2 tiles
      );
    }

    const frames = [
      { x: -5, y: 0 }, // Frame 1
      { x: -40, y: 0 }, // Frame 2
      { x: -75, y: 0 }, // Frame 3
      { x: -112, y: 0 }, // Frame 4
      { x: -146, y: 0 }, // Frame 5
      { x: -75, y: 36 }, // Frame 6
      { x: -112, y: 36 }, // Frame 7
      { x: -146, y: 36 }, // Frame 8
    ];

    // Add this bomb to the player's overlapping bombs set
    this.overlappingBombs.add(`${row}_${col}`);

    this.#drawBomb(row, col, room);

    setTimeout(() => {
      this.#removeBomb(row, col, room);
      this.#destroyWall(row, col, gift, index, directions, frames, room);

      // Remove this bomb from the player's overlapping bombs set
      this.overlappingBombs.delete(`${row}_${col}`);
    }, 3000);
  }

  #drawBomb(row, col, room) {
    room.map[row][col] = 4;
    room.broadcast({
      type: "drawBomb",
      position: {
        row: row,
        col: col,
      },
    });
  }

  #removeBomb(row, col, room) {
    room.map[row][col] = 0;
    room.broadcast({
      type: "removeBomb",
      position: {
        row: row,
        col: col,
      },
    });
  }

  #destroyWall(row, col, gift, index, directions, frames, room) {
    room.broadcast({
      type: "drawExplosion",
      position: {
        row: row,
        col: col,
      },
      frames: frames,
    });
    room.broadcast({
      type: "HitByExplosion",
      row: row,
      col: col,
    });
    directions.forEach(({ dr, dc }) => {
      const newRow = row + dr;
      const newCol = col + dc;
      
      room.broadcast({
        type: "HitByExplosion",
        row: newRow,
        col: newCol,
      });
      if (
        newRow >= 0 &&
        newRow < room.map.length &&
        newCol >= 0 &&
        newCol < room.map[0].length
      ) {
        if (room.map[newRow][newCol] === 3) {
          room.map[newRow][newCol] = 0;
          room.broadcast({
            type: "destroyWall",
            position: {
              row: newRow,
              col: newCol,
            },
            gift: gift,
            index: index,
            frames: frames,
          });
          if (gift) {
            room.addReward(newRow, newCol, index);
          }
        } else if (
          room.map[newRow][newCol] === 0 ||
          room.map[newRow][newCol] === 5 ||
          room.map[newRow][newCol] === 6 ||
          room.map[newRow][newCol] === 7 ||
          room.map[newRow][newCol] === 8
        ) {
          room.broadcast({
            type: "drawExplosion",
            position: {
              row: newRow,
              col: newCol,
            },
            frames: frames,
          });
        }
      }
    });
  }

  isPlayerHitByExplosion(data, room) {
    const playerCenterX = this.x + this.width / 2;
    const playerCenterY = this.y + this.height / 2;

    const playerTileRow = Math.floor(playerCenterY / room.tileSize);
    const playerTileCol = Math.floor(playerCenterX / room.tileSize);

    if (data.row === playerTileRow && data.col === playerTileCol) {
      const playersArray = Array.from(room.players.values());

      this.loseLife();
      this.conn.send(
        JSON.stringify({
          type: "hearts",
          Id: this.id,
          hearts: this.lives,
        })
      );
      room.broadcast({
        type : "brodcastplayerinfo",
        players : playersArray
      })

      this.checkPlayerwin(room, Array.from(room.players) )

      if (!this.isAlive()) {
        this.isDead = true;
        room.broadcast({
          type: "playerDead",
          Id: this.id,
        });
      }
    }
  }

  checkPlayerwin(room, players) {    
    let alivePlayers = [];

    for (let index = 0; index < players.length; index++) {
      const player = players[index][1]; // Get the Player object
      if (player.lives > 0) {
        alivePlayers.push(player);
      }
    }
  
    if (alivePlayers.length === 1) {
      room.started = false
      room.broadcast({
        type: "theWinnerIs",
        name:  alivePlayers[0].nickname
      });
    } else if (alivePlayers.length === 0) {
      console.log("No players alive. It's a draw!");
    }
  }

  #checkRewardCollection(room) {
    const playerCenterX = this.x + this.width / 2;
    const playerCenterY = this.y + this.height / 2;

    const playerTileX = Math.floor(playerCenterX / room.tileSize);
    const playerTileY = Math.floor(playerCenterY / room.tileSize);

    if (room.rewards && room.rewards[`${playerTileY}_${playerTileX}`]) {
      const rewardType = room.rewards[`${playerTileY}_${playerTileX}`];
      this.collectReward(rewardType);

      // Broadcast that the reward has been collected
      room.broadcast({
        type: "rewardCollected",
        position: {
          row: playerTileY,
          col: playerTileX,
        },
        playerId: this.id,
        rewardType: rewardType,
      });

      // Remove the reward from the map
      delete room.rewards[`${playerTileY}_${playerTileX}`];
    }
  }

  collectReward(rewardType) {
    const rewardDurations = {
      bomb: 10000,
      speed: 10000,
      fire: 10000,
    };

    const resetReward = (type) => {
      switch (type) {
        case "bomb":
          this.rewards.bombing = false;
          break;
        case "speed":
          this.rewards.speed = false;
          this.speed = 25;
          break;
        case "fire":
          this.rewards.fire = false;
          break;
      }

      this.sendPlayerStatsUpdate();
    };

    switch (rewardType) {
      case "bomb":
        this.rewards.bombing = true;
        clearTimeout(this.bombTimeout);
        this.bombTimeout = setTimeout(
          () => resetReward("bomb"),
          rewardDurations.bomb
        );
        break;
      case "speed":
        this.rewards.speed = true;
        this.speed = 50;
        clearTimeout(this.speedTimeout);
        this.speedTimeout = setTimeout(
          () => resetReward("speed"),
          rewardDurations.speed
        );
        break;
      case "fire":
        this.rewards.fire = true;
        clearTimeout(this.fireTimeout);
        this.fireTimeout = setTimeout(
          () => resetReward("fire"),
          rewardDurations.fire
        );
        break;
      default:
        console.warn(`Unknown reward type: ${rewardType}`);
        return;
    }

    this.sendPlayerStatsUpdate();
  }

  sendPlayerStatsUpdate() {
    this.conn.send(
      JSON.stringify({
        type: "playerStatsUpdate",
        bombPower: this.rewards.bombing,
        speed: this.rewards.speed,
        fire: this.rewards.fire,
      })
    );
  }
}
