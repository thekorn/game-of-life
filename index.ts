import { GameOfLifeState } from './game';

const c = new GameOfLifeState(3, 3, [
  [0, 1],
  [1, 2],
  [2, 2],
]);
console.log(c.render());
console.log(c.next().render());
