import Player from "./player.js";
// import Bomb from "./bombs.js";

export default class Game {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.wall = this.#image("wallBlack.png");
    this.grass = this.#image("grass.png");
    this.bombs = [];

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
    const positionPlayers = [[1, 1]];

    for (let row = 0; row < this.map.length; row++) {
      for (let col = 0; col < this.map[row].length; col++) {
        if (positionPlayers.some(([r, c]) => r === row && c === col)) {
          this.map[row][col] = 5;
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

  drawGame(canvas) {
    this.canvas = canvas; 
    this.#setCanvasSize(canvas);
    this.#draw(canvas);
    this.#setupPlayerControls();
  }

  #draw(canvas) {
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
        const div = document.createElement("div");
        const img = document.createElement("img");

        div.classList.add("tile");
        div.dataset.row = row;
        div.dataset.column = column;

        switch (tile) {
          case 1:
          case 4:
            img.src = "../images/wallBlack.png";
            div.appendChild(img);
            break;
          case 2:
            img.src = "../images/tree.png";
            div.appendChild(img);
            break;
          case 3:
            img.src = "../images/wall.png";
            div.appendChild(img);
            break;
          case 5:
            div.style.backgroundImage = `url(../images/playerStyle.png)`;
            div.id = "player";
            break;
          default:

            break;
        }
        
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

    const spriteMap = {
      up: [{ x: 55, y: 82 }, { x: 28, y: 82 }, { x: 55, y: 82 }, { x: 81, y: 82 }],
      right: [{ x: 30, y: 41 }, { x: 55, y: 41 }, { x: 30, y: 41 }, { x: -5, y: 41 }],
      down: [{ x: 52, y: 0 }, { x: 27, y: 0 }, { x: 52, y: 0 }, { x: 78, y: 0 }],
      left: [{ x: -5, y: 124 }, { x: 30, y: 124 }, { x: -5, y: 124 }, { x: 82, y: 124 }],
    };

    window.addEventListener("keydown", (e) => {
      keysPressed[e.key] = true;

      if ((e.key === "b" || e.key === "B") && !e.repeat) {
        this.placeBomb();
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
      const playerElement = document.getElementById("player");

      if (keysPressed["ArrowUp"]) {
        this.player.y -= this.player.speed * deltaTime;
        this.player.direction = "up";
        this.player.isMoving = true;
      }
      if (keysPressed["ArrowRight"]) {
        this.player.x += this.player.speed * deltaTime;
        this.player.direction = "right";
        this.player.isMoving = true;
      }
      if (keysPressed["ArrowDown"]) {
        this.player.y += this.player.speed * deltaTime;
        this.player.direction = "down";
        this.player.isMoving = true;
      }
      if (keysPressed["ArrowLeft"]) {
        this.player.x -= this.player.speed * deltaTime;
        this.player.direction = "left";
        this.player.isMoving = true;
      }

      if (this.player.isMoving) {
        spriteMap[this.player.direction]
        console.log("direction", this.player.direction);
        
        if (!movementStartTime) movementStartTime = now;
        const elapsed = now - movementStartTime;
        const frameDuration = 200;
        const frames = spriteMap[this.player.direction];
        const frameIndex = Math.floor(elapsed / frameDuration) % frames.length;
        this.player.positionX = frames[frameIndex].x;
        this.player.positionY = frames[frameIndex].y;

        playerElement.style.width = this.player.width + 'px';
        playerElement.style.height = this.player.height + 'px';
        playerElement.style.backgroundImage = `url(${this.player.style})`;
        playerElement.style.backgroundPositionY = this.player.positionY + 'px';
        playerElement.style.backgroundPositionX = this.player.positionX + 'px';
        playerElement.style.transform = `translate(${this.player.x}px, ${this.player.y}px)`;

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

  placeBomb() {
    const row = Math.floor((this.player.y +  20 )   / this.tileSize) + 1;
    const col = Math.floor((this.player.x + 20 ) / this.tileSize) + 1;
    
    // Check if tile is walkable (optional)
    // console.log("this.player.y", this.player.y);
    // console.log("this.player.x", this.player.x);

    
    // console.log("row",row);
    // console.log("col", col)
    // console.log(this.map[row][col]);
    // console.log(this.map);
    
    
    
    if (this.map[row][col] !== 0) return; // check if empty palce and the are problem in the 5 for rist place for player

    // const bomb = new Bomb(row, col);
    // this.bombs.push(bomb); // maby later we can use it 
    this.#drawBomb(row, col);

    // Remove bomb after 2 seconds
    setTimeout(() => {
      this.#removeBomb(row, col);
    }, 3000);
  }


  #drawBomb(row, col) {
    const tileElement = this.canvas.querySelector(
      `[data-row="${row}"][data-column="${col}"]`
    );
    
    if (tileElement && !tileElement.querySelector('.bomb')) {
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
    const tileElement = this.canvas.querySelector(
        `[data-row="${row}"][data-column="${col}"]`
    );
    const bombImg = tileElement?.querySelector('.bomb');
    if (bombImg) {
        bombImg.remove();
        
        // Spread explosion in 4 directions (up, right, down, left)
        const directions = [
            { dr: -1, dc: 0 },  // up
            { dr: 0, dc: 1 },   // right
            { dr: 1, dc: 0 },   // down
            { dr: 0, dc: -1 }   // left
        ];

        // Create explosions in all directions
        directions.forEach(({ dr, dc }) => {
            for (let i = 1; i <= 1; i++) { // 3 tiles range
                const newRow = row + (dr * i);
                const newCol = col + (dc * i);
                
                // Check if within map bounds
                if (newRow >= 0 && newRow < this.map.length && 
                    newCol >= 0 && newCol < this.map[0].length) {
                    
                    const targetTile = this.canvas.querySelector(
                        `[data-row="${newRow}"][data-column="${newCol}"]`
                    );
                    
                    if (targetTile) {
                        this.#drawExplosion(targetTile, newRow, newCol);
                    }
                }
            }
        });

        // Center explosion
        this.#drawExplosion(tileElement, row, col);
    }
}

#drawExplosion(tileElement, row, col) {
    if (!tileElement) return;

    const explosionDiv = document.createElement("div");
    explosionDiv.classList.add("damage");
    
    // Correct frame sequence
    const frames = [
        { x: -5, y: 0 },    // Frame 1
        { x: -40, y: 0 },   // Frame 2
        { x: -75, y: 0 },   // Frame 3
        { x: -112, y: 0 },  // Frame 4
        { x: -146, y: 0 },  // Frame 5
        { x: -75, y: 36 },  // Frame 6
        { x: -112, y: 36 }, // Frame 7
        { x: -146, y: 36 }  // Frame 8
    ];

    let currentFrame = 0;
    const frameDuration = 75;
    explosionDiv.style.backgroundPosition = `${frames[0].x}px ${frames[0].y}px`;

    tileElement.appendChild(explosionDiv);

    const animate = () => {
        if (currentFrame >= frames.length) {
            explosionDiv.remove();
            return;
        }

        explosionDiv.style.backgroundPosition = 
            `${frames[currentFrame].x}px ${frames[currentFrame].y}px`;
        currentFrame++;
        requestAnimationFrame(() => {
            setTimeout(animate, frameDuration);
        });
    };

    animate();
}

}
