import { useState, useEffect, useCallback, memo } from "react";
import { Board } from "./Board";
import { findEmptyCell, findInvalids, type Board as TBoard } from "../../core/sudoku";
import { Keypad } from "./Keypad";
// import AsyncStorage from '@react-native-async-storage/async-storage';
import Confetti from "react-confetti";
import { generateGame, type Difficulty } from "../../core/sudokuGenerator";
import * as E from 'fp-ts/Either'
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = 'sudoku_cloneBoard';
const STORAGE_TIME_KEY = 'sudoku_lastSaveTime';
const STORAGE_INITIALBOARD = 'sudoku_initialBoard';
const STORAGE_INVALIDS = 'sudoku_invalidCells';
const STORAGE_STATUS = 'sudoku_status';
const FIFTEEN_MINUTES = 15 * 60 * 1000;

type CellPosition = [number, number] | null;

export const SudokuGame = memo(function SudokuGame() {
  const zeros = Array(9).fill(null).map(() => Array(9).fill(0))
  const [initialBoard, setInitialBoard] = useState<TBoard>(zeros);
  const [currentBoard, setCurrentBoard] = useState<TBoard>(zeros);
  const [selectedCell, setSelectedCell] = useState<CellPosition>(null);
  const [isComplete, setIsComplete] = useState<boolean>(true);
  const [invalids, setInvalids] = useState<number[][]>([[]]);
  const [showDifficultyModal, setShowDifficultyModal] = useState<boolean>(true);

  // INITIAL RENDER on mount.
  const initializeBoard = (difficulty: Difficulty) => {
    const boardResult = generateGame(difficulty);
    if (E.isRight(boardResult)) {
      const newBoard = boardResult.right;
      setInitialBoard(newBoard);
      setCurrentBoard(newBoard);
      setShowDifficultyModal(false);
      setIsComplete(false);
      saveBoard(newBoard, newBoard, []);
    } else {
      console.error("Failed to generate board:", boardResult.left);
    }
  };

  const resetGame = async () => {
    setShowDifficultyModal(true);

    // Clear AsyncStorage
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(STORAGE_TIME_KEY);
    await AsyncStorage.removeItem(STORAGE_INVALIDS);
    await AsyncStorage.removeItem(STORAGE_STATUS);
    await AsyncStorage.removeItem(STORAGE_INITIALBOARD);

    // Reset state
    setInitialBoard(zeros);
    setCurrentBoard(zeros);
    setInvalids([[]]);
    setSelectedCell(null);
    setIsComplete(false);
    setShowDifficultyModal(true);
  };

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
          saveBoard(initialBoard, newBoard, newInvalids);
          if (findEmptyCell(newBoard)._tag == "None" && newInvalids.length < 1){ 
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

  const saveBoard = async (initial: TBoard, newBoard: TBoard, newInvalids: number[][]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBoard));
    await AsyncStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
    await AsyncStorage.setItem(STORAGE_INITIALBOARD, JSON.stringify(initial));
    await AsyncStorage.setItem(STORAGE_INVALIDS, JSON.stringify(newInvalids));
    await AsyncStorage.setItem(STORAGE_STATUS, JSON.stringify(isComplete));
  };

  useEffect(() => {
    const loadBoard = async () => {
      await AsyncStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
      const initial = await AsyncStorage.getItem(STORAGE_INITIALBOARD);
      const savedBoard = await AsyncStorage.getItem(STORAGE_KEY);
      const savedTime = await AsyncStorage.getItem(STORAGE_TIME_KEY);
      const savedInvalids = await AsyncStorage.getItem(STORAGE_INVALIDS);
      const savedStatus = await AsyncStorage.getItem(STORAGE_STATUS);
      if (initial && savedBoard && savedTime && savedInvalids && savedStatus) {
        const elapsedTime = Date.now() - parseInt(savedTime);
        if (elapsedTime < FIFTEEN_MINUTES) {
          setInitialBoard(JSON.parse(initial));
          setCurrentBoard(JSON.parse(savedBoard));
          setInvalids(JSON.parse(savedInvalids));
          setIsComplete(JSON.parse(savedStatus));
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
          await AsyncStorage.removeItem(STORAGE_TIME_KEY);
          await AsyncStorage.removeItem(STORAGE_INVALIDS);
          await AsyncStorage.removeItem(STORAGE_STATUS);
        }
      }
    };
    loadBoard();
  }, []);

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
      {showDifficultyModal && isComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-black">Choose Difficulty</h2>
            <div className="flex justify-around space-x-4">
              <button
                onClick={() => initializeBoard("easy")}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Easy
              </button>
              <button
                onClick={() => initializeBoard("medium")}
                className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
              >
                Medium
              </button>
              <button
                onClick={() => initializeBoard("hard")}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                Hard
              </button>
            </div>
          </div>
        </div>
      )}
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

      {isComplete && !showDifficultyModal && (
        <>
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-black p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
              <p className="text-lg mb-6">You have finished this Sudoku!</p>
              <button
                onClick={resetGame}
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