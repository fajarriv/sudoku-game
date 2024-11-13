import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as R from 'fp-ts/Random'
import { pipe } from 'fp-ts/function'
import { Board, isValidPlacement, shuffle } from './sudoku'
export type Difficulty = 'easy' | 'medium' | 'hard'

const EMPTY_CELL: number = 0

export const createEmptyBoard = (): Board => 
  Array(9).fill(null).map(() => Array(9).fill(EMPTY_CELL))

// Helper function to get random number of cells to remove based on difficulty
export const getCellsToRemove = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case 'easy':
      return R.randomInt(33, 37)()
    case 'medium':
      return R.randomInt(41, 45)()
    case 'hard':
      return R.randomInt(50, 55)()
  }
}

// Helper function to get random positior
export const getRandomPosition = (): [number, number] => {
  const row = R.randomInt(0, 8)()
  const col = R.randomInt(0, 8)()
  return [row, col]
}


export const removeCells = (
  board: Board, 
  remainingCells: number
): Board => {
  if (remainingCells <= 0) return board
  
  const [row, col] = getRandomPosition()
  
  // If cell is already empty, try again with same remaining count
  if (board[row][col] === EMPTY_CELL) {
    return removeCells(board, remainingCells)
  }
  
  // Create new board with cell removed
  const newBoard = board.map((r, i) => 
    i === row 
      ? r.map((c, j) => j === col ? EMPTY_CELL : c)
      : [...r]
  )
  
  return removeCells(newBoard, remainingCells - 1)
}

// Fill the diagonal 3x3 boxes first (these can be filled independently)
// gives us a valid partial solution immediately
export const fillDiagonalBoxes = (board: Board): Board => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const diagonalStartPositions = [0, 3, 6]
  
  // Create array of positions for a 3x3 box
  const createBoxPositions = (startPos: number): Array<[number, number]> =>
    pipe(
      A.range(0, 2),
      A.chain(row => 
        pipe(
          A.range(0, 2),
          A.map(col => [startPos + row, startPos + col] as [number, number])
        )
      )
    )

  // Fill the 3x3 box
  const fillBox = (board: Board, startPos: number): Board => {
    const shuffledNums = shuffle(numbers)
    
    return pipe(
      createBoxPositions(startPos),
      A.reduceWithIndex(board, (idx, acc, [row, col]) => 
        acc.map((r, i) => 
          i === row
            ? r.map((c, j) => 
                j === col ? shuffledNums[idx] : c
              )
            : r
        )
      )
    )
  }
  
  // Fill all diagonal boxes
  return pipe(
    diagonalStartPositions,
    A.reduce(board, (acc, startPos) => fillBox(acc, startPos))
  )
}

// Try to fill remaining cells
export const fillRemaining = (board: Board, row: number = 0, col: number = 0): E.Either<Error, Board> => {
  if (col === 9) {
    return fillRemaining(board, row + 1, 0);
  }

  if (row === 9) {
    return E.right(board);
  }

  if (board[row][col] !== EMPTY_CELL) {
    return fillRemaining(board, row, col + 1);
  }

  const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const tryNumber = (num: number): E.Either<Error, Board> => {
    if (isValidPlacement(board, row, col, num)) {
      const newBoard = board.map((r, i) =>
        r.map((c, j) => (i === row && j === col ? num : c))
      );
      return fillRemaining(newBoard, row, col + 1);
    }
    return E.left(new Error("Cannot fill board"));
  };

  return pipe(
    numbers,
    A.reduce(E.left(new Error("Cannot fill board")), (acc, num) =>
      pipe(
        acc,
        E.orElse(() => tryNumber(num))
      )
    )
  );
};

export const generateGame = (difficulty: Difficulty): E.Either<Error, Board> => {
  // Start with empty board
  const emptyBoard = createEmptyBoard()
  
  // Fill diagonal boxes first
  const boardWithDiagonals = fillDiagonalBoxes(emptyBoard)
  console.log(fillRemaining(boardWithDiagonals))
  
  // Fill remaining cells
  return pipe(
    // fillDiagonalBoxes(emptyBoard),
    fillRemaining(boardWithDiagonals),
    E.map(solvedBoard => {
      const cellsToRemove = getCellsToRemove(difficulty)
      return removeCells(solvedBoard, cellsToRemove)
    })
  )
}