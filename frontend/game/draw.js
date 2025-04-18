import TileMap from "./tileMap.js";

// export default function draw(canvas ){
const tileSize = 32;
const tileMap = new TileMap(tileSize);
function gameLoop(){
    tileMap.drawGame()
}
setInterval(gameLoop   ,1000/60)
// }
