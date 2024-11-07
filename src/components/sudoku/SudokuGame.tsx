import { useState, useEffect, useCallback, memo } from "react";
import { Board } from "./Board";
import type { Board as TBoard } from "../../core/sudoku";
import { Keypad } from "./Keypad";

type CellPosition = [number, number] | null;

export const SudokuGame = memo(function SudokuGame() {
  const exampleBoard: TBoard = [
    [1, 0, 3, 4, 5, 6, 7, 8, 0],
    [0, 0, 6, 7, 0, 9, 0, 2, 3],
    [7, 8, 9, 0, 2, 0, 4, 5, 6],
    [2, 3, 4, 0, 6, 7, 8, 9, 0],
    [0, 6, 0, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 0, 3, 4, 0, 6, 7],
    [3, 0, 5, 6, 7, 0, 0, 1, 2],
    [6, 0, 0, 9, 1, 2, 3, 0, 5],
    [0, 1, 0, 3, 0, 5, 0, 7, 8],
  ];

  const [initialBoard] = useState(exampleBoard);
  const [currentBoard, setCurrentBoard] = useState(exampleBoard);
  const [selectedCell, setSelectedCell] = useState<CellPosition>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const handleNumberInput = useCallback(
    (num: number) => {
      if (selectedCell) {
        const [row, col] = selectedCell;
        setCurrentBoard((current) => {
          const newBoard = [...current];
          newBoard[row] = [...newBoard[row]];
          newBoard[row][col] = num;
          return newBoard;
        });
      }
    },
    [selectedCell]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (initialBoard[row][col] === 0) {
        setSelectedCell([row, col]);
      }
    },
    [initialBoard]
  );

  // event listener for keyboard input
  useEffect(() => {
    const handleKeyDown = (event: WindowEventMap["keydown"]) => {
      const key = event.key;

      // Handle number inputs (1-9)
      if (/^[1-9]$/.test(key)) {
        handleNumberInput(parseInt(key));
      }
      if (key === "Backspace" || key === "Delete") {
        handleNumberInput(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNumberInput]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <Board
        initialBoard={initialBoard}
        board={currentBoard}
        isCompleted={isComplete}
        selectedCell={selectedCell}
        onClickHandler={handleCellClick}
      />
      <div className="w-full space-y-3">
        <Keypad onClickHandler={handleNumberInput} />
      </div>
    </div>
  );
});
