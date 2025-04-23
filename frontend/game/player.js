export default class Player {
    constructor(row, col, x, y) {
      this.x = x;
      this.y = y;
      this.row = row;
      this.col = col;
      this.bombsPlaced = 0;
      this.bombPower = 1;
      this.positionX = 52;
      this.positionY = 0;
      this.width = 21;
      this.height = 40;
      this.lives = 3;
      this.speed = 7;
      this.isMoving = false;
      this.isDead = false;
      this.direction = 'up';
      this.style = new Image();
      this.style.src = "assets/images/playerStyle.png";
    }
}