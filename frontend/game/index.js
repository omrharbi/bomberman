import { LoginPage, GamePage } from '../app/config.js'
import { jsx } from '../src/framework.js'
import { render, updateRender } from '../src/vdom.js'
import { Router } from '../src/router.js';
// import draw from './draw.js';
import TileMap from './tileMap.js';
const router = new Router({
    '/': () => [LoginPage()],
});
router.init()
function login() {
    // const body = document.body;
    // render(LoginPage(),body)

    const but = document.getElementById("NameBut");
    but.addEventListener("click", () => {
        const name = document.getElementById("name").value.trim();
        connectToGameServer(name);
        waiting();
    });
}
login()

function waiting() {
    const div = document.getElementById('input');
    render(jsx('p', { id: 'playercount' }), div)
    let cont = 1;
    const p = document.getElementById('cont');
    setInterval(() => {
        cont++;
        p.textContent = cont;
    }, 1000);
}

let socket;

function connectToGameServer(name) {
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
        console.log(data);
        handleServerMessages(data);
    };

    socket.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };
}
function handleServerMessages(data) {
    switch (data.type) {
        case 'updatePlayers':
            console.log('Received player count:', data.playerCount);
            updatePlayerCount(data.playerCount, data.playerId);
            break;
        case 'startGame':
            startGame(data.nickname, data.lives, data.players);
            break
        case 'chatMsg':
            displayMsg(data)
            break
        case 'waiting':
            document.getElementById('playercount').innerText = `Wait for the next game`;
        case 'playersinfo':
            updatePlayersInfo(data.players)
            break
        case 'updateLives':
            updateLives(data.playerId, data.lives, data.nickname)
            break
        case 'playerDied':
            playerDied(data.playerId, data.nickname)
            break
        default:
            break;
    }
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
function startGame(nickname, lives, players) {
    let count = 3

    const interval = setInterval(() => {
        count--
        document.getElementById('playercount').innerText = `start Game in : ${count}s`;
        if (count == 0) {
            GoToGame(nickname, lives, players)
            clearInterval(interval)
        }
    }, 100)
}

function GoToGame(nickname, lives, players) {
    console.log('Going to game');
    console.log("lives", lives);

    const body = document.body;
    render(GamePage(), body)
    ///////////////////
    const tileSize = 40;
    const tileMap = new TileMap(tileSize);
    let game = document.getElementById("game")

    const gameState = {
        player: {
            x: 1,
            y: 1,
            bombsPlaced: 0,
            bombPower: 1,
            positionX: 52,
            positionY: 0,
            width: 22,
            height: 40,
            lives: lives,
            speed: 7,
            isMoving: false,
            isDead: false,
            direction: 'down',
            style: "../images/playerStyle.png", // Just the URL string
        }
    };

    function drawPlayer() {
        const playerElement = document.getElementById('player');
        const player = gameState.player;

        playerElement.style.position = 'absolute';
        playerElement.style.width = player.width + 'px';
        playerElement.style.height = player.height + 'px';
        playerElement.style.backgroundImage = `url(${player.style})`;
        playerElement.style.backgroundPositionY = player.positionY + 'px';
        playerElement.style.backgroundPositionX = player.positionX + 'px';
        playerElement.style.transform = `translate(${player.x}px, ${player.y}px)`;
    }

    function setupPlayerControls() {
        let keysPressed = {};
        let movementStartTime = null;
        let lastUpdateTime = Date.now();

        const spriteMap = {
            up: [ { x: 55, y: 82 }, { x: 28, y: 82 }, { x: 55, y: 82 }, { x: 81, y: 82 } ],
            right: [ { x: 30, y: 41 }, { x: 55, y: 41 }, { x: 30, y: 41 }, { x: -5, y: 41 } ],
            down: [ { x: 52, y: 0 }, { x: 27, y: 0 }, { x: 52, y: 0 }, { x: 78, y: 0 } ],
            left: [ { x: -5, y: 124 }, { x: 30, y: 124 }, { x: -5, y: 124 }, { x: 82, y: 124 } ]
        };

        addEventListener('keydown', (e) => keysPressed[e.key] = true);
        addEventListener('keyup', (e) => keysPressed[e.key] = false);

        function updatePlayerMovement() {
            const now = Date.now();
            const deltaTime = (now - lastUpdateTime) / 100;
            lastUpdateTime = now;

            const player = gameState.player;
            player.isMoving = false;

            if (keysPressed['ArrowUp']) {
                player.y -= player.speed * deltaTime;
                player.direction = 'up';
                player.isMoving = true;
            }
            if (keysPressed['ArrowRight']) {
                player.x += player.speed * deltaTime;
                player.direction = 'right';
                player.isMoving = true;
            }
            if (keysPressed['ArrowDown']) {
                player.y += player.speed * deltaTime;
                player.direction = 'down';
                player.isMoving = true;
            }
            if (keysPressed['ArrowLeft']) {
                player.x -= player.speed * deltaTime;
                player.direction = 'left';
                player.isMoving = true;
            }

            if (player.isMoving) {
                if (!movementStartTime) movementStartTime = now;
                const elapsed = now - movementStartTime;
                const frameDuration = 200;

                const frames = spriteMap[player.direction];
                const frameIndex = Math.floor(elapsed / frameDuration) % frames.length;

                player.positionX = frames[frameIndex].x;
                player.positionY = frames[frameIndex].y;
            } else {
                if (movementStartTime) {
                    const frames = spriteMap[player.direction];
                    player.positionX = frames[0].x;
                    player.positionY = frames[0].y;
                    movementStartTime = null;
                }
            }

            drawPlayer();
            requestAnimationFrame(updatePlayerMovement);
        }

        updatePlayerMovement();
    }

    drawPlayer();
    setupPlayerControls();

    function gameLoop() {
        tileMap.drawGame(game)
    }
    // gameLoop()
    requestAnimationFrame(gameLoop);
    //////////////////
    const livesElement = document.getElementById('lives');
    livesElement.innerHTML = `Lives : ${lives}`;

    const playersElement = document.getElementById('players');

    const playerList = players.map((player, index) => {
        return jsx('li', { id: `${player.playerId}` }, `${player.nickname} - Lives: ${player.lives}`);
    });
    const showPlayersTitle = jsx('p', {}, 'Players:');

    const playerListContainer = jsx('ul', { className: 'connected-players' }, ...playerList);

    const wrapper = jsx('div', {}, showPlayersTitle, playerListContainer);
    render(wrapper, playersElement);

    chat(nickname)
}

function chat(nickname) {
    const sendButton = document.querySelector('.send-button');
    sendButton.addEventListener('click', function () {
        sendMessage(nickname);
    })
}
function sendMessage(nickname) {
    const messageText = document.querySelector('.chat-input').value.trim();

    if (messageText !== '') {
        socket.send(JSON.stringify({
            type: "chatMsg",
            nickname: nickname,
            messageText: messageText
        }));
        document.querySelector('.chat-input').value = ''; // Clear input after sending
    }
}

function displayMsg(data) {
    const messageContainer = document.querySelector('.message-container');
    const newMessage = document.createElement('div');
    newMessage.className = 'message';

    const playerName = document.createElement('div');
    playerName.className = 'player-name';
    playerName.textContent = data.nickname;

    const messageTextElement = document.createElement('div');
    messageTextElement.className = 'message-text';
    messageTextElement.textContent = data.messageText;

    newMessage.appendChild(playerName);
    newMessage.appendChild(messageTextElement);

    messageContainer.appendChild(newMessage);
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
// function displayMsg(data) {
//     const messageContainer = document.querySelector('.message-container');

//     const newMessage = jsx('div', { className: 'message' },
//         jsx('div', { className: 'player-name' }, data.nickname),
//         jsx('div', { className: 'message-text' }, data.messageText)
//     );

//     render(newMessage, messageContainer);
//     messageContainer.scrollTop = messageContainer.scrollHeight;
// }
