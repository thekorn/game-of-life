import { expect, test } from "bun:test";

import { GameOfLifeState } from "./game";

test("init a simple state, all cells are dead", () => {
  const cells = new GameOfLifeState(3, 3);
  expect(cells.getStateAt(0, 0)).toBe(false);
  expect(GameOfLifeState.compareWithArray(cells, [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
  ])).toBe(true);
});

test("init state from array, all cells are dead", () => {
  const cells = new GameOfLifeState(3, 3);
  cells.setStateFromFlatArray([
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
  ])
  expect(GameOfLifeState.compareWithArray(cells, [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
  ])).toBe(true);
});

test("next generation", () => {
  const cells = new GameOfLifeState(3, 3);
  cells.setStateFromFlatArray([
    0, 0, 0,
    1, 0, 0,
    0, 1, 1,
  ])
  expect(GameOfLifeState.compareWithArray(cells.next(), [
    0, 0, 0,
    1, 1, 0,
    0, 1, 1,
  ])).toBe(true);
});

test("next generation", () => {
  const cells = new GameOfLifeState(3, 3);
  cells.setStateFromFlatArray([
    0, 1, 0,
    1, 1, 0,
    0, 0, 0,
  ])
  expect(GameOfLifeState.compareWithArray(cells.next(), [
    1, 1, 0,
    1, 1, 0,
    0, 0, 0,
  ])).toBe(true);
});