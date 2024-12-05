# Sudoku Game

You can access it via https://sudoku-fp.vercel.app/

This project implements a fully functional **Sudoku game** while emphasizing **functional programming principles**. With modern web technologies, this game offers an interactive interface, dynamic gameplay, and robust features to challenge and delight players.

---

## Table of Contents
- [Game Features](#game-features)
- [Gameplay](#gameplay)
- [Technology Stack](#technology-stack)
- [What is Functional Programming?](#what-is-functional-programming)
- [Functional Programming in this Project](#functional-programming-in-this-project)
- [Code Structure](#code-structure)
- [Installation](#installation)
- [Credits](#credits)

---

## Game Features

- **Dynamic Sudoku Puzzle Generation**: Automatically generates puzzles with random difficulties (Easy, Medium, Hard).
- **Solver**: Capable of solving Sudoku puzzles programmatically.
- **Keyboard Input Support**: Players can input numbers directly using the keyboard.
- **Highlighting Invalid Entries**: Highlights incorrect cells in red for immediate feedback.
- **Editable & Non-Editable Cells**: Clearly differentiates between fixed puzzle numbers and editable cells.
- **Async Storage**: Saves game progress for up to 15 minutes, enabling players to continue after a refresh.
- **Timer**: Tracks the time spent solving each puzzle.
- **Reset & Restart Options**: Players can reset the current board or start a new game at any time.

---

## Gameplay

<img width="927" alt="image" src="https://github.com/user-attachments/assets/022baba8-4fd7-4ec1-8438-2e31931b9d13">
<img width="927" alt="image" src="https://github.com/user-attachments/assets/51e089c3-15ab-46df-86e0-a192c49450c0">

---

## Technology Stack

- **React**: The core framework for building the user interface.
- **Vite**: A lightning-fast development build tool.
- **TypeScript**: Provides type safety and better developer experience.
- **fp-ts**: Implements functional programming utilities, ensuring immutability and purity.
- **Lucide-React**: Enhances UI with a wide array of icons.
- **AsyncStorage**: Persists user progress between sessions.

---

## What is Functional Programming?

Functional programming (FP) is a programming paradigm that treats computation as the evaluation of mathematical functions. It avoids changing state and mutable data, making programs more predictable and easier to debug. Unlike imperative programming, where the focus is on *how* to perform tasks, FP emphasizes describing *what* should be achieved.

Key principles of FP include:

- **Immutability**: Data structures cannot be changed after they are created. Instead, when modifications are required, new versions of the data structures are generated. This eliminates unintended side effects and makes programs more predictable.
- **Pure Functions**: Functions always produce the same output for the same input and have no side effects. They do not depend on or alter any external state, ensuring their behavior is consistent.
- **Declarative Style**: FP focuses on describing the desired outcome ("what") rather than providing step-by-step instructions ("how") to achieve it.
- **Higher-Order Functions (HOFs)**: Functions that take other functions as arguments or return them as output. This abstraction allows for reusable and flexible code.
- **Composition**: Combining small, reusable functions to build more complex behaviors. This modular approach improves code readability and maintainability.
- **Monads**: Special structures like `Option` and `Either` that encapsulate values or computations, enabling safe handling of failures, null values, or other edge cases without using exceptions.

---

## Functional Programming in this Project

This Sudoku game applies several functional programming principles to ensure the code is modular, maintainable, and robust. The `fp-ts` library is heavily utilized to implement these principles effectively. Below are the FP principles demonstrated in this project:

### 1. Immutability

**What does it mean?**
Immutability ensures that data structures cannot be changed after they are created. Instead of altering the original data, new data structures are created to reflect the changes. This eliminates unintended side effects and ensures that data remains predictable and consistent throughout the program's execution.

#### Example: Updating a Cell
In `gameReducer.ts`, when a player inputs a number into a cell:

```typescript
const newBoard = state.currentBoard.map((r, i) =>
  i === row
    ? r.map((c, j) => (j === col ? action.payload.num : c))
    : [...r]
);
```

**Explanation:**
- The `map` function iterates over each row and creates a new array. If the current row matches the target row, it further iterates through the columns to update the specific cell.
- Instead of modifying the existing board, a new board is created with the updated value.

**Why is this important?**
Immutability ensures that the original board remains unchanged, preserving its state for debugging or other operations. It also eliminates the risk of unintended changes, making the program more reliable.

**fp-ts Method Used:** `A.map`
- The `A.map` function from `fp-ts/Array` applies a transformation to each element of an array and returns a new array. It ensures that the original array remains intact, adhering to immutability principles.

---

### 2. Pure Functions

**What does it mean?**
A pure function is a function that:
1. Always produces the same output given the same input.
2. Does not cause any side effects, such as modifying global variables or interacting with external systems.

#### Example: Validating a Placement
In `isValidPlacement`:

```typescript
export const isValidPlacement = (board: Board, row: number, col: number, num: number): boolean =>
  isRowValid(board, row, num) &&
  isColumnValid(board, col, num) &&
  isBoxValid(board, row, col, num);
```

**Explanation:**
- The function determines whether a given number can be placed in a specific cell based on Sudoku rules.
- It depends solely on the provided inputs (`board`, `row`, `col`, `num`) and does not modify any external state or the board itself.

**Why is this important?**
Pure functions make the code predictable and easy to test. Since the function's output depends only on its input, testing becomes straightforward without worrying about hidden dependencies.

---

### 3. Declarative Programming

**What does it mean?**
Declarative programming focuses on describing *what* needs to be done rather than *how* to do it. This approach leads to more concise and readable code by abstracting away the implementation details.

#### Example: Finding an Empty Cell
In `findEmptyCell`:

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

**Explanation:**
- The `pipe` function and `A.findIndex` combinators describe the process of finding the first empty cell in a high-level, declarative manner.
- Instead of manually iterating over rows and columns, the logic is expressed using reusable utilities, making the code easier to read and maintain.

**Why is this important?**
Declarative code reduces complexity by focusing on the *what*, allowing developers to reason about the program's behavior without getting bogged down in implementation details.

**fp-ts Method Used:** `pipe`
- `pipe` is a core utility in `fp-ts` that allows chaining of operations in a left-to-right sequence. It improves code readability by eliminating deeply nested function calls.

---

### 4. Composition

**What does it mean?**
Composition is the process of combining small, reusable functions to build more complex functionality. Each function focuses on a single responsibility, making the overall code modular and easier to debug.

#### Example: Filling Diagonal Boxes
In `fillDiagonalBoxes`:

```typescript
const fillBox = (board: Board, startPos: number): Board => {
  const shuffledNums = shuffle(numbers);
  return pipe(
    createBoxPositions(startPos),
    A.reduceWithIndex(board, (idx, acc, [row, col]) => 
      acc.map((r, i) =>
        i === row
          ? r.map((c, j) => (j === col ? shuffledNums[idx] : c))
          : r
      )
    )
  );
};
```

**Explanation:**
- The function `createBoxPositions` generates the positions for a box, `shuffle` randomizes the numbers, and `A.reduceWithIndex` places the numbers into the box.
- Each function performs a specific task, and they are composed together using `pipe` to create a filled box.

**Why is this important?**
Composition keeps functions focused and reusable. Debugging and testing individual components is simpler, and changes to one function do not affect others.

**fp-ts Method Used:** `A.reduceWithIndex`
- `A.reduceWithIndex` is a method that reduces an array while providing access to the index of each element. It enables transformations that depend on both the element and its position.

---

### 5. Monads (Option and Either)

**What does it mean?**
Monads like `Option` and `Either` encapsulate values and computations that might fail or be absent. They provide a structured way to handle errors or null values without resorting to exceptions or undefined behavior.

#### Example: Finding an Empty Cell
In `findEmptyCell`:

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

**Explanation:**
- The function uses `Option` to handle cases where no empty cell exists.
- By wrapping the result in `Option`, the code avoids returning null or undefined, making error handling explicit and safe.

**Why is this important?**
Using Monads simplifies error handling and ensures that edge cases (e.g., no empty cells) are handled gracefully without breaking the application.

**fp-ts Method Used:** `O.chain` and `O.map`
- `O.chain` is used to transform an `Option` value by applying a function that returns another `Option`.
- `O.map` applies a function to the value inside an `Option`, returning a new `Option` with the transformed value.



---

## Code Structure

```plaintext
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

---

## Credits

- Developed by Fajar Rivaldi Ibnusina & Fauzan Firzandy Khifzan.
- Inspired by the classic Sudoku game.
