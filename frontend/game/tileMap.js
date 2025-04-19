import Player from "./player.js";

export default class  {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.wall = this.#image("wallBlack.png");
    this.grass = this.#image("grass.png");
    this.player = this.#image("player_r00.png");
    this.player = new Player();
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
    this.player = {
      x: 1,
      y: 1,
      bombsPlaced: 0,
      bombPower: 1,
      positionX: 52,
      positionY: 0,
      width: 22,
      height: 40,
      lives: 3,
      speed: 7,
      isMoving: false,
      isDead: false,
      direction: 'up',
      style: new Image().src = "assets/images/playerStyle.png"
  }
  const mapData = [2, 3, 0, 3, 0, 3];
  for (let row = 0; row < this.map.length; row++) {
    for (let col = 0; col < this.map[row].length; col++) {
      const positionPlayrs = [
        [1, 1], //p1
        // [1, 2],
        // [2, 1],
        // [1, 13],// p2
        // [1, 12],
        // [2, 13],
        // [9, 1], // p3
        // [8, 1],
        // [9, 2],
        // [9, 13], //p4
        // [8, 13],
        // [9, 12]
      ];

      if (positionPlayrs.some(([r, c]) => r === row && c === col)) {
        // const tile = this.map[row][column];
        this.map[row][col] = 5
      } 
      // else if (this.map[row][col] === 0) {                       
      //   let random = Math.round(Math.random()  * mapData.length);
      //   this.map[row][col] = mapData[random]                     
      // }                                                           
    }
  }
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
    const containerWidth = canvas.offsetWidth;
    const containerHeight = canvas.offsetHeight;
    const tile = Math.min(containerWidth / columns, containerHeight / rows);
  
    canvas.innerHTML = "";
    canvas.style.display = "grid";

    canvas.style.gridTemplateRows = `repeat(${rows}, ${this.tileSize}px)`;
    canvas.style.gridTemplateColumns = `repeat(${columns}, ${this.tileSize}px)`;
    canvas.style.alignContent = "center"; // Center vertically
    canvas.style.justifyContent = "center"; // Center horizontally

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
            img.src=`../images/wallBlack.png` //wall.png
             break;
          case 4:
             img.src=`../images/wallBlack.png`
             break;
          case 2:
            img.src=`../images/tree.png`
             break;
          case 3:
            img.src=`../images/wall.png`
            break;
          case 5:
              // img.src=`../images/playerStyle.png`
              div.style.backgroundImage=`url(../images/playerStyle.png)`
              div.style.backgroundSize="cover"
              div.id="player"
              break;
          default:
            img.src = ""; // Empty space
            }
             div.appendChild(img) 
        canvas.appendChild(div);
      }
    }
    
    //
    
  }

  #setCanvasSize(canvas) {
    canvas.style.height = this.map.length * this.tileSize;
    canvas.style.width = this.map[0].length * this.tileSize;
  }

 #setupPlayerControls() {
    let keysPressed = {};
    let movementStartTime = null;
    let lastUpdateTime = Date.now();

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
            { x: 30, y: 41 }, // pic 1
            { x: -5, y: 41 },  // pic 2
            
        ],
        down: [
            { x: 52, y: 0 },
            { x: 27, y: 0 },
            { x: 52, y: 0 },
            { x: 78, y: 0 }

        ],
        left: [
            { x: -5, y: 124 },
            { x: 30, y: 124 },
            { x: -5, y: 124 },
            { x: 82, y: 124 },

        ]
    };

    addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
    });

    addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
    });

    const updatePlayerMovement =()=> {
        const now = Date.now();
        const deltaTime = (now - lastUpdateTime) / 100; // Convert to seconds
        lastUpdateTime = now;

        this.player.isMoving = false;

        if (keysPressed['ArrowUp']) {
            this.player.y -= this.player.speed * deltaTime;
            this.player.direction = 'up';
            this.player.isMoving = true;
            console.log(this.player.isMoving,"here");
            
        }
        if (keysPressed['ArrowRight']) {
            this.player.x += this.player.speed * deltaTime;
            this.player.direction = 'right';
            this.player.isMoving = true;
        }
        if (keysPressed['ArrowDown']) {
            this.player.y += this.player.speed * deltaTime;
            this.player.direction = 'down';
            this.player.isMoving = true;
        }
        if (keysPressed['ArrowLeft']) {
            this.player.x -= this.player.speed * deltaTime;
            this.player.direction = 'left';
            this.player.isMoving = true;
        }

        if (this.player.isMoving) {
            if (!movementStartTime) movementStartTime = now;
            const elapsed = now - movementStartTime;
            const frameDuration = 200; // Time between animation frames (ms)
            
            const frames = spriteMap[this.player.direction];
            const frameIndex = Math.floor(elapsed / frameDuration) % frames.length;
            
            this.player.positionX = frames[frameIndex].x;
            this.player.positionY = frames[frameIndex].y;
        } else {
            if (movementStartTime) {
                const frames = spriteMap[this.player.direction];
                this.player.positionX = frames[0].x;
                this.player.positionY = frames[0].y;
                movementStartTime = null;
            }
        }

        const playerElement = document.getElementById('player');
        console.log(playerElement.style.transform = `translate(${this.player.x}px, ${this.player.y}px)`);
        
        playerElement.style.transform = `translate(${this.player.x}px, ${this.player.y}px)`;
        requestAnimationFrame(updatePlayerMovement);
    }

    updatePlayerMovement();
}

}
