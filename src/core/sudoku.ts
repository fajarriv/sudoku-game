import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as R from 'fp-ts/Random'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export type Cell = number
export type Row = Cell[]
export type Board = Row[]

const GRID_SIZE = 9
const BOX_SIZE = 3
const EMPTY_CELL: Cell = 0
const numArray = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export const range = (start: number, end: number): number[] =>
  A.makeBy(end - start, (i) => i + start)

export const getRow = (board: Board, row: number): Row => board[row]

export const getColumn = (board: Board, col: number): Row =>
  board.map(row => row[col])

export const getBox = (grid: Board, row: number, col: number): Row => {
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE
  
  return pipe(
    A.range(0, BOX_SIZE - 1),
    A.chain(r => 
      pipe(
        A.range(0, BOX_SIZE - 1),
        A.map(c => grid[boxRow + r][boxCol + c])
      )
    )
  )
}

export const isRowValid = (board: Board, row: number, num: number): boolean =>
  !getRow(board, row).includes(num)

export const isColumnValid = (board: Board, col: number, num: number): boolean =>
  !getColumn(board, col).includes(num)

export const isBoxValid = (board: Board, row: number, col: number, num: number): boolean =>
  !getBox(board,row, col).includes(num)

export const isValidPlacement = (board: Board, row: number, col: number, num: number): boolean =>
  isRowValid(board, row, num) && isColumnValid(board, col, num) && isBoxValid(board, row, col ,num)

// mencari empty cell di board, akan mereturn posisi row dan col nya
export const findEmptyCell = (board: Board): O.Option<[number, number]> =>
  pipe(
    board,
    A.findIndex(row => row.includes(EMPTY_CELL)),
    O.chain(row =>
      pipe(
        board[row],
        A.findIndex(cell => cell === EMPTY_CELL),
        O.map(col => [row, col] as [number, number])
      )
    )
  )

export const shuffle = (array: number[]): number[] =>
  pipe(
    A.range(0, array.length - 1),
    A.foldLeft(
      () => array,
      () => {
        const result = [...array] 
        return pipe(
          A.range(0, result.length - 1),
          A.map(i => {
            const j = R.randomInt(0, i)();
            [result[i], result[j]] = [result[j], result[i]]
          }),
          () => result 
        )
      }
    )
  )


export const fillPuzzle = (startingBoard: Board): E.Either<Error, Board> => {
  let counter = 0; 

  const attemptFill = (board: Board): E.Either<Error, Board> =>
    pipe(
      findEmptyCell(board),
      O.match(
        () => E.right(board), 
        ([rowIndex, colIndex]) => { 
          const shuffledNums = shuffle(numArray);

          return pipe(
            shuffledNums,
            A.reduce(E.left(new Error("Unable to fill puzzle")) as E.Either<Error, Board>, (acc, num) => {
              if (counter > 20000000) {
                return E.left(new Error("Recursion Timeout"));
              }
              counter++;
              if (isValidPlacement(board, rowIndex, colIndex, num)) {
                const newBoard = board.map(row => [...row]); 
                newBoard[rowIndex][colIndex] = num;

                return pipe(
                  attemptFill(newBoard),
                  E.match(
                    () => acc, 
                    updatedBoard => E.right(updatedBoard) 
                  )
                );
              }
              else {
                return acc; 
              }
            })
          );
        }
      )
    );

  return attemptFill(startingBoard);
};