import { LoginPage, GamePage } from '../app/config.js'
import { jsx, createElement } from '../src/framework.js'
import { render, updateRender } from '../src/vdom.js'
import { MyEventSystem } from '../src/event.js'
import { Router } from '../src/router.js';
import TileMap from './tileMap.js';

const router = new Router({
    '/': () => [LoginPage()],
});
router.init()
function login() {
    const but = document.getElementById("NameBut");
    MyEventSystem.addEventListener(but, "click", () => {
        const name = document.getElementById("name").value.trim();
        connectToGameServer(name);
        waiting();
    });

}
login()

function waiting() {
    const div = document.getElementById('input');
    render(jsx('p', { id: 'playercount' }), div)
    const contDiv = document.getElementById('cont');
    const waitingGif = jsx('div', {}, jsx('img', {
        src: '/images/bomberman3d.gif',
        alt: 'Waiting...',
        style: ' margin-top: 10px;' 
    }), jsx('p', {}, ' Looking for a match...'));
    render(waitingGif, contDiv);

}

export let socket;
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
        // console.log(data);
        handleServerMessages(data);
    };

    socket.onclose = () => {
        console.log('Disconnected from WebSocket server');
    };
}
let tileMap ;
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
        case 'playerMove':
            updateOtherPlayerPosition(data);
            break;
        case 'placeBomb':
            Placingbombinmap(data,tileMap);
        default:
            break;
    }
}
function updateOtherPlayerPosition(data) {
    //if (data.PlayerId === this.MyId) return;
    let playerElement = document.getElementById(`player_${data.PlayerId}`);
    if (!playerElement) return;

    playerElement.style.backgroundPositionY = data.position.spriteY + 'px';
    playerElement.style.backgroundPositionX = data.position.spriteX + 'px';

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


// function DestroyWall(data) {
//     // this.map[data.position.y][data.position.x] = 0; 
//     const tileElement = this.canvas.querySelector(
//         `[data-row="${data.position.y}"][data-column="${data.position.x}"]`
//     );
//     if (tileElement) {
//         tileElement.innerHTML = "";
//     }
// }

function Placingbombinmap(data,tileMap) {
    console.log("tileMap", tileMap);
    
    tileMap.placeBomb(data.position.row, data.position.col, data.gift, data.index);
}