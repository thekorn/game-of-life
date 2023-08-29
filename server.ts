import { serve } from 'bun';
import { GameOfLifeState } from './game';

class RunningGames {
  private _games: Map<number, GameOfLifeState> = new Map();

  constructor() {}

  has(gameId: number): boolean {
    return this._games.has(gameId);
  }

  start(gameId: number) {
    const g = GameOfLifeState.createRandom(20, 20);
    this._games.set(gameId, g);
    console.log('>>> game', gameId, 'started'); 
  }

  next(gameId: number): GameOfLifeState | null {
    const oldState = this._games.get(gameId)!;
    const newState = oldState.next();
    if (GameOfLifeState.compare(oldState, newState)) {
      this.stop(gameId)
      return null
    }
    this._games.set(gameId, newState!);
    return newState
  }

  stop(gameId: number) {
    this._games.delete(gameId);
    console.log('>>> game', gameId, 'stopped');
  }
}

const runningGames = new RunningGames();

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
      runningGames.start(ws.data.gameId);

      while (runningGames.has(ws.data.gameId)) {
        const newState = runningGames.next(ws.data.gameId);
        if (newState === null) {
          ws.send(`<div id="game-state" hx-swap-oob="true" class="m-2 max-w-min">GAME OVER</div>`);
          break;
        } else {
          ws.send(
            `<div id="game-state" hx-swap-oob="true" class="m-2 max-w-min">${newState.renderHTML()}</div>`,
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
      runningGames.stop(ws.data.gameId);
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
