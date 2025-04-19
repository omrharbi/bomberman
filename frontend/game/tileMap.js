export default class TileMap {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.wall = this.#image("wall.png");
    this.grass = this.#image("grass.png");
    this.player = this.#image("player_r00.png");
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
    
  const mapData = [2, 3, 0, 3, 0, 3];
  for (let row = 0; row < this.map.length; row++) {
    for (let col = 0; col < this.map[row].length; col++) {
      const positionPlayrs = [
        [1, 1], //p1
        [1, 2],
        [2, 1],
        [1, 13],// p2
        [1, 12],
        [2, 13],
        [9, 1], // p3
        [8, 1],
        [9, 2],
        [9, 13], //p4
        [8, 13],
        [9, 12]
      ];

      if (positionPlayrs.some(([r, c]) => r === row && c === col)) {
        this.map[row][col] = 3
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
          default:
            img.src = ""; // Empty space
            }
            
            div.appendChild(img) 
        canvas.appendChild(div);
      }
    }
  }
  #setCanvasSize(canvas) {
    canvas.style.height = this.map.length * this.tileSize;
    canvas.style.width = this.map[0].length * this.tileSize;
  }
}
