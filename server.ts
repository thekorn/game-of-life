import { serve } from 'bun';
import { GameOfLifeState } from './game';

const runningGames: Map<number, GameOfLifeState> = new Map();

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
      console.log('Client connected, starting new game:', ws.data.gameId);
      const g = GameOfLifeState.createRandom(20, 20);
      runningGames.set(ws.data.gameId, g);

      while (runningGames.has(ws.data.gameId)) {
        const oldState = runningGames.get(ws.data.gameId)!;
        const newState = oldState.next();
        runningGames.set(ws.data.gameId, newState!);

        if (GameOfLifeState.compare(oldState, newState!)) {
          ws.send(`<div id="game-state" hx-swap-oob="true">GAME OVER</div>`);
          break;
        } else {
          ws.send(
            `<div id="game-state" hx-swap-oob="true">${newState.renderHTML()}</div>`,
          );
          await Bun.sleep(500);
        }
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
          gameId: getRandomInt(1000),
        },
      });
      if (!upgraded) {
        return new Response('Upgrade failed', { status: 400 });
      }
    }
    return new Response(Bun.file('./index.html'));
  },
});
