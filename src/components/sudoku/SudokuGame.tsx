import { useState, useEffect, useCallback, memo } from "react";
import { Board } from "./Board";
import { findEmptyCell, findInvalids, type Board as TBoard } from "../../core/sudoku";
import { Keypad } from "./Keypad";
// import AsyncStorage from '@react-native-async-storage/async-storage';
import Confetti from "react-confetti";
import { generateGame, type Difficulty } from "../../core/sudokuGenerator";
import * as E from 'fp-ts/Either'

// const STORAGE_KEY = 'sudoku_cloneBoard';
// const STORAGE_TIME_KEY = 'sudoku_lastSaveTime';
// const STORAGE_INVALIDS = 'sudoku_invalidCells';
// const FIFTEEN_MINUTES = 15 * 60 * 1000;

type CellPosition = [number, number] | null;

export const SudokuGame = memo(function SudokuGame() {

  const [initialBoard, setInitialBoard] = useState<TBoard>([]);
  const [currentBoard, setCurrentBoard] = useState<TBoard>([]);
  const [selectedCell, setSelectedCell] = useState<CellPosition>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [invalids, setInvalids] = useState<number[][]>([[]]);

  // INITIAL RENDER on mount.
  useEffect(() => {
    const initializeOrLoadBoard = async () => {
        const difficulty: Difficulty = 'medium';
        const boardResult = generateGame(difficulty);
        if (E.isRight(boardResult)) {
          const newBoard = boardResult.right;
          setInitialBoard(newBoard);
          setCurrentBoard(newBoard);
        } else {
          console.error("Failed to generate board:", boardResult.left);
        }
    };
  
    initializeOrLoadBoard();
  }, []);

  const handleNumberInput = useCallback(
    (num: number) => {
      if (selectedCell) {
        const [row, col] = selectedCell;
        setCurrentBoard((current) => {
          const newBoard = [...current];
          newBoard[row] = [...newBoard[row]];
          newBoard[row][col] = num;

          // find invalids and check if game is complete
          const newInvalids = findInvalids(newBoard);
          setInvalids(newInvalids);
          // saveBoard(newBoard, newInvalids);
          if (findEmptyCell(newBoard)._tag == "None" && invalids.length < 1){ 
            setIsComplete(true);
          }
          return newBoard;
        });
      }
    },
    [invalids.length, selectedCell]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (initialBoard[row][col] === 0) {
        setSelectedCell([row, col]);
      }
    },
    [initialBoard]
  );

  // const saveBoard = async (newBoard: TBoard, newInvalids: number[][]) => {
  //   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBoard));
  //   await AsyncStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
  //   await AsyncStorage.setItem(STORAGE_INVALIDS, JSON.stringify(newInvalids));
  // };

  // useEffect(() => {
  //   const loadBoard = async () => {
  //     await AsyncStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
  //     const savedBoard = await AsyncStorage.getItem(STORAGE_KEY);
  //     const savedTime = await AsyncStorage.getItem(STORAGE_TIME_KEY);
  //     const savedInvalids = await AsyncStorage.getItem(STORAGE_INVALIDS);
  //     if (savedBoard && savedTime && savedInvalids) {
  //       const elapsedTime = Date.now() - parseInt(savedTime);
  //       if (elapsedTime < FIFTEEN_MINUTES) {
  //         setCurrentBoard(JSON.parse(savedBoard));
  //         setInvalids(JSON.parse(savedInvalids));
  //       } else {
  //         await AsyncStorage.removeItem(STORAGE_KEY);
  //         await AsyncStorage.removeItem(STORAGE_TIME_KEY);
  //         await AsyncStorage.removeItem(STORAGE_INVALIDS);
  //       }
  //     }
  //   };
  //   loadBoard();
  // }, []);

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
        invalidCells={invalids}
      />
      <div className="w-full space-y-3">
        <Keypad onClickHandler={handleNumberInput} />
      </div>

      {isComplete && (
        <>
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-black p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
              <p className="text-lg mb-6">You have finished this Sudoku!</p>
              <button
                onClick={() => setIsComplete(false)}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});
