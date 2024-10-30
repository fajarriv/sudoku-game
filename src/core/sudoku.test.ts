import { expect, test, describe } from 'vitest'
import {
  range,
  getRow,
  getColumn,
  getBox,
  isRowValid,
  isColumnValid,
  isBoxValid,
  isValidPlacement,
  findEmptyCell,
  Board,
  shuffle,
  fillPuzzle,
} from './sudoku'
import * as E from 'fp-ts/Either'

const testBoard: Board = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

describe('Sudoku Solver', () => {
  test('range function', () => {
    const start = performance.now();
    expect(range(1, 5)).toEqual([1, 2, 3, 4])
    expect(range(0, 3)).toEqual([0, 1, 2])
    const end = performance.now();
    console.log(`range function execution time: ${end - start} milliseconds`);
  })

  test('getRow function', () => {
    const start = performance.now();
    expect(getRow(testBoard, 0)).toEqual([5, 3, 0, 0, 7, 0, 0, 0, 0])
    expect(getRow(testBoard, 8)).toEqual([0, 0, 0, 0, 8, 0, 0, 7, 9])    
    const end = performance.now();
    console.log(`getRow function execution time: ${end - start} milliseconds`);
  })

  test('getColumn function', () => {
    const start = performance.now();
    expect(getColumn(testBoard, 0)).toEqual([5, 6, 0, 8, 4, 7, 0, 0, 0])
    expect(getColumn(testBoard, 8)).toEqual([0, 0, 0, 3, 1, 6, 0, 5, 9])
    const end = performance.now();
    console.log(`getColumn function execution time: ${end - start} milliseconds`);
  })

  test('getBox function', () => {
    const start = performance.now();
    console.log(getBox(testBoard, 0, 0))
    expect(getBox(testBoard, 0, 0)).toEqual([5, 3, 0, 6, 0, 0, 0, 9, 8])
    expect(getBox(testBoard, 0, 4)).toEqual([0,7,0,1,9,5,0,0,0])
    const end = performance.now();
    console.log(`getBox function execution time: ${end - start} milliseconds`);
  })

  test('isRowValid function', () => {
    const start = performance.now();
    expect(isRowValid(testBoard, 0, 1)).toBe(true)
    expect(isRowValid(testBoard, 0, 5)).toBe(false)
    const end = performance.now();
    console.log(`isRowValid function execution time: ${end - start} milliseconds`);
  })

  test('isColumnValid function', () => {
    const start = performance.now();
    expect(isColumnValid(testBoard, 0, 1)).toBe(true)
    expect(isColumnValid(testBoard, 0, 5)).toBe(false)
    const end = performance.now();
    console.log(`isColumnValid function execution time: ${end - start} milliseconds`);
  })

  test('isBoxValid function', () => {
    const fullBoard: Board = [
      [0, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [9, 1, 2, 3, 4, 5, 6, 0, 8],
    ]
    const start = performance.now();
    expect(isBoxValid(fullBoard, 0, 0, 1)).toBe(true)
    expect(isBoxValid(fullBoard, 0, 0, 5)).toBe(false)
    const end = performance.now();
    console.log(`isBoxValid function execution time: ${end - start} milliseconds`);
  })

  test('isValidPlacement function', () => {
    const fullBoard: Board = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [9, 1, 2, 3, 4, 5, 6, 0, 8],
    ]
    const start = performance.now();
    expect(isValidPlacement(fullBoard, 8, 7, 7)).toBe(true)
    expect(isValidPlacement(fullBoard, 8, 7, 3)).toBe(false)
    const end = performance.now();
    console.log(`isValidPlacement function execution time: ${end - start} milliseconds`);
  })

  test('findEmptyCell function', () => {
    const start = performance.now();
    const res = findEmptyCell(testBoard)
    expect(res._tag).toBe('Some')
    if (res._tag === 'Some') {

      expect(res.value).toEqual([0, 2])
      const end = performance.now();
      console.log(`findEmptyCell SOME function execution time: ${end - start} milliseconds`);
    }

    const start2 = performance.now();
    const fullBoard: Board = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [9, 1, 2, 3, 4, 5, 6, 7, 8],
    ]
    expect(findEmptyCell(fullBoard)._tag).toEqual("None")
    const end2 = performance.now();
    console.log(`findEmptyCell NONE function execution time: ${end2 - start2} milliseconds`);
  })

  test('should shuffle the array', () => {
    const start = performance.now();
    const originalArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const shuffledArray = shuffle(originalArray);
    
    expect(shuffledArray.length).toBe(originalArray.length);
    expect(shuffledArray.sort()).toEqual(originalArray.sort());
    const end = performance.now();
    console.log(`shuffle function execution time: ${end - start} milliseconds`);
  });

  test('should fill the board completely', () => {
    const start = performance.now();
    const fullBoard: Board = [
      [1, 0, 3, 4, 5, 6, 7, 8, 0],
      [0, 0, 6, 7, 0, 9, 0, 2, 3],
      [7, 8, 9, 0, 2, 0, 4, 5, 6],
      [2, 3, 4, 0, 6, 7, 8, 9, 0],
      [0, 6, 0, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 0, 3, 4, 0, 6, 7],
      [3, 0, 5, 6, 7, 0, 0, 1, 2],
      [6, 0, 0, 9, 1, 2, 3, 0, 5],
      [9, 1, 0, 3, 0, 5, 0, 7, 8],
    ]
    const result = fillPuzzle(fullBoard);
    expect(E.isRight(result)).toBe(true);

    const end = performance.now();
    console.log(`fillPuzzle function execution time: ${end - start} milliseconds`);
    
    // Check that the returned board is filled with valid Sudoku numbers
    const filledBoard = result.right;
    expect(filledBoard).toHaveLength(9);
    filledBoard.forEach((row: number[]) => {
      expect(row).toHaveLength(9);
      row.forEach((num: number) => {
        expect(num).toBeGreaterThan(0);
        expect(num).toBeLessThan(10);
      });
    });
  });

})
