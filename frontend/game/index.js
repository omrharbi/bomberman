import { LoginPage, GamePage } from '../app/config.js'
import { jsx, createElement } from '../src/framework.js'
import { render, updateRender } from '../src/vdom.js'
import { MyEventSystem } from '../src/event.js'
import { Router } from '../src/router.js';
import TileMap from './tileMap.js';



const router = new Router({
    '/': () => [LoginPage()],
});

router.init();



export function waiting(element) {
    const waitingContent = jsx('div', {},
        jsx('p', { id: 'playercount' }),
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
        // case 'placeBomb':
        //     Placingbombinmap(data, tileMap);
        //     break;
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
        default:
            break;
    }
}
function updateOtherPlayerPosition(data) {

    let playerElement = document.getElementById(`player_${data.Id}`);
    // console.log("playerElement",playerElement);

    if (!playerElement) {
        console.log("player not found", data.Id);
        return;
    }

    playerElement.style.backgroundPositionY = data.position.spriteY + 'px';
    playerElement.style.backgroundPositionX = data.position.spriteX + 'px';
    // console.log("data.position.x", data.position.x);
    // console.log("data.position.y", data.position.y);


    playerElement.style.transform = `translate(${data.position.x}px, ${data.position.y}px)`;
}


function updatePlayerCount(count, playerId) {
    if (document.getElementById('playercount')) {
        document.getElementById('playercount').innerText = `Players: ${count}/4`;
    } else {
        if (count == 1) {
            alert("you win")
        } else {
            console.log(`removing player have id : ${playerId}`);
            document.getElementById(`${playerId}`).remove()
        }
    }
}
function startGame(data, tileMap) {
    let count = 3

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


// function Placingbombinmap(data, tileMap) {
//     console.log("tileMap", tileMap);

//     tileMap.placeBomb(data.position.row, data.position.col, data.gift, data.index);
// }

////////////////////////////////////////////////////bombs

function drawBomb(row, col) {
    const canvas = document.getElementById("game")
    const tileElement = canvas.querySelector(
        `[data-row="${row}"][data-column="${col}"]`
    );
    if (tileElement && !tileElement.querySelector(".bomb")) {
        const bombDiv = document.createElement("div");
        bombDiv.classList.add("bomb");

        // Use background image for sprite sheet
        bombDiv.style.backgroundImage = "url('../images/bomb.png')";
        bombDiv.style.width = "38px";
        bombDiv.style.height = "38px";
        // bombDiv.style.position = "absolute";
        bombDiv.style.zIndex = "5";

        // Center the bomb in the tile
        bombDiv.style.left = "50%";
        bombDiv.style.top = "50%";
        // bombDiv.style.transform = "translate(-50%, -50%)";

        tileElement.appendChild(bombDiv);
    }
}

function removeBomb(row, col) {
    console.log("Removing bomb at:", row, col);
    const canvas = document.getElementById("game")
    const tileElement = canvas.querySelector(
        `[data-row="${row}"][data-column="${col}"]`
    );
    const bombImg = tileElement?.querySelector(".bomb");

    if (bombImg) {
        bombImg.remove();
    }
}

function destroyWall(row, col, gift, index, frames) {
    const canvas = document.getElementById("game")
    const tileElement = canvas.querySelector(
        `[data-row="${row}"][data-column="${col}"]`
    );
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
    const canvas = document.getElementById("game")
    const tileElement = canvas.querySelector(
        `[data-row="${row}"][data-column="${col}"]`
    );
    // if (!tileElement) {
    //   console.error(
    //     "Cannot draw explosion - tile element not found at:",
    //     row,
    //     col
    //   );
    //   return;
    // }

    let currentFrame = 0;
    const frameDuration = 75;

    const explosionDiv = document.createElement("div");
    explosionDiv.className = "damage";
    explosionDiv.style.backgroundPosition = `${frames[0].x}px ${frames[0].y}px`;
    explosionDiv.style.backgroundImage = "url('../images/explosion.png')";
    // explosionDiv.style.position = "absolute";
    explosionDiv.style.width = "38px";
    explosionDiv.style.height = "38px";
    explosionDiv.style.zIndex = "6";

    // Center the explosion in the tile
    explosionDiv.style.left = "50%";
    explosionDiv.style.top = "50%";
    // explosionDiv.style.transform = "translate(-50%, -50%)";

    tileElement.appendChild(explosionDiv);

    const animate = () => {
        if (currentFrame >= frames.length) {
            explosionDiv.remove();
            return;
        }

        explosionDiv.style.backgroundPosition = `${frames[currentFrame].x}px ${frames[currentFrame].y}px`;
        currentFrame++;

        setTimeout(animate, frameDuration);
    };

    animate();
}