// state is keept in a flat array of boolean values
// extra rule: the grid is surrounded by a static border of dead cells

import assert from "node:assert";


class GameOfLifeState {
  private _state: boolean[] = [];

  constructor(private _width: number, private _height: number, liveCells: [number, number][] = []) {
    this._state = new Array(this._width * this._height);
    this._state.fill(false);
    if (liveCells.length > 0) {
      for (const [x, y] of liveCells) {
        this.setStateAt(x, y, true);
      }
    }
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
        if (neighborX < 0 || neighborX >= this._width || neighborY < 0 || neighborY >= this._height) {
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

const c = new GameOfLifeState(3, 3, [[0, 1], [1, 2], [2, 2]]);
console.log(c.render());
console.log(c.next().render());
