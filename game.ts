// state is keept in a flat array of boolean values
// extra rule: the grid is surrounded by a static border of dead cells

import assert from 'node:assert';

export class GameOfLifeState {
  private _state: boolean[] = [];

  constructor(
    private _width: number,
    private _height: number,
    liveCells: [number, number][] = [],
  ) {
    this._state = new Array(this._width * this._height);
    this._state.fill(false);
    if (liveCells.length > 0) {
      for (const [x, y] of liveCells) {
        this.setStateAt(x, y, true);
      }
    }
  }

  static compare(a: GameOfLifeState, b: GameOfLifeState): boolean {
    if (a._width !== b._width || a._height !== b._height) {
      return false;
    }
    return a._state.every((v, i) => v === b._state[i]);
  }

  static compareWithArray(a: GameOfLifeState, b: (1 | 0)[]): boolean {
    if (a._width * a._height !== b.length) {
      return false;
    }
    return a._state.every((v, i) => v === Boolean(b[i]));
  }

  static createRandom(width: number, height: number): GameOfLifeState {
    const c = new GameOfLifeState(width, height);
    const newState = c._state.map(() => +(Math.random() > 0.6)) as (1 | 0)[];
    c.setStateFromFlatArray(newState);
    return c;
  }

  setStateFromFlatArray(newState: (1 | 0)[]) {
    assert(
      newState.length === this._width * this._height,
      'newState has wrong length',
    );
    this._state = newState.map((v) => Boolean(v));
  }

  setStateAt(x: number, y: number, state: boolean) {
    assert(x >= 0 && x < this._width, 'x is out of bounds');
    assert(y >= 0 && y < this._height, 'y is out of bounds');
    this._state[this._width * y + x] = state;
  }

  getStateAt(x: number, y: number): boolean {
    assert(x >= 0 && x < this._width, 'x is out of bounds');
    assert(y >= 0 && y < this._height, 'y is out of bounds');
    return this._state[this._width * y + x];
  }

  getStateOfNeighborsAt(x: number, y: number): boolean[] {
    assert(x >= 0 && x < this._width, 'x is out of bounds');
    assert(y >= 0 && y < this._height, 'y is out of bounds');
    const neighbors = [];
    for (let i = -1; i <= 1; i++) {
      const neighborY = y + i;
      for (let j = -1; j <= 1; j++) {
        const neighborX = x + j;
        if (
          neighborX < 0 ||
          neighborX >= this._width ||
          neighborY < 0 ||
          neighborY >= this._height
        ) {
          neighbors.push(false);
        } else {
          neighbors.push(this.getStateAt(neighborX, neighborY));
        }
      }
    }
    return neighbors;
  }

  render(): string {
    let output = '';
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        output += this.getStateAt(x, y) ? 'X' : '.';
      }
      output += '\n';
    }
    return output;
  }

  renderHTML(): string {
    let output = '<div class="border">';
    for (let y = 0; y < this._height; y++) {
      output += '  <div class="flex">';
      for (let x = 0; x < this._width; x++) {
        const c = this.getStateAt(x, y) ? 'bg-black' : 'bg-white';
        output += `    <div class="w-6 h-6 ${c}"></div>`;
      }
      output += '</div>\n';
    }
    return output + '</div>';
  }

  next(): GameOfLifeState {
    const nextState = new GameOfLifeState(this._width, this._height);
    for (let y = 0; y < this._height; y++) {
      for (let x = 0; x < this._width; x++) {
        const neighbors = this.getStateOfNeighborsAt(x, y);
        const liveNeighbors = neighbors.filter((n) => n).length;
        if (this.getStateAt(x, y)) {
          if (liveNeighbors < 2 || liveNeighbors > 3) {
            nextState.setStateAt(x, y, false);
          } else {
            nextState.setStateAt(x, y, true);
          }
        } else {
          if (liveNeighbors === 3) {
            nextState.setStateAt(x, y, true);
          } else {
            nextState.setStateAt(x, y, false);
          }
        }
      }
    }
    return nextState;
  }
}
