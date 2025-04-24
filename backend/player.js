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
        this.direction = 'up';
        // Add this to the constructor
        this.movementStartTime = null;

    }

    loseLife() {
        this.lives -= 1;
    }

    isAlive() {
        return this.lives > 0;
    }

    UpdatePlayerElement(data) {
        console.log("im inside update player element", data.initialX, data.initialY);

        this.playerElement = data.playerElement;
        // this.x = data.initialX;
        // this.y = data.initialY;

        console.log(this.x, this.y, this.nickname);

    }

    Updatemove(data, room, currentPlayer) {

        // console.log("im inside room",room);

        let movementStartTime = null;
        // let lastUpdateTime = Date.now();
        let lastSendTime = 0;
        const updateInterval = 50;
        const now = Date.now();
        // const deltaTime = (now - lastUpdateTime) / 100;
        const deltaTime = data.deltaTime

        const moveSpeed = this.speed * deltaTime;

        // console.log("moveSpeed", moveSpeed);


        switch (data.direction) {
            case 'up':
                this.y -= moveSpeed;
                this.direction = "up";
                this.isMoving = true;
                break;
            case 'down':
                this.y += moveSpeed;
                this.direction = "down";
                this.isMoving = true;
                break;
            case 'left':
                this.x -= moveSpeed;
                this.direction = "left";
                this.isMoving = true;
                break;
            case 'right':
                this.x += moveSpeed;
                this.direction = "right";
                this.isMoving = true;
                break;
            default:
                break;
        }
        // console.log("this.x", this.x);
        // console.log("this.y", this.y);
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



        // this.isMoving = false;
        const playerElement = this.playerElement//document.getElementById(`player_${this.MyId}`);
        // if (!playerElement) {
        //   console.log("Player element not found:", this.MyId);
        //   requestAnimationFrame(updatePlayerMovement);
        //   return; // Skip if player element doesn't exist yet
        // }



        // Store previous position for collision detection
        const prevX = this.x;
        const prevY = this.y;

        // FIX: Slow down movement speed slightly to make it more controllable
        // const moveSpeed = this.speed * deltaTime;




        if (this.isMoving) {
            // if (this.#checkCollision()) {
            //   player.x = prevX;
            //   player.y = prevY;
            // }
            const currentSprite = spriteMap[this.direction];
            // if (!currentSprite) {
            //   console.error("Invalid direction:", this.direction);
            //   requestAnimationFrame(updatePlayerMovement);
            //   return;
            // }

            if (!this.movementStartTime) this.movementStartTime = Date.now();
            const elapsed = Date.now() - this.movementStartTime;
            const frameDuration = 200;
            const frameIndex = Math.floor(elapsed / frameDuration) % currentSprite.length;
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
            }

            room.broadcast(Data);
            this.isMoving = false
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

        // FIX: Debug the player element and position
        // console.log("Player position:", this.player.x, this.player.y);
        // console.log("Player element:", playerElement ? "found" : "not found");

        // if (playerElement) {
        //   // FIX: Set explicit positioning and apply transformation for movement
        //   playerElement.style.width = this.player.width;
        //   playerElement.style.height = this.player.height;
        //   playerElement.style.backgroundImage = `url(${this.player.style || '../images/playerStyle.png'})`;
        //   playerElement.style.backgroundPositionX = this.player.positionX + "px";
        //   playerElement.style.backgroundPositionY = this.player.positionY + "px";
        //   playerElement.style.transform = `translate(${this.player.x}px, ${this.player.y}px)`;
        //   playerElement.style.position = "absolute";
        //   playerElement.style.zIndex = "10";
        // }
    };
}
