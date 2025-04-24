import { LoginPage ,GamePage,gameState , Ref} from '../app/config.js'
import { jsx, createElement } from '../src/framework.js'
import { render, updateRender } from '../src/vdom.js'
import { MyEventSystem } from '../src/event.js'
import { Router } from '../src/router.js';
import TileMap from './tileMap.js';
import { playersElement} from './tileMap.js'


const router = new Router({
    '/': () => [LoginPage()],
});

router.init();

let waitingContainer = null;


  export function waiting(element) {
    waitingContainer = element; 
    const waitingContent = jsx('div', {},
      jsx('p', { id: 'playercount' }, `Players: ${gameState.playerCount}/4`),
      jsx('div', { className: 'waiting-animation' },
        jsx('img', {
          src: '/images/bomberman3d.gif',
          alt: 'Waiting...',
          style: 'margin-top: 10px;'
        }),
        jsx('p', {}, 'Looking for a match...')
      )
    );

    render(waitingContent, element);
}

export let socket;
export function connectToGameServer(name) {
    socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
        console.log('Connected to WebSocket server');
        socket.send(JSON.stringify({
            type: "newPlayer",
            nickname: name
        }));
    };
    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        // console.log(data);
        handleServerMessages(data);
    };

    socket.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };
}
let tileMap;
function handleServerMessages(data) {
    const tileSize = 40;
    if (data.type == 'startGame') {
        tileMap = new TileMap(tileSize, data);
    }
    switch (data.type) {
        case 'updatePlayers':
            updatePlayerCount(data.playerCount, data.playerId);
            break;
        case 'startGame':
            startGame(data, tileMap);
            break
        case 'chatMsg':
            displayMsg(data)
            break
        case 'playerMove':
            updateOtherPlayerPosition(data);
            break;
        case 'drawBomb':
            drawBomb(data.position.row, data.position.col);
            break;
        case 'removeBomb':
            removeBomb(data.position.row, data.position.col);
            break;
        case 'destroyWall':
            destroyWall(data.position.row, data.position.col, data.gift, data.index, data.frames);
            break;
        case 'drawExplosion':
            drawExplosion(data.position.row, data.position.col, data.frames);
            break;
        case 'playerDead':
            animationPlayerDead(data)
            break;
        case 'hearts': 
            hearts(data)
            break;
        default:
            break;
    }
}

function hearts(data) {
    const hearts = Ref.hearts.current

    console.log("data.Id", data.Id);
    hearts.lastElementChild.remove()
    console.log("hearts", hearts);
    console.log("heartsData", data);
}

function animationPlayerDead(data) {
    let playerElement = playersElement.get(data.Id)
    playerElement.style.backgroundImage = `url('../images/player_dead.png')`;
    
    if (!playerElement) {
        console.log("player not found", data.Id);
        return;
    }


    const deathFrames = [
        { x: -17, y: 1 },   // Frame 1
        { x: -55, y: 1 },   // Frame 2
        { x: -91, y: 1 },   // Frame 3
        { x: -126, y: 1 },  // Frame 4
        { x: -162, y: 1 },  // Frame 5
        { x: -198, y: 1 },  // Frame 6
        { x: -235, y: 1 }   // Frame 7
      ];

      let currentFrame = 0;
      const frameDuration = 100;
      
      const animateDeath = () => {
        if (currentFrame >= deathFrames.length) {
            playerElement.remove()
          return;
        }

        playerElement.style.backgroundPositionX = `${deathFrames[currentFrame].x}px`;
        playerElement.style.backgroundPositionY = `${deathFrames[currentFrame].y}px`;
        currentFrame++;

        setTimeout(animateDeath, frameDuration);
      };

      animateDeath();
}

function updateOtherPlayerPosition(data) {
    let playerElement = playersElement.get(data.Id)
    if (!playerElement) {
        console.log("player not found", data.Id);
        return;
    }
    playerElement.style.backgroundPositionY = data.position.spriteY + 'px';
    playerElement.style.backgroundPositionX = data.position.spriteX + 'px';
    playerElement.style.transform = `translate(${data.position.x}px, ${data.position.y}px)`;
}



function updatePlayerCount(count, playerId) {
    gameState.playerCount = count;
    
    // For waiting screen
    if (waitingContainer) {
      const updatedWaitingContent = jsx('div', {},
        jsx('p', { id: 'playercount' }, `Players: ${count}/4`),
        jsx('div', { className: 'waiting-animation' },
          jsx('img', {
            src: '/images/bomberman3d.gif',
            alt: 'Waiting...',
            style: 'margin-top: 10px;'
          }),
          jsx('p', {}, 'Looking for a match...')
        )
      );
      
      updateRender(updatedWaitingContent, waitingContainer);
    }
    
    // else {
    //   if (count === 1) {
    //     alert('you win ');
    //     const winScreen = jsx('div', { className: 'win-screen' },
    //       jsx('h2', {}, 'You Win!'),
    //       jsx('button', { 
    //         className: 'play-again-btn',
    //         onclick: () => router.navigate('/')
    //       }, 'Play Again')
    //     );
    //     updateRender(winScreen, gameContainer);
    //   } else {
    //     // Update game state to remove player
    //     // This assumes your TileMap has a removePlayer method or similar
    //     // if (tileMap) {
    //     //   tileMap.removePlayer(playerId);
    //     // }
        
    //     // // Update the players section in UI
    //     // updatePlayersSection();
    //   }
    // }
  }
/**** */
// function updatePlayersSection() {
//     const playersSection = jsx('div', { className: 'footer-section players-section', id: 'players' },
//       Array.from(gameState.players.entries()).map(([id, player]) => 
//         jsx('div', { className: 'player-info', key: id },
//           jsx('span', {}, player.nickname),
//           jsx('span', { className: 'lives' }, `Lives: ${player.lives}`)
//         )
//       )
//     );
    
//     // Find the players section container
//     const footerContent = document.querySelector('.footer-content');
//     if (footerContent) {
//       const playersContainer = footerContent.querySelector('.players-section');
//       if (playersContainer) {
//         updateRender(playersSection, playersContainer);
//       }
//     }
//   }
/*** */
function startGame(data, tileMap) {
    let count = 3
    const interval = setInterval(() => {
        count--
        const updatedWaitingContent = jsx('div', {},
            jsx('p', { id: 'playercount' }, `start Game in : ${count}s`),
            jsx('div', { className: 'waiting-animation' },
              jsx('img', {
                src: '/images/bomberman3d.gif',
                alt: 'Waiting...',
                style: 'margin-top: 10px;'
              }),
              jsx('p', {}, 'Looking for a match...')
            )
          );
          
          updateRender(updatedWaitingContent, waitingContainer);
        if (count == 0) {
            GoToGame(data, tileMap)
            clearInterval(interval)
        }
    }, 1000)
}

function GoToGame(data, tileMap) {
    const body = document.body;
    render(GamePage(), body)    
    let game = Ref.gameCanvasRef.current
    function gameLoop() {
        tileMap.drawGame(game, data)
    }
    requestAnimationFrame(gameLoop);
    const livesElement = Ref.livesRef.current
    livesElement.innerHTML = `Lives : ${data.lives}`;

    const playersElement = Ref.playersRef.current

    const playerList = data.players.map((player, index) => {
        return jsx('li', { id: `${player.playerId}` }, `${player.nickname} - Lives: ${player.lives}`);
    });
    const showPlayersTitle = jsx('p', {}, 'Players:');

    const playerListContainer = jsx('ul', { className: 'connected-players' }, ...playerList);

    const wrapper = jsx('div', {}, showPlayersTitle, playerListContainer);
    render(wrapper, playersElement);
    chat(data.nickname)
}

function chat(nickname) {
    const sendButton = Ref.buttonRef.current    
    MyEventSystem.addEventListener(sendButton, 'click', () => {
        sendMessage(nickname);
    });
}
export function sendMessage(nickname) {
    const messageText = Ref.chatRef.current.value.trim();
    if (messageText !== '') {
        socket.send(JSON.stringify({
            type: "chatMsg",
            nickname: nickname,
            messageText: messageText
        }));
        Ref.chatRef.current.value = '';
    }
}

function displayMsg(data) {
    const messageContainer = Ref.messagesRef.current

    const newMessage = jsx('div', { className: 'message' },
        jsx('div', { className: 'player-name' }, data.nickname),
        jsx('div', { className: 'message-text' }, data.messageText)
    )
    messageContainer.appendChild(createElement(newMessage))
    messageContainer.scrollTop = messageContainer.scrollHeight;
}


////////////////////////////////////////////////////bombs

function drawBomb(row, col) {
    const canvas = Ref.gameCanvasRef.current
    const tileElement = Selectbyrowcol(canvas, row, col);
    if (tileElement && !hasclass(tileElement,"bomb")) {
        const bombDiv = jsx("div", {
            className: "bomb",
            style: "background-image: url('../images/bomb.png'); width: 38px; height: 38px; z-index: 5; left: 50%; top: 50%;"
        });
        const bombElement = createElement(bombDiv);
        tileElement.appendChild(bombElement);
    }
}


function removeBomb(row, col) {
    const canvas = Ref.gameCanvasRef.current
    const tileElement = Selectbyrowcol(canvas, row, col);
    const bombImg = hasclass(tileElement,"bomb");
    if (bombImg) {
        tileElement.innerHTML = ""; // Remove the bomb div
    }
}

function destroyWall(row, col, gift, index, frames) {
    const canvas = Ref.gameCanvasRef.current
    const tileElement = Selectbyrowcol(canvas, row, col);
    if (tileElement) {
        if (gift) {
            const power = [
                "../images/bombing.webp",
                "../images/speed.webp",
                "../images/spoil_tileset.webp",
            ];
            tileElement.innerHTML =
                '<img src="' +
                power[index] +
                '" style="width: 38px; height: 38px; position: absolute; top: 0; left: 0;">';
            gift = false;
        } else {
            tileElement.innerHTML = "";
            drawExplosion(row, col, frames);
        }
    }
}

function drawExplosion(row, col, frames) {
    const canvas = Ref.gameCanvasRef.current
    const tileElement = Selectbyrowcol(canvas, row, col);

    let currentFrame = 0;
    const frameDuration = 75;

    const explosionDiv = jsx("div", {
        className: "damage",
        style: 
          `background-position: ${frames[0].x}px ${frames[0].y}px;
          background-image: url('../images/explosion.png');
          width: 38px;
          height: 38px;
          z-index: 6;
          left: 50%;
          top: 50%;`
        
      });

      const explosionElement = createElement(explosionDiv);
      tileElement.appendChild(explosionElement);

    const animate = () => {
        if (currentFrame >= frames.length) {
            explosionElement.remove();
            return;
        }

        explosionElement.style.backgroundPosition = `${frames[currentFrame].x}px ${frames[currentFrame].y}px`;
        currentFrame++;

        setTimeout(animate, frameDuration);
    };

    animate();
}



// Helper function to check if a child has a .bomb div
function hasclass(tile, className) {
    for (let i = 0; i < tile.children.length; i++) {
        if (tile.children[i].classList.contains(className)) {
            return true;
        }
    }
    return false;
}
function Selectbyrowcol(canvas,row, col) {
    let tileElement = null;
    for (let i = 0; i < canvas.children.length; i++) {
        const child = canvas.children[i];

        // Make sure dataset exists and compare row/column
        if (
            child.dataset &&
            child.dataset.row === String(row) &&
            child.dataset.column === String(col)
        ) {
            tileElement = child;
            break;
        }
    }
    return tileElement;
}
////////////////////////////////////////////////////////