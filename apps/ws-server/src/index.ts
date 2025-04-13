import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });

console.log("server started at port 3001");

wss.on('connection', function connection(ws) {
  
  ws.on('error', console.error);

  console.log(`web connection successful with ${ws}`);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });
});