export default class TileMap {
  constructor(tileSize) {
    this.tileSize = tileSize;

    this.wall = this.#image("wall.png");
    this.grass = this.#image("grass.png");
    this.player = this.#image("player_r00.png");
  }
  #image(fileName) {
    const img = new Image();
    img.src = `../images/${fileName}`;
    return img;
  }
  map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 3, , 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];
  drawGame(canvas) {
    this.#setCanvasSize(canvas);
    this.#draw(canvas);
  }
  #draw(canvas) {
    const rows = this.map.length;
    const columns = this.map[0].length;
    const containerWidth = canvas.offsetWidth;
    const containerHeight = canvas.offsetHeight;
    canvas.innerHTML = "";

    const tile = Math.min(containerWidth / columns, containerHeight / rows);

    canvas.style.display = "grid";

    canvas.style.gridTemplateRows = `repeat(${rows}, ${this.tileSize}px)`;
    canvas.style.gridTemplateColumns = `repeat(${columns}, ${this.tileSize}px)`;
    canvas.style.alignContent = "center"; // Center vertically
    canvas.style.justifyContent = "center"; // Center horizontally
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const tile = this.map[row][column];
        const div = document.createElement("div");
        div.classList.add("tile");
        div.dataset.row = row;
        div.dataset.column = column; 
        div.style.width = `${this.tileSize}px`;
        div.style.height = `${this.tileSize}px`;
        switch (tile) {
          case 1:
            div.style.backgroundImage = `url(../images/wall.png)`;
            div.style.backgroundSize = "cover";
            break;
          case 0:
            div.style.backgroundImage = `url(../images/bg.png)`;
            div.style.backgroundSize = "cover";
            break;
          case 2:
            div.style.backgroundImage = `url(../images/tree.png)`;
            div.style.backgroundSize = "cover";
            break;
          case 3:
            div.style.backgroundImage = `url(../images/player_f00.png)`;
            div.style.backgroundSize = "cover";
            break;
          default:
            break;
        }

        // Add the tile to the container
        canvas.appendChild(div);
      }
    }
  }
  #setCanvasSize(canvas) {
    canvas.style.height = this.map.length * this.tileSize;
    canvas.style.width = this.map[0].length * this.tileSize;
  }
}
