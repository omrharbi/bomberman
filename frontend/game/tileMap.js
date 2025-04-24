import { MyEventSystem } from "../src/event.js";
import { createElement, jsx } from "../src/framework.js";
import { updateRender } from "../src/vdom.js";
import { socket } from "./index.js";

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
          console.log("Initial position:", initialX, initialY);

          playerDiv.style.transform = `translate(${initialX}px, ${initialY}px)`;
          // if (data.players[playerIndex].playerId === this.MyId) {
          socket.send(
            JSON.stringify({
              type: "PlayerElement",
              playerElement: playerDiv,
            })
          );
          // }
          console.log(`this.map[${row}][${column}]`, this.map[row][column]);

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
        console.log("Placing bomb");
        
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
}
