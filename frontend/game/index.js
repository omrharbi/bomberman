function connectToGameServer() {
    let socket = new WebSocket('ws://localhost:8080'); 

    socket.onopen = () => {
        console.log('Connected to WebSocket server');
        socket.send(JSON.stringify({
            type: "newPlayer",
        }));
    };

    socket.onmessage = (message) => {
        
        console.log(message.data);
    };
}

connectToGameServer()