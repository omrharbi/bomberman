import { LoginPage, GamePage} from '../app/config.js'
import { jsx } from '../src/framework.js'
import { render,updateRender } from '../src/vdom.js'
import { Router } from '../src/router.js';
const router = new Router({
    '/': () => [LoginPage()],
});
router.init()
function login() {
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
    const contDiv = document.getElementById('cont');
    const waitingGif = jsx('img', {
        src: '/img/output-waiting.gif',
        alt: 'Waiting...',
        style: ' margin-top: 10px;' // optional styling
    });
    render(waitingGif, contDiv);

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
        document.getElementById('cont').innerText = `start Game in : ${count}s`;
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

// function displayMsg(data) {
//     const messageContainer = document.querySelector('.message-container');

//     const newMessage = jsx('div', { className: 'message' },
//         jsx('div', { className: 'player-name' }, data.nickname),
//         jsx('div', { className: 'message-text' }, data.messageText)
//     );

//     render(newMessage, messageContainer);
//     messageContainer.scrollTop = messageContainer.scrollHeight;
// }
