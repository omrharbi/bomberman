import { MyEventSystem } from "../src/event.js";
import { createElement, jsx } from "../src/framework.js";
import { updateRender } from "../src/vdom.js";
import Player from "./player.js";
import { socket } from "./index.js";
// import Bomb from "./bombs.js";

export default class Game {
  constructor(tileSize, data) {
    this.tileSize = tileSize;
    this.players = data.players.length;
    this.wall = this.#image("wallBlack.png");
    this.grass = this.#image("grass.png");
    this.bombs = [];
    this.MyId = data.MyId;

    this.map = [
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

    // Player spawn points

    const positionPlayersS = [
      [1, 1],
      [14, 13],
      [1, 15],
      [12, 1],
    ];
    const positionPlayers = positionPlayersS.slice(0, this.players);

    for (let row = 0; row < this.map.length; row++) {
      for (let col = 0; col < this.map[row].length; col++) {
        const playerIndex = positionPlayers.findIndex(
          ([r, c]) => r === row && c === col
        );
        if (playerIndex !== -1) {
          this.map[row][col] = 5 + playerIndex;
        }
      }
    }

    // Create a new Player instance at 1,1
    this.player = new Player(1, 1);
    this.canvas = null;
  }

  #image(fileName) {
    const img = new Image();
    img.src = `../images/${fileName}`;
    return img;
  }

  drawGame(canvas, data) {
    this.canvas = canvas;
    this.#setCanvasSize(canvas);
    this.#draw(canvas, data);
    this.#setupPlayerControls();
  }

  #draw(canvas, data) {
    const rows = this.map.length;
    const columns = this.map[0].length;

    canvas.innerHTML = "";
    canvas.style.display = "grid";
    canvas.style.gridTemplateRows = `repeat(${rows}, ${this.tileSize}px)`;
    canvas.style.gridTemplateColumns = `repeat(${columns}, ${this.tileSize}px)`;
    canvas.style.alignContent = "center";
    canvas.style.justifyContent = "center";
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const tile = this.map[row][column];
        const imgProps = {};
        let divStyle = ""; // for inline styles
        let classname = "";
        let divId = "";
        switch (tile) {
          case 1:
          case 4:
            imgProps.src = "../images/wallBlack.png";
            divId = "wallfix";
            classname = "tile";
            break;
          case 2:
            imgProps.src = "../images/tree.png";
            divId = "WallBreak";
            classname = "tile";
            break;
          case 3:
            imgProps.src = "../images/wall.png";
            divId = "WallBreak";
            classname = "tile";
            break;
          case 5:
            divStyle = "url(../images/playerStyle.png)";
            divId = `player_${data.players[0].playerId}`;
            classname = "player";
            break;
          case 6:
            divStyle = "url(../images/playerblue.webp)";
            divId = `player_${data.players[1].playerId}`;
            classname = "player";
            break;
          case 7:
            divStyle = "url(../images/playerGreen.webp)";
            divId = `player_${data.players[2].playerId}`;
            classname = "player";
            break;
          case 8:
            divStyle = "url(../images/playerStyle.png)";
            divId = `player_${data.players[3].playerId}`;
            classname = "player";
            break;
          default:
            break;
        }
        const imgnode = imgProps.src ? jsx("img", imgProps) : [];
        // const img = createElement(imgnode)
        const divnode = jsx(
          "div",
          {
            className: `${classname}`,
            "data-row": row,
            "data-column": column,
            id: divId || "no_id",
            style: `background-image :${divStyle}`,
          },
          imgnode
        );
        const div = createElement(divnode);
        canvas.appendChild(div);
      }
    }
  }

  #setCanvasSize(canvas) {
    canvas.style.height = `${this.map.length * this.tileSize}px`;
    canvas.style.width = `${this.map[0].length * this.tileSize}px`;
  }

  #setupPlayerControls() {
    let keysPressed = {};
    let movementStartTime = null;
    let lastUpdateTime = Date.now();
    let lastSendTime = 0;
    const updateInterval = 50;

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

    window.addEventListener("keydown", (e) => {
      keysPressed[e.key] = true;

      if ((e.key === "b" || e.key === "B") && !e.repeat) {
        const row = Math.floor((this.player.y + 20) / this.tileSize) + 1;
        const col = Math.floor((this.player.x + 20) / this.tileSize) + 1;
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "placeBomb",
              position: {
                row: row,
                col: col,
              },
            })
          );
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      keysPressed[e.key] = false;
    });

    const updatePlayerMovement = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime) / 100;
      lastUpdateTime = now;
      const updateInterval = 50;

      this.player.isMoving = false;
      const playerElement = document.getElementById(`player_${this.MyId}`);

      if (keysPressed["w"]) {
        this.player.y -= this.player.speed * deltaTime;
        this.player.direction = "up";
        this.player.isMoving = true;
      }
      if (keysPressed["d"]) {
        this.player.x += this.player.speed * deltaTime;
        this.player.direction = "right";
        this.player.isMoving = true;
      }
      if (keysPressed["s"]) {
        this.player.y += this.player.speed * deltaTime;
        this.player.direction = "down";
        this.player.isMoving = true;
      }
      if (keysPressed["a"]) {
        this.player.x -= this.player.speed * deltaTime;
        this.player.direction = "left";
        this.player.isMoving = true;
      }
      if (this.player.isMoving) {
        spriteMap[this.player.direction];
        console.log("direction", this.player.direction);

        if (!movementStartTime) movementStartTime = now;
        const elapsed = now - movementStartTime;
        const frameDuration = 200;
        const frames = spriteMap[this.player.direction];
        const frameIndex = Math.floor(elapsed / frameDuration) % frames.length;
        this.player.positionX = frames[frameIndex].x;
        this.player.positionY = frames[frameIndex].y;

        playerElement.style.width = this.player.width + "px";
        playerElement.style.height = this.player.height + "px";
        playerElement.style.backgroundImage = `url(${this.player.style})`;
        playerElement.style.backgroundPositionY = this.player.positionY + "px";
        playerElement.style.backgroundPositionX = this.player.positionX + "px";
        playerElement.style.transform = `translate(${this.player.x}px, ${this.player.y}px)`;

        if (now - lastSendTime > updateInterval) {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "playerMove",
                // Send both actual position AND sprite position
                position: {
                  x: this.player.x,
                  y: this.player.y,
                  spriteX: this.player.positionX,
                  spriteY: this.player.positionY,
                  direction: this.player.direction,
                },
              })
            );
            lastSendTime = now;
          }
        }
      } else {
        if (movementStartTime) {
          const frames = spriteMap[this.player.direction];
          this.player.positionX = frames[0].x;
          this.player.positionY = frames[0].y;
          movementStartTime = null;
        }
      }

      if (playerElement) {
        playerElement.style.transform = `translate(${this.player.x}px, ${this.player.y}px)`;
      }

      requestAnimationFrame(updatePlayerMovement);
    };

    updatePlayerMovement();
  }

  placeBomb(row, col) {
    if (this.map[row][col] !== 0) return; // check if empty palce and the are problem in the 5 for rist place for player
    this.#drawBomb(row, col);

    setTimeout(() => {
      this.#removeBomb(row, col);
      // this.#Destroywall(row, col);
    }, 3000);
  }

  // #Destroywall(row, col) {
  //   console.log("Destroywall", row, col);
  //   const directions = [
  //     { dr: -1, dc: 0 }, // Up
  //     { dr: 0, dc: 1 }, // Right
  //     { dr: 1, dc: 0 }, // Down
  //     { dr: 0, dc: -1 }, // Left
  //   ];

  //   directions.forEach(({ dr, dc }) => {
  //     const newRow = row + dr;
  //     const newCol = col + dc;

  //     // Check boundaries
  //     if (
  //       newRow >= 0 &&
  //       newRow < this.map.length &&
  //       newCol >= 0 &&
  //       newCol < this.map[0].length
  //     ) {
  //       // Check if the tile is a destroyable wall (3)
  //       if (this.map[newRow][newCol] === 3) {
  //         this.map[newRow][newCol] = 0; 
  //         const tileElement = this.canvas.querySelector(
  //           `[data-row="${newRow}"][data-column="${newCol}"]`
  //         );
  //         if (tileElement) {
  //           tileElement.innerHTML = "";
  //         }
  //       }
  //     }
  //   });
  // }

  #drawBomb(row, col) {
    const tileElement = this.canvas.querySelector(
      `[data-row="${row}"][data-column="${col}"]`
    );

    if (tileElement && !tileElement.querySelector(".bomb")) {
      const bombDiv = document.createElement("div");
      bombDiv.classList.add("bomb");

      // Use background image for sprite sheet
      bombDiv.style.backgroundImage = "url('../images/bomb.png')"; // add the class bomb style
      // bombDiv.style.backgroundRepeat = "no-repeat";
      // bombDiv.style.position = "absolute";
      bombDiv.style.width = "38px"; // or frame width
      bombDiv.style.height = "38px"; // or frame height

      tileElement.appendChild(bombDiv);
    }
  }

  #removeBomb(row, col) {
    console.log("removeBomb", row, col);
    
    const tileElement = this.canvas.querySelector(
      `[data-row="${row}"][data-column="${col}"]`
    );
    const bombImg = tileElement?.querySelector(".bomb");
    if (bombImg) {
      bombImg.remove();

      const directions = [
        { dr: -1, dc: 0 }, // up
        { dr: 0, dc: 1 }, // right
        { dr: 1, dc: 0 }, // down
        { dr: 0, dc: -1 }, // left
      ];

      directions.forEach(({ dr, dc }) => {
        const newRow = row + dr * 1;
        const newCol = col + dc * 1;
        // this.map[newRow][newCol]
        if (this.map[newRow][newCol] === 0) {
          const targetTile = this.canvas.querySelector(
            `[data-row="${newRow}"][data-column="${newCol}"]`
          );

          if (targetTile) {
            this.#drawExplosion(targetTile, newRow, newCol);
          }
        } else if (this.map[newRow][newCol] === 3) {
          this.map[newRow][newCol] = 0; 
          const tileElement = this.canvas.querySelector(
            `[data-row="${newRow}"][data-column="${newCol}"]`
          );
          if (tileElement) {
            tileElement.innerHTML = "";
            this.#drawExplosion(tileElement, newRow, newCol);
          }
        }
      });

      this.#drawExplosion(tileElement);
    }
  }

  #drawExplosion(tileElement) {
    if (!tileElement) return;

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

    let currentFrame = 0;
    const frameDuration = 75;
    const divnode = jsx("div", {
      className: "damage",
      style: `background-position : ${frames[0].x}px ${frames[0].y}px`,
    });
    const explosionDiv = createElement(divnode);

    tileElement.appendChild(explosionDiv);

    const animate = () => {
      if (currentFrame >= frames.length) {
        explosionDiv.remove();
        return;
      }

      explosionDiv.style.backgroundPosition = `${frames[currentFrame].x}px ${frames[currentFrame].y}px`;
      currentFrame++;
      requestAnimationFrame(() => {
        setTimeout(animate, frameDuration);
      });
    };

    animate();
  }
}
