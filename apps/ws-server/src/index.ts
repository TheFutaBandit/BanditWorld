import { WebSocketServer } from 'ws';
import { User } from './User';

const wss = new WebSocketServer({ port: 3001 });

console.log("server started at port 3001");

wss.on('connection', function connection(ws) {
  let user : User | undefined;

  user = new User(ws);
  
  ws.on('error', console.error);
  
  // console.log(`web connection successful with ${ws}`);

  ws.on('close', () => {
    user?.destroy()
  })
});