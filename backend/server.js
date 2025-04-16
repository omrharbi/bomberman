const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  console.log('Server is running');
  
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    ws.send(`Server received: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
  });