import { LoginPage ,GamePage,gameState } from '../app/config.js'
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
let gameContainer = null;

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
        case 'playersinfo':
            updatePlayersInfo(data.players)
            break
        case 'updateLives':
            updateLives(data.playerId, data.lives, data.nickname)
            break
        case 'playerDied':
            playerDied(data.playerId, data.nickname)
            break
        case 'playerMove':
            updateOtherPlayerPosition(data);
            break;
        case 'placeBomb':
            Placingbombinmap(data, tileMap);
            break;
            case 'playerDead':
            animationPlayerDead(data)
            break;
        default:
            break;
    }
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
function updatePlayersSection() {
    const playersSection = jsx('div', { className: 'footer-section players-section', id: 'players' },
      Array.from(gameState.players.entries()).map(([id, player]) => 
        jsx('div', { className: 'player-info', key: id },
          jsx('span', {}, player.nickname),
          jsx('span', { className: 'lives' }, `Lives: ${player.lives}`)
        )
      )
    );
    
    // Find the players section container
    const footerContent = document.querySelector('.footer-content');
    if (footerContent) {
      const playersContainer = footerContent.querySelector('.players-section');
      if (playersContainer) {
        updateRender(playersSection, playersContainer);
      }
    }
  }
/*** */
function startGame(data, tileMap) {
    let count = 3
    gameContainer = document.getElementById('game')
    const interval = setInterval(() => {
        count--
        document.getElementById('playercount').innerText = `start Game in : ${count}s`;
        if (count == 0) {
            GoToGame(data, tileMap)
            clearInterval(interval)
        }
    }, 100)
}

function GoToGame(data, tileMap) {
    const body = document.body;
    render(GamePage(), body)
    // const tileSize = 40;
    // const tileMap = new TileMap(tileSize, data);
    let game = document.getElementById("game")
    function gameLoop() {
        tileMap.drawGame(game, data)
    }
    requestAnimationFrame(gameLoop);
    const livesElement = document.getElementById('lives');
    livesElement.innerHTML = `Lives : ${data.lives}`;

    const playersElement = document.getElementById('players');

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
    const sendButton = document.querySelector('.send-button');
    MyEventSystem.addEventListener(sendButton, 'click', () => {
        sendMessage(nickname);
    });
}
function sendMessage(nickname) {
    const messageText = document.querySelector('.chat-input').value.trim();
    if (messageText !== '') {
        socket.send(JSON.stringify({
            type: "chatMsg",
            nickname: nickname,
            messageText: messageText
        }));
        document.querySelector('.chat-input').value = '';
    }
}


function displayMsg(data) {
    const messageContainer = document.querySelector('.message-container');

    const newMessage = jsx('div', { className: 'message' },
        jsx('div', { className: 'player-name' }, data.nickname),
        jsx('div', { className: 'message-text' }, data.messageText)
    )
    messageContainer.appendChild(createElement(newMessage))
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function updatePlayersInfo(players) {
    // const playersList = document.querySelector('.connected-players');
    // playersList.innerHTML = '';
}
function updateLives(playerId, lives, nickname) {
    const playerElement = document.getElementById(playerId);
    if (playerElement) {
        playerElement.querySelector('.lives').textContent = lives;
    }
    const playerNameElement = document.getElementById(nickname);
    if (playerNameElement) {
        playerNameElement.querySelector('.lives').textContent = lives;
    }
}
function playerDied(playerId, nickname) {
    const playerElement = document.getElementById(playerId);
    if (playerElement) {
        playerElement.classList.add('died');
    }
    const playerNameElement = document.getElementById(nickname);
    if (playerNameElement) {
        playerNameElement.classList.add('died');
    }
}


function Placingbombinmap(data, tileMap) {
    console.log("tileMap", tileMap);

    tileMap.placeBomb(data.position.row, data.position.col, data.gift, data.index);
}