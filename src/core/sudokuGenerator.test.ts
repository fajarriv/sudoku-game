// Add these to your imports at the top
import { Board } from "./sudoku";
import {
  createEmptyBoard,
  getCellsToRemove,
  getRandomPosition,
  removeCells,
  generateGame,
  fillDiagonalBoxes,
} from "./sudokuGenerator";

import { expect, test, describe } from "vitest";
import * as E from "fp-ts/Either";

describe("Sudoku Game Generation Helpers", () => {
  test("createEmptyBoard should create 9x9 empty board", () => {
    const start = performance.now();
    const board = createEmptyBoard();
    const end = performance.now();

    expect(board).toHaveLength(9);
    board.forEach((row) => {
      expect(row).toHaveLength(9);
      row.forEach((cell) => expect(cell).toBe(0));
    });

    console.log(
      `createEmptyBoard function execution time: ${end - start} milliseconds`
    );
  });

  test("getCellsToRemove should return correct range for each difficulty", () => {
    const start = performance.now();

    // Try multiple times to ensure random values are within range
    for (let i = 0; i < 10; i++) {
      const easyCount = getCellsToRemove("easy");
      expect(easyCount).toBeGreaterThanOrEqual(33);
      expect(easyCount).toBeLessThanOrEqual(37);

      const mediumCount = getCellsToRemove("medium");
      expect(mediumCount).toBeGreaterThanOrEqual(41);
      expect(mediumCount).toBeLessThanOrEqual(45);

      const hardCount = getCellsToRemove("hard");
      expect(hardCount).toBeGreaterThanOrEqual(50);
      expect(hardCount).toBeLessThanOrEqual(55);
    }

    const end = performance.now();
    console.log(
      `getCellsToRemove function execution time: ${end - start} milliseconds`
    );
  });

  test("getRandomPosition should return valid board positions", () => {
    const start = performance.now();

    // try multiple times to ensure random values are within range
    for (let i = 0; i < 10; i++) {
      const [row, col] = getRandomPosition();

      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThanOrEqual(8);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThanOrEqual(8);
    }

    const end = performance.now();
    console.log(
      `getRandomPosition function execution time: ${end - start} milliseconds`
    );
  });

  test("removeCells should remove exact number of cells", () => {
    const start = performance.now();

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
    ];

    const cellsToRemove = 30;
    const modifiedBoard = removeCells(fullBoard, cellsToRemove);

    // Count empty cells
    const emptyCells = modifiedBoard.flat().filter((cell) => cell === 0).length;

    expect(emptyCells).toBe(cellsToRemove);

    const end = performance.now();
    console.log(
      `removeCells function execution time: ${end - start} milliseconds`
    );
  });
});

describe('Diagonal Box Filling', () => {
  test('fillDiagonalBoxes should fill diagonal 3x3 boxes', () => {
    const start = performance.now()
    
    const emptyBoard = createEmptyBoard()
    const boardWithDiagonals = fillDiagonalBoxes(emptyBoard)
    
    // Helper function to check if a 3x3 box is completely filled
    const isBoxFilled = (startRow: number, startCol: number): boolean => {
      const numbers = new Set()
      
      for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
          const value = boardWithDiagonals[startRow + i][startCol + j]
          if(value === 0) return false
          numbers.add(value)
        }
      }
      return numbers.size === 9
    }
    
    expect(isBoxFilled(0, 0)).toBe(true)  // Top-left box
    expect(isBoxFilled(3, 3)).toBe(true)  // Middle box
    expect(isBoxFilled(6, 6)).toBe(true)  // Bottom-right box
    
    // Check if non-diagonal boxes are empty (random pos check)
    expect(boardWithDiagonals[0][4]).toBe(0)  // Top-middle box
    expect(boardWithDiagonals[4][0]).toBe(0)  // Middle-left box
    expect(boardWithDiagonals[8][1]).toBe(0)  // Bottom-left box
    
    const end = performance.now()
    console.log(`fillDiagonalBoxes test execution time: ${end - start} milliseconds`)
  })

  test('fillDiagonalBoxes should create valid diagonal boxes', () => {
    const start = performance.now()
    
    const emptyBoard = createEmptyBoard()
    const boardWithDiagonals = fillDiagonalBoxes(emptyBoard)
    
    // Helper function to check if a box contains valid numbers (1-9 without duplicates)
    const isBoxValid = (startRow: number, startCol: number): boolean => {
      const numbers = new Set<number>()
      
      for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
          const value = boardWithDiagonals[startRow + i][startCol + j]
          if(value < 1 || value > 9) return false
          if(numbers.has(value)) return false
          numbers.add(value)
        }
      }
      
      return true
    }
    
    // Check if each diagonal box contains valid numbers
    expect(isBoxValid(0, 0)).toBe(true)  // Top-left box
    expect(isBoxValid(3, 3)).toBe(true)  // Middle box
    expect(isBoxValid(6, 6)).toBe(true)  // Bottom-right box
    
    const end = performance.now()
    console.log(`fillDiagonalBoxes validity test execution time: ${end - start} milliseconds`)
  })

})

describe("Sudoku Game Generation", () => {
  test('should generate valid easy game', () => {
    const result = generateGame('easy')

    expect(E.isRight(result)).toBe(true)

    if (E.isRight(result)) {
      const board = result.right

      // Check board dimensions
      expect(board).toHaveLength(9)
      board.forEach(row => expect(row).toHaveLength(9))

      // Count empty cells
      const emptyCells = board.flat().filter(cell => cell === 0).length
      expect(emptyCells).toBeGreaterThanOrEqual(33)
      expect(emptyCells).toBeLessThanOrEqual(37)

      // Verify all numbers are valid (0 or 1-9)
      board.flat().forEach(cell => {
        expect(cell).toBeGreaterThanOrEqual(0)
        expect(cell).toBeLessThanOrEqual(9)
      })
    }
  })

  test('should generate valid medium game', () => {
    const result = generateGame('medium')

    expect(E.isRight(result)).toBe(true)

    if (E.isRight(result)) {
      const board = result.right

      // Check board dimensions
      expect(board).toHaveLength(9)
      board.forEach(row => expect(row).toHaveLength(9))

      // Count empty cells
      const emptyCells = board.flat().filter(cell => cell === 0).length
      expect(emptyCells).toBeGreaterThanOrEqual(41)
      expect(emptyCells).toBeLessThanOrEqual(45)

      // Verify all numbers are valid (0 or 1-9)
      board.flat().forEach(cell => {
        expect(cell).toBeGreaterThanOrEqual(0)
        expect(cell).toBeLessThanOrEqual(9)
      })
    }
  })

  test('should generate valid hard game', () => {
    const result = generateGame('hard')

    expect(E.isRight(result)).toBe(true)

    if (E.isRight(result)) {
      const board = result.right

      // Check board dimensions
      expect(board).toHaveLength(9)
      board.forEach(row => expect(row).toHaveLength(9))

      // Count empty cells
      const emptyCells = board.flat().filter(cell => cell === 0).length
      expect(emptyCells).toBeGreaterThanOrEqual(50)
      expect(emptyCells).toBeLessThanOrEqual(55)

      // Verify all numbers are valid (0 or 1-9)
      board.flat().forEach(cell => {
        expect(cell).toBeGreaterThanOrEqual(0)
        expect(cell).toBeLessThanOrEqual(9)
      })
    }
  })

});
