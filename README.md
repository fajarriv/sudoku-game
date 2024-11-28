# Sudoku Game

This project implements a fully functional **Sudoku game** with an emphasis on **functional programming principles**. Built with modern web technologies, the game offers a clean, interactive user interface and robust features to enhance the player experience.

---

## Table of Contents
- [Game Features](#key-features)
- [Gameplay](#gameplay)
- [Technology Stack](#technology-stack)
- [Functional Programming Aspects](#functional-programming-aspects)
- [Code Structure](#code-structure)
- [Installation](#installation)
- [Credits](#credits)

---

## Key Features

- **Dynamic Sudoku Puzzle Generation**: Generates puzzles with random difficulties (Easy, Medium, Hard).
- **Solver**: Automatically solves Sudoku puzzles.
- **Keyboard Input Support**: Players can input numbers via keyboard for a seamless experience.
- **Highlighting Invalid Entries**: Invalid cells are visually highlighted in red.
- **Editable & Non-Editable Cells**: Differentiates between fixed puzzle numbers and editable user cells.
- **Async Storage**: Saves user progress for up to 15 minutes, allowing resumption after refresh.
- **Timer**: Tracks the total time spent solving the puzzle.
- **Reset & Restart**: Options to reset the current puzzle or start a new one.

---

## Gameplay

<img width="927" alt="image" src="https://github.com/user-attachments/assets/022baba8-4fd7-4ec1-8438-2e31931b9d13">
<img width="927" alt="image" src="https://github.com/user-attachments/assets/51e089c3-15ab-46df-86e0-a192c49450c0">

---

## Technology Stack

- **React**: Core framework for building the user interface.
- **Vite**: Lightning-fast development build tool.
- **TypeScript**: For type safety and better developer experience.
- **fp-ts**: Functional programming utilities to enforce immutability and purity.
- **Lucide-React**: Icons and additional UI enhancements.
- **AsyncStorage**: For persisting user progress.

---

## Functional Programming Aspects
### 1. Immutability
In functional programming, data structures are not mutated; instead, new versions are created when changes are made.d.

- **Example in `gameReducer.ts`:**

```typescript
  const newBoard = state.currentBoard.map((r, i) =>
    i === row
      ? r.map((c, j) => (j === col ? action.payload.num : c))
      : [...r]
  );
```

What happens?
Instead of mutating currentBoard, a new board is created with the updated cell value. The map function ensures that only the relevant row/column is changed, and all other rows/columns remain untouched.

- **Example in `removeCells`:**

```typescript
  const newBoard = board.map((r, i) => 
    i === row 
      ? r.map((c, j) => (j === col ? EMPTY_CELL : c))
      : [...r]
  );
```

What happens?
A new board is created by replacing the target cell with an empty value while leaving the rest of the board unchanged.

### 2. Pure Functions
Pure functions depend only on their inputs and do not have side effects (e.g., modifying global state).

- **Example in `isValidPlacement`:**

```typescript
  export const isValidPlacement = (board: Board, row: number, col: number, num: number): boolean =>
    isRowValid(board, row, num) &&
    isColumnValid(board, col, num) &&
    isBoxValid(board, row, col, num);
```

Why is this pure?
It takes the board, row, col, and num as inputs and computes a boolean value based only on those inputs. It doesn’t rely on external data or change any global state.

- **Example in `fillDiagonalBoxes`:**

```typescript
  const fillBox = (board: Board, startPos: number): Board => {
    const shuffledNums = shuffle(numbers);
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
    );
  };
```

Why is this pure?
It computes a new version of the board with filled diagonal boxes and doesn’t change the original board or depend on external variables.

### 3. Declarative Programming
Functional programming focuses on what to do rather than how to do it. This is achieved through higher-order functions like map, reduce, and filter.

- **Example in `findEmptyCell`:**

```typescript
  export const findEmptyCell = (board: Board): O.Option<[number, number]> =>
    pipe(
      board,
      A.findIndex((row) => row.includes(EMPTY_CELL)),
      O.chain((row) =>
        pipe(
          board[row],
          A.findIndex((cell) => cell === EMPTY_CELL),
          O.map((col) => [row, col] as [number, number])
        )
      )
    );
```

What happens?
Instead of using nested loops, the pipe and fp-ts/Array combinators declaratively describe the sequence of transformations to locate the first empty cell in the board.

### 4. Composition
Functions are composed to create more complex behaviors while maintaining modularity and reusability.

- **Example in `findInvalids`:**
  
```typescript
  export const findInvalids = (board: Board): number[][] =>
    pipe(
      board,
      A.reduceWithIndex<Row, number[][]>([], (rowIdx, accRows, row) =>
        pipe(
          row,
          A.reduceWithIndex<Cell, number[][]>(accRows, (colIdx, accInner, cell) => {
            const originalValue = board[rowIdx][colIdx];
            board[rowIdx][colIdx] = 0;
            const invalid = cell !== 0 && !isValidPlacement(board, rowIdx, colIdx, cell);
            board[rowIdx][colIdx] = originalValue;
            return invalid ? [...accInner, [rowIdx, colIdx]] : accInner;
          })
        )
      )
    );
```
What happens?
Functions like reduceWithIndex and pipe are composed to process each cell in the board, check its validity, and build a list of invalid cell positions.

### 5. Higher-Order Functions
Higher-order functions take other functions as arguments or return functions. They are frequently used in functional programming to operate on collections.

- **Example in `fillBox`:**
```typescript
  const fillBox = (board: Board, startPos: number): Board => {
    const shuffledNums = shuffle(numbers);
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
    );
  };
```

What happens?
The reduceWithIndex function processes each cell in the box by applying a transformation (filling it with a shuffled number).

### 6. Monads (Option and Either)
Monads like Option and Either encapsulate computations that might fail, making error handling explicit and composable.

- **Example in `findEmptyCell`:**

```typescript
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
    );
```

Why use Option?
The findEmptyCell function uses O.Option to handle the case where no empty cell exists gracefully without relying on null or throwing errors.

- **Example in `fillRemaining`:**

```typescript
  export const fillRemaining = (
    board: Board,
    row: number = 0,
    col: number = 0
  ): E.Either<Error, Board> => {
    if (row === 9) {
      return E.right(board);
    }
    if (board[row][col] !== EMPTY_CELL) {
      return fillRemaining(board, row, col + 1);
    }
    return pipe(
      shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]),
      A.reduce(E.left(new Error("Cannot fill board")), (acc, num) =>
        pipe(
          acc,
          E.orElse(() => {
            if (isValidPlacement(board, row, col, num)) {
              const newBoard = board.map((r, i) =>
                r.map((c, j) => (i === row && j === col ? num : c))
              );
              return fillRemaining(newBoard, row, col + 1);
            }
            return acc;
          })
        )
      )
    );
  };
```

Why use Either?
This ensures that errors (like being unable to fill the board) are captured in the return type, rather than throwing an exception.

---

## Code Structure

```php
  ├── README.md
  ├── eslint.config.js
  ├── index.html
  ├── node_modules
  ├── package.json
  ├── postcss.config.js
  ├── public
  │   └── vite.svg
  ├── src
  │   ├── App.tsx
  │   ├── assets
  │   │   └── react.svg
  │   ├── components
  │   │   └── sudoku
  │   ├── core
  │   │   ├── sudoku.test.ts
  │   │   ├── sudoku.ts
  │   │   ├── sudokuGenerator.test.ts
  │   │   └── sudokuGenerator.ts
  │   ├── css
  │   │   └── index.css
  │   ├── hooks
  │   │   └── useSudokuTimer.ts
  │   ├── main.tsx
  │   └── vite-env.d.ts
  ├── tailwind.config.js
  ├── tsconfig.app.json
  ├── tsconfig.json
  ├── tsconfig.node.json
  ├── vite.config.ts
  └── yarn.lock
```

---

## Installation

Prerequisites
Node.js (v20+)
Yarn (Package Manager)

Steps to Set Up Locally
1. Clone the repository:

```bash
  git clone https://github.com/fajarriv/sudoku-game.git
  cd sudoku-game
```

2. Install dependencies:

```bash
  yarn
```

3. Run the development server:

```bash
  yarn run dev
```

4. Open the app in your browser:

```arduino
  http://localhost:3000
```

---

## Credits

- Developed by Fajar Rivaldi Ibnusina & Fauzan Firzandy Khifzan.
- Inspired by the classic Sudoku game.
