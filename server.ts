import { serve } from 'bun';

const runningGames = new Set()

type WebSocketData = {
  gameId: number;
};

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

serve<WebSocketData>({
  port: 8080,
  websocket: {
    open: async (ws) => {
      console.log('Client connected, starting new game:', ws.data.gameId)
      runningGames.add(ws.data.gameId);
      let index = 0

      while (runningGames.has(ws.data.gameId)) {
        index++
        
        ws.send(`<div id="game-state" hx-swap-oob="true">hallo ${index}</div>`);
        await Bun.sleep(2000);
      }
    },
    message: (ws, message) => {
      console.log('Client sent message', message);
    },
    close: (ws) => {
      console.log('Client disconnected, stopping game:', ws.data.gameId);
      runningGames.delete(ws.data.gameId);
    },
  },
  fetch(req, server) {
    const url = new URL(req.url);
    console.log('Request received', url.pathname);
    if (url.pathname === '/game-of-life') {
      const upgraded = server.upgrade(req, {
        data: {
          gameId: getRandomInt(1000)
        }
      });
      if (!upgraded) {
        return new Response('Upgrade failed', { status: 400 });
      }
    }
    return new Response(Bun.file("./index.html"));
    
  },
});
