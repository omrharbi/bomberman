export default class TileMap {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
    this.wall = this.#image("wall.png");
    this.grass = this.#image("grass.png");
    this.player = this.#image("player_r00.png");
  }
  #image(fileName) {
    const img = new Image();
    img.src = `../images/${fileName}`;
    return img;
  }

  drawGame(canvas) {
    this.#setCanvasSize(canvas);
    this.#draw(canvas);
  }
  #draw(canvas) {
    canvas.innerHTML = "";
    const row = this.map.length;
    const column = this.map[row].length;

    canvas.style.gird = "grid";
    canvas.style.gridTemplateColumns = `repeat(${column} , ${this.tileSize})px `;
    canvas.style.gridTemplateRows = `repeat(${row} , ${this.tileSize})px `;

    for (let row = 0; row < this.map.length; row++) {
      for (let column = 0; column < this.map[row].length; column++) {
        const tile = this.map[row][column];
        const div = document.createElement("div");
        div.style.width = `${this.tileSize}px`;
        div.style.height = `${this.tileSize}px`;

        switch (tile) {
          case 1:
            div.style.backgroundImage = "url('wall.png')"; // Replace with your wall image path
            div.style.backgroundSize = 'cover';
            // image = this.wall;
            break;
        }
      }
    }
  }
  #setCanvasSize(canvas) {
    canvas.style.height = this.map.length * this.tileSize;
    canvas.style.width = this.map[0].length * this.tileSize;
  }
}
