import { MyEventSystem } from "../src/event.js";
import { createElement, jsx } from "../src/framework.js";
import { socket } from "./index.js";

export const playersElement = new Map();
export default class Game {
  constructor(tileSize, data) {
    this.tileSize = tileSize;
    this.players = data.players.length;
    this.wall = this.#image("wallBlack.png");
    this.bombs = [];
    this.MyId = data.MyId;
    this.map = data.map;
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
    console.log("Drawing game with data:", data);

    const rows = this.map.length;
    const columns = this.map[0].length;

    canvas.innerHTML = "";
    canvas.style.display = "grid";
    canvas.style.gridTemplateRows = `repeat(${rows}, ${this.tileSize}px)`;
    canvas.style.gridTemplateColumns = `repeat(${columns}, ${this.tileSize}px)`;
    canvas.style.alignContent = "center";
    canvas.style.justifyContent = "center";
    canvas.style.position = "relative"; // FIX: Add position relative to allow absolute positioning of children

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const tile = this.map[row][column];
        const imgProps = {};
        let divStyle = ""; // for inline styles
        let classname = "";
        let divId = "";
        let initialX = 0;
        let initialY = 0;

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
          case 0:
            classname = "tile";
            break;
          case 5:
            initialX = column * this.tileSize;
            initialY = row * this.tileSize;
            break;
          case 6:
            initialX = column * this.tileSize;
            initialY = row * this.tileSize;
            break;
          case 7:
            initialX = column * this.tileSize;
            initialY = row * this.tileSize;
            break;
          case 8:
            initialX = column * this.tileSize;
            initialY = row * this.tileSize;
            break;
          default:
            classname = "tile";
            break;
        }

        // Create tile with background image
        const imgnode = imgProps.src ? jsx("img", imgProps) : [];
        const divnode = jsx(
          "div",
          {
            className: classname,
            "data-row": row,
            "data-column": column,
            id: divId || `tile_${row}_${column}`,
            style: divStyle ? `background-image: ${divStyle}` : "",
            "data-initial-x": initialX, // Change to data attributes
            "data-initial-y": initialY, // Change to data attributes
          },
          imgnode
        );

        const div = createElement(divnode);
        canvas.appendChild(div);

        if (tile >= 5 && tile <= 8) {
          const playerIndex = tile - 5;
          const playerStyles = [
            "url('../images/playerStyle.png')",
            "url('../images/playerblue.webp')",
            "url('../images/playerGreen.webp')",
            "url('../images/playerStyle.png')",
          ];

          const playerDiv = document.createElement("div");
          playerDiv.className = "player";
          playerDiv.id = `player_${data.players[playerIndex].id}`;
          playerDiv.style.backgroundImage = playerStyles[playerIndex];
          playerDiv.style.width = "27px;"; // FIX: Set explicit sizes
          playerDiv.style.height = "40px";
          playerDiv.style.position = "absolute";
          playerDiv.style.zIndex = "10";

          // FIX: Initially position player at their spawn tile
          const initialX = column * this.tileSize;
          const initialY = row * this.tileSize;

          playerDiv.style.transform = `translate(${initialX}px, ${initialY}px)`;
          // if (data.players[playerIndex].playerId === this.MyId) {          
          socket.send(
            JSON.stringify({
              type: "PlayerElement",
              playerElement: playerDiv,
            })
          );
          playersElement.set(data.players[playerIndex].id, playerDiv);

          canvas.appendChild(playerDiv);
        }
      }
    }
  }

  #setCanvasSize(canvas) {
    canvas.style.height = `${this.map.length * this.tileSize}px`;
    canvas.style.width = `${this.map[0].length * this.tileSize}px`;
  }

  #setupPlayerControls() {
    let keysPressed = {};
    let lastUpdateTime = Date.now();
    let lastSendTime = 0;
    const updateInterval = 50;

    window.addEventListener("keydown", (e) => {
      keysPressed[e.key] = true;

      if ((e.key === "b" || e.key === "B") && !e.repeat) {
        // const tileSize = this.tileSize;
        // const row = Math.floor((data.player.y + 20) / tileSize);
        // const col = Math.floor((data.player.x + 20) / tileSize);

        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "placeBomb",
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

      let direction;
      if (keysPressed["w"] || keysPressed["ArrowUp"]) {
        direction = "up";
      }
      if (keysPressed["d"] || keysPressed["ArrowRight"]) {
        direction = "right";
      }
      if (keysPressed["s"] || keysPressed["ArrowDown"]) {
        direction = "down";
      }
      if (keysPressed["a"] || keysPressed["ArrowLeft"]) {
        direction = "left";
      }

      if (now - lastSendTime > updateInterval) {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "playerMove",
              direction: direction,
              deltaTime: deltaTime,
            })
          );
          lastSendTime = now;
        }
      }

      requestAnimationFrame(updatePlayerMovement);
    };

    updatePlayerMovement();
  }

 

  placeBomb(row, col, gift, index) {
    // Check if position is valid and not already occupied by a wall

    if (
      row < 0 ||
      row >= this.map.length ||
      col < 0 ||
      col >= this.map[0].length
    ) {
      console.log("Invalid bomb position:", row, col);
      return;
    }

    if (this.map[row][col] !== 0 && this.map[row][col] < 5) {
      console.log("Cannot place bomb on wall or obstacle:", row, col);
      return;
    }

    this.#drawBomb(row, col);

    setTimeout(() => {
      this.#removeBomb(row, col);
      this.#destroyWall(row, col, gift, index);
    }, 3000);
  }

  #destroyWall(row, col, gift, index) {
    console.log("Destroying walls at:", row, col);
    const directions = [
      { dr: -1, dc: 0 }, // Up
      { dr: 0, dc: 1 }, // Right
      { dr: 1, dc: 0 }, // Down
      { dr: 0, dc: -1 }, // Left
    ];

    // Center explosion
    this.#drawExplosion(
      this.canvas.querySelector(`[data-row="${row}"][data-column="${col}"]`),
      row,
      col
    );

    directions.forEach(({ dr, dc }) => {
      const newRow = row + dr;
      const newCol = col + dc;

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "loselife",
            row: newRow,
            col: newCol,
          })
        );
      }

      // Check boundaries
      if (
        newRow >= 0 &&
        newRow < this.map.length &&
        newCol >= 0 &&
        newCol < this.map[0].length
      ) {
        // Check if the tile is a destroyable wall (3)
        if (this.map[newRow][newCol] === 3) {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "destroywall",
                row: newRow,
                col: newCol,
              })
            );
          }
          this.map[newRow][newCol] = 0;
          const tileElement = this.canvas.querySelector(
            `[data-row="${newRow}"][data-column="${newCol}"]`
          );
          if (tileElement) {
            if (gift) {
              const power = [
                "../images/bombing.webp",
                "../images/speed.webp",
                "../images/spoil_tileset.webp",
              ];
              tileElement.innerHTML =
                '<img src="' +
                power[index] +
                '" style="width: 38px; height: 38px; position: absolute; top: 0; left: 0;">';
              gift = false;
            } else {
              tileElement.innerHTML = "";
              this.#drawExplosion(tileElement, newRow, newCol);
            }
          }
        } else if (this.map[newRow][newCol] === 0) {
          const tileElement = this.canvas.querySelector(
            `[data-row="${newRow}"][data-column="${newCol}"]`
          );
          if (tileElement) {
            this.#drawExplosion(tileElement, newRow, newCol);
          }
        }
      }
    });
  }

  #drawBomb(row, col) {
    const tileElement = this.canvas.querySelector(
      `[data-row="${row}"][data-column="${col}"]`
    );


    if (tileElement && !tileElement.querySelector(".bomb")) {
      const bombDiv = document.createElement("div");
      bombDiv.classList.add("bomb");

      // Use background image for sprite sheet
      bombDiv.style.backgroundImage = "url('../images/bomb.png')";
      bombDiv.style.width = "38px";
      bombDiv.style.height = "38px";
      // bombDiv.style.position = "absolute";
      bombDiv.style.zIndex = "5";

      // Center the bomb in the tile
      bombDiv.style.left = "50%";
      bombDiv.style.top = "50%";
      // bombDiv.style.transform = "translate(-50%, -50%)";

      tileElement.appendChild(bombDiv);
    }
  }

  #removeBomb(row, col) {
    console.log("Removing bomb at:", row, col);

    const tileElement = this.canvas.querySelector(
      `[data-row="${row}"][data-column="${col}"]`
    );
    const bombImg = tileElement?.querySelector(".bomb");

    if (bombImg) {
      bombImg.remove();
    }
  }

  #drawExplosion(tileElement, row, col) {
    if (!tileElement) {
      console.error(
        "Cannot draw explosion - tile element not found at:",
        row,
        col
      );
      return;
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

    let currentFrame = 0;
    const frameDuration = 75;

    const explosionDiv = document.createElement("div");
    explosionDiv.className = "damage";
    explosionDiv.style.backgroundPosition = `${frames[0].x}px ${frames[0].y}px`;
    explosionDiv.style.backgroundImage = "url('../images/explosion.png')";
    // explosionDiv.style.position = "absolute";
    explosionDiv.style.width = "38px";
    explosionDiv.style.height = "38px";
    explosionDiv.style.zIndex = "6";

    // Center the explosion in the tile
    explosionDiv.style.left = "50%";
    explosionDiv.style.top = "50%";
    // explosionDiv.style.transform = "translate(-50%, -50%)";

    tileElement.appendChild(explosionDiv);

    const animate = () => {
      if (currentFrame >= frames.length) {
        explosionDiv.remove();
        return;
      }

      explosionDiv.style.backgroundPosition = `${frames[currentFrame].x}px ${frames[currentFrame].y}px`;
      currentFrame++;

      setTimeout(animate, frameDuration);
    };

    animate();
  }
}
