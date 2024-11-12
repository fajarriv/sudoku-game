import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as R from 'fp-ts/Random'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export type Cell = number
export type Row = Cell[]
export type Board = Row[]

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

export const findInvalids = (board: Board, row: number, col: number, num: number): number[][] => {
  const collectIndexes = (array: Row, rowIndex: number, isRow: boolean) =>
    pipe(
      array,
      A.reduceWithIndex<number, number[][]>([], (colIndex, acc, cell) =>
        cell === num ? [...acc, isRow ? [rowIndex, colIndex] : [colIndex, rowIndex]] : acc
      )
    )

  const rowIndexes = collectIndexes(getRow(board, row), row, true)
  const colIndexes = collectIndexes(getColumn(board, col), col, false)

  const box = getBox(board, row, col)
  const boxIndexes = pipe(
    box,
    A.reduceWithIndex<number, number[][]>([], (index, acc, cell) => {
      if (cell === num) {
        const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
        const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE
        const rowOffset = Math.floor(index / BOX_SIZE)
        const colOffset = index % BOX_SIZE
        return [...acc, [boxRow + rowOffset, boxCol + colOffset]]
      }
      return acc
    })
  )

  const result = [...rowIndexes, ...colIndexes, ...boxIndexes]
  return result.length === 3 ? result.filter(([r, c]) => !(r === row && c === col)) : result
}

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
    A.reduce([...array], (acc, i) => {
      const j = R.randomInt(0, i)()
      const temp = acc[i]
      acc[i] = acc[j]
      acc[j] = temp
      return acc
    })
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