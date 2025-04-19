export default class Player {
    constructor(parameters) {
       
    }
    player = {
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
}
