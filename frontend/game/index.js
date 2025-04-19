import { LoginPage, GamePage} from '../app/config.js'
import { jsx } from '../src/framework.js'
import { render,updateRender } from '../src/vdom.js'
import { Router } from '../src/router.js';
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
    render(jsx('p',{id:'playercount'}),div)
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
            updatePlayerCount(data.playerCount);
            break;
        case 'startGame':
            startGame(data.nickname)
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

function updatePlayerCount(count) {
   document.getElementById('playercount').innerText = `Players: ${count}/4`;
}
function startGame(nickname){

    let count = 10
    
    const interval = setInterval(()=>{
        count--
        document.getElementById('playercount').innerText = `start Game in : ${count}s`;
        if (count == 0){
            GoToGame(nickname)
            clearInterval(interval)
        }
    },1000)
}

function GoToGame(nickname) {
    console.log('Going to game');
    
    const body = document.body;
    render(GamePage(),body)
    chat(nickname)
}

function chat(nickname) {
        const sendButton = document.querySelector('.send-button');        
        sendButton.addEventListener('click', function() {
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
