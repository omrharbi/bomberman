import Player from "./player.js";

export default class Game {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.wall = this.#image("wallBlack.png");
    this.grass = this.#image("grass.png");

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
  }

  #image(fileName) {
    const img = new Image();
    img.src = `../images/${fileName}`;
    return img;
  }

  drawGame(canvas) {
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
            break;
          case 2:
            img.src = "../images/tree.png";
            break;
          case 3:
            img.src = "../images/wall.png";
            break;
          case 5:
            div.style.backgroundImage = `url(../images/playerStyle.png)`;
            div.id = "player";
            break;
          default:
            img.src = "";
        }

        div.appendChild(img);
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
        // console.log(`translate(${this.player.x}px, ${this.player.y}px)`);
        playerElement.style.transform = `translate(${this.player.x}px, ${this.player.y}px)`;
      }

      requestAnimationFrame(updatePlayerMovement);
    };

    updatePlayerMovement();
  }
}
