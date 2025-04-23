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

    // Create a new Player instance and position them at their pixel position
    // FIX: Updated to use tileSize to calculate pixel position
    this.player = new Player(1 * this.tileSize, 1 * this.tileSize);
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
            divId = `player_${data.players[0].playerId}_tile`;
            classname = "tile";

            initialX = column * this.tileSize
            initialY = row * this.tileSize
            break;
          case 6:
            divId = `player_${data.players[1].playerId}_tile`;
            classname = "tile";
            initialX = column * this.tileSize
            initialY = row * this.tileSize
            break;
          case 7:
            divId = `player_${data.players[2].playerId}_tile`;
            classname = "tile";
            initialX = column * this.tileSize
            initialY = row * this.tileSize
            break;
          case 8:
            divId = `player_${data.players[3].playerId}_tile`;
            classname = "tile";
            initialX = column * this.tileSize
            initialY = row * this.tileSize
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
            "data-initial-y": initialY  // Change to data attributes
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
            "url('../images/playerStyle.png')"
          ];
          
          const playerDiv = document.createElement("div");
          playerDiv.className = "player";
          playerDiv.id = `player_${data.players[playerIndex].playerId}`;
          playerDiv.style.backgroundImage = playerStyles[playerIndex];
          playerDiv.style.width = "27px;";  // FIX: Set explicit sizes
          playerDiv.style.height = "40px";
          playerDiv.style.position = "absolute";
          playerDiv.style.zIndex = "10";
          
          // FIX: Initially position player at their spawn tile
          const initialX = column * this.tileSize;
          const initialY = row * this.tileSize;
          
          if (data.players[playerIndex].playerId === this.MyId) {
            this.player.x = initialX;
            this.player.y = initialY;
          }
          
          playerDiv.style.transform = `translate(${initialX}px, ${initialY}px)`;
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
        const tileSize = this.tileSize;
        const row = Math.floor((this.player.y + 20) / tileSize);
        const col = Math.floor((this.player.x + 20) / tileSize);
        
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

      this.player.isMoving = false;
      const playerElement = document.getElementById(`player_${this.MyId}`);
      if (!playerElement) {
        console.log("Player element not found:", this.MyId);
        requestAnimationFrame(updatePlayerMovement);
        return; // Skip if player element doesn't exist yet
      }

      // Store previous position for collision detection
      const prevX = this.player.x;
      const prevY = this.player.y;

      // FIX: Slow down movement speed slightly to make it more controllable
      const moveSpeed = this.player.speed * deltaTime;

      if (keysPressed["w"] || keysPressed["ArrowUp"]) {  // FIX: Add arrow keys support
        this.player.y -= moveSpeed;
        this.player.direction = "up";
        this.player.isMoving = true;
      }
      if (keysPressed["d"] || keysPressed["ArrowRight"]) {
        this.player.x += moveSpeed;
        this.player.direction = "right";
        this.player.isMoving = true;
      }
      if (keysPressed["s"] || keysPressed["ArrowDown"]) {
        this.player.y += moveSpeed;
        this.player.direction = "down";
        this.player.isMoving = true;
      }
      if (keysPressed["a"] || keysPressed["ArrowLeft"]) {
        this.player.x -= moveSpeed;
        this.player.direction = "left";
        this.player.isMoving = true;
      }

      // Basic collision detection
      if (this.#checkCollision()) {
        this.player.x = prevX;
        this.player.y = prevY;
      }

      // Check if player is moving
      if (this.player.isMoving) {
        const currentSprite = spriteMap[this.player.direction];
        if (!currentSprite) {
          console.error("Invalid direction:", this.player.direction);
          requestAnimationFrame(updatePlayerMovement);
          return;
        }

        if (!movementStartTime) movementStartTime = now;
        const elapsed = now - movementStartTime;
        const frameDuration = 200;
        const frameIndex = Math.floor(elapsed / frameDuration) % currentSprite.length;
        this.player.positionX = currentSprite[frameIndex].x;
        this.player.positionY = currentSprite[frameIndex].y;

        if (now - lastSendTime > updateInterval) {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "playerMove",
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
          if (frames) {
            this.player.positionX = frames[0].x;
            this.player.positionY = frames[0].y;
          }
          movementStartTime = null;
        }
      }
      
      // FIX: Debug the player element and position
      // console.log("Player position:", this.player.x, this.player.y);
      // console.log("Player element:", playerElement ? "found" : "not found");

      if (playerElement) {
        // FIX: Set explicit positioning and apply transformation for movement
        playerElement.style.width = this.player.width;
        playerElement.style.height = this.player.height;
        playerElement.style.backgroundImage = `url(${this.player.style || '../images/playerStyle.png'})`;
        // playerElement.style.backgroundPositionX = this.player.positionX + "px";
        // playerElement.style.backgroundPositionY = this.player.positionY + "px";
        // playerElement.style.transform = `translate(${this.player.x}px, ${this.player.y}px)`;
        playerElement.style.position = "absolute";
        playerElement.style.zIndex = "10";
      }

      requestAnimationFrame(updatePlayerMovement);
    };

    // Start the animation loop
    updatePlayerMovement();
  }

  // Improved collision detection method
  #checkCollision() {
    // FIX: Add a small buffer to make collision detection more forgiving
    const buffer = 4;
    const playerWidth = this.player.width - buffer * 2;
    const playerHeight = this.player.height - buffer * 2;
    
    // Center point of player for more accurate collision
    const playerCenterX = this.player.x + (this.player.width / 2);
    const playerCenterY = this.player.y + (this.player.height / 2);
    
    // Calculate player's bounding box with buffer
    const playerLeft = this.player.x + buffer;
    const playerTop = this.player.y + buffer;
    const playerRight = this.player.x + playerWidth;
    const playerBottom = this.player.y + playerHeight;
    
    // Get the player's current position in tiles
    const playerTileX = Math.floor(playerCenterX / this.tileSize);
    const playerTileY = Math.floor(playerCenterY / this.tileSize);
    
    // Check surrounding tiles (3x3 grid)
    for (let y = playerTileY - 1; y <= playerTileY + 1; y++) {
      for (let x = playerTileX - 1; x <= playerTileX + 1; x++) {
        // Check if tile is within map bounds
        if (
          y >= 0 && y < this.map.length &&
          x >= 0 && x < this.map[0].length
        ) {
          // Check if the tile is a wall (1, 2, 3, 4)
          const tileType = this.map[y][x];
          if (tileType === 1 || tileType === 2 || tileType === 3 || tileType === 4) {
            // Calculate tile bounds
            const tileLeft = x * this.tileSize;
            const tileTop = y * this.tileSize;
            const tileRight = tileLeft + this.tileSize;
            const tileBottom = tileTop + this.tileSize;
            
            // Check for rectangle collision
            if (
              playerLeft < tileRight &&
              playerRight > tileLeft &&
              playerTop < tileBottom &&
              playerBottom > tileTop
            ) {
              return true; // Collision detected
            }
          }
        }
      }
    }
    
    return false; // No collision
  }

  placeBomb(row, col, gift , index) {
    // Check if position is valid and not already occupied by a wall
    if (row < 0 || row >= this.map.length || col < 0 || col >= this.map[0].length) {
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
      this.#destroyWall(row, col,gift , index);
    }, 3000);
  }

  #destroyWall(row, col,gift , index) {
    console.log("Destroying walls at:", row, col);
    const directions = [
      { dr: -1, dc: 0 }, // Up
      { dr: 0, dc: 1 },  // Right
      { dr: 1, dc: 0 },  // Down
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

      // Check boundaries
      if (
        newRow >= 0 &&
        newRow < this.map.length &&
        newCol >= 0 &&
        newCol < this.map[0].length
      ) {
        // Check if the tile is a destroyable wall (3)
        if (this.map[newRow][newCol] === 3) {
          this.map[newRow][newCol] = 0; 
          const tileElement = this.canvas.querySelector(
            `[data-row="${newRow}"][data-column="${newCol}"]`
          );
          if (tileElement) {
            if (gift) {
              const  power = ['../images/bombing.webp','../images/speed.webp','../images/spoil_tileset.webp']
              tileElement.innerHTML = '<img src="'+power[index]+'" style="width: 38px; height: 38px; position: absolute; top: 0; left: 0;">';
              gift = false              
            } else {
            tileElement.innerHTML = "";;
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
      bombDiv.style.position = "absolute";
      bombDiv.style.zIndex = "5";
      
      // Center the bomb in the tile
      bombDiv.style.left = "50%";
      bombDiv.style.top = "50%";
      bombDiv.style.transform = "translate(-50%, -50%)";

      tileElement.appendChild(bombDiv)
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
      console.error("Cannot draw explosion - tile element not found at:", row, col);
      return;
    }

    const frames = [
      { x: -5, y: 0 },    // Frame 1
      { x: -40, y: 0 },   // Frame 2
      { x: -75, y: 0 },   // Frame 3
      { x: -112, y: 0 },  // Frame 4
      { x: -146, y: 0 },  // Frame 5
      { x: -75, y: 36 },  // Frame 6
      { x: -112, y: 36 }, // Frame 7
      { x: -146, y: 36 }, // Frame 8
    ];

    let currentFrame = 0;
    const frameDuration = 75;
    
    const explosionDiv = document.createElement("div");
    explosionDiv.className = "damage";
    explosionDiv.style.backgroundPosition = `${frames[0].x}px ${frames[0].y}px`;
    explosionDiv.style.backgroundImage = "url('../images/explosion.png')";
    explosionDiv.style.position = "absolute";
    explosionDiv.style.width = "38px";
    explosionDiv.style.height = "38px";
    explosionDiv.style.zIndex = "6";
    
    // Center the explosion in the tile
    explosionDiv.style.left = "50%";
    explosionDiv.style.top = "50%";
    explosionDiv.style.transform = "translate(-50%, -50%)";
    
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