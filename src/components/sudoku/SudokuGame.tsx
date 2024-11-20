import { useState, useEffect, useCallback, memo } from "react";
import { Board } from "./Board";
import { findEmptyCell, findInvalids, type Board as TBoard } from "../../core/sudoku";
import { Keypad } from "./Keypad";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Confetti from "react-confetti";

const STORAGE_KEY = 'sudoku_cloneBoard';
const STORAGE_TIME_KEY = 'sudoku_lastSaveTime';
const STORAGE_INVALIDS = 'sudoku_invalidCells';
const FIFTEEN_MINUTES = 15 * 60 * 1000;

type CellPosition = [number, number] | null;

export const SudokuGame = memo(function SudokuGame() {
  const exampleBoard: TBoard = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];

  const [initialBoard] = useState(exampleBoard);
  const [currentBoard, setCurrentBoard] = useState(exampleBoard);
  const [selectedCell, setSelectedCell] = useState<CellPosition>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [invalids, setInvalids] = useState<number[][]>([[]]);
  const [showModals, setShowModals] = useState<boolean>(false);

  const handleNumberInput = useCallback(
    (num: number) => {
      if (selectedCell) {
        const [row, col] = selectedCell;
        setCurrentBoard((current) => {
          const newBoard = [...current];
          newBoard[row] = [...newBoard[row]];
          newBoard[row][col] = num;

          const newInvalids = findInvalids(newBoard);
          setInvalids(newInvalids);
          saveBoard(newBoard, newInvalids);
                
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

  const saveBoard = async (newBoard: TBoard, newInvalids: number[][]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBoard));
    await AsyncStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
    await AsyncStorage.setItem(STORAGE_INVALIDS, JSON.stringify(newInvalids));
  };

  useEffect(() => {
    const loadBoard = async () => {
      await AsyncStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
      const savedBoard = await AsyncStorage.getItem(STORAGE_KEY);
      const savedTime = await AsyncStorage.getItem(STORAGE_TIME_KEY);
      const savedInvalids = await AsyncStorage.getItem(STORAGE_INVALIDS);
      if (savedBoard && savedTime && savedInvalids) {
        const elapsedTime = Date.now() - parseInt(savedTime);
        if (elapsedTime < FIFTEEN_MINUTES) {
          setCurrentBoard(JSON.parse(savedBoard));
          setInvalids(JSON.parse(savedInvalids));
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
          await AsyncStorage.removeItem(STORAGE_TIME_KEY);
          await AsyncStorage.removeItem(STORAGE_INVALIDS);
        }
      }
    };
    loadBoard();
  }, []);


  useEffect(() => {
    const handleKeyDown = (event: WindowEventMap["keydown"]) => {
      const key = event.key;

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

  useEffect(() => {
    if (findEmptyCell(currentBoard)._tag == "None" && invalids.length < 1) { 
      setShowModals(true);
    }
  }, [invalids]);

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

      {showModals && (
        <>
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-black p-8 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
              <p className="text-lg mb-6">You have finished this Sudoku!</p>
              <button
                onClick={() => setShowModals(false)}
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
