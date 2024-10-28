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
} from './sudoku'

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
    expect(range(1, 5)).toEqual([1, 2, 3, 4])
    expect(range(0, 3)).toEqual([0, 1, 2])
  })

  test('getRow function', () => {
    expect(getRow(testBoard, 0)).toEqual([5, 3, 0, 0, 7, 0, 0, 0, 0])
    expect(getRow(testBoard, 8)).toEqual([0, 0, 0, 0, 8, 0, 0, 7, 9])
  })

  test('getColumn function', () => {
    expect(getColumn(testBoard, 0)).toEqual([5, 6, 0, 8, 4, 7, 0, 0, 0])
    expect(getColumn(testBoard, 8)).toEqual([0, 0, 0, 3, 1, 6, 0, 5, 9])
  })

  test('getBox function', () => {
    console.log(getBox(testBoard, 0, 0))
    expect(getBox(testBoard, 0, 0)).toEqual([5, 3, 0, 6, 0, 0, 0, 9, 8])
    expect(getBox(testBoard, 0, 4)).toEqual([0,7,0,1,9,5,0,0,0])
  })

  test('isRowValid function', () => {
    expect(isRowValid(testBoard, 0, 1)).toBe(true)
    expect(isRowValid(testBoard, 0, 5)).toBe(false)
  })

  test('isColumnValid function', () => {
    expect(isColumnValid(testBoard, 0, 1)).toBe(true)
    expect(isColumnValid(testBoard, 0, 5)).toBe(false)
  })

  test('isBoxValid function', () => {
    expect(isBoxValid(testBoard, 0, 0, 1)).toBe(true)
    expect(isBoxValid(testBoard, 0, 0, 5)).toBe(false)
  })

  test('isValidPlacement function', () => {
    expect(isValidPlacement(testBoard, 0, 2, 1)).toBe(true)
    expect(isValidPlacement(testBoard, 0, 2, 3)).toBe(false)
  })

  test('findEmptyCell function', () => {
    const res = findEmptyCell(testBoard)
    expect(res._tag).toBe('Some')
    if (res._tag === 'Some') {

      console.log(res.value)
      expect(res.value).toEqual([0, 2])
    }

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
  })

})
