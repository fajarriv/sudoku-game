import { useEffect, useCallback, memo, useReducer } from "react";
import { Board } from "./Board";
import { type Board as TBoard } from "../../core/sudoku";
import { Keypad } from "./Keypad";
import { SudokuTimer } from "./Timer";
import Confetti from "react-confetti";
import { generateGame, type Difficulty } from "../../core/sudokuGenerator";
import * as E from "fp-ts/Either";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { gameReducer, createInitialState } from "./gameReducer";

const STORAGE_KEY = "sudoku_cloneBoard";
const STORAGE_TIME_KEY = "sudoku_lastSaveTime";
const STORAGE_INITIALBOARD = "sudoku_initialBoard";
const STORAGE_INVALIDS = "sudoku_invalidCells";
const STORAGE_STATUS = "sudoku_status";
const TIMER_STORAGE_KEY = "sudoku_timer";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const SudokuGame = memo(function SudokuGame() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  const saveBoard = useCallback(
    async (initial: TBoard, newBoard: TBoard, newInvalids: number[][]) => {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBoard)),
        AsyncStorage.setItem(STORAGE_TIME_KEY, Date.now().toString()),
        AsyncStorage.setItem(STORAGE_INITIALBOARD, JSON.stringify(initial)),
        AsyncStorage.setItem(STORAGE_INVALIDS, JSON.stringify(newInvalids)),
        AsyncStorage.setItem(STORAGE_STATUS, JSON.stringify(state.isComplete)),
      ]);
    },
    [state.isComplete]
  );

  const initializeBoard = (difficulty: Difficulty) => {
    const boardResult = generateGame(difficulty);
    if (E.isRight(boardResult)) {
      const newBoard = boardResult.right;
      dispatch({ type: "INITIALIZE_BOARD", payload: { board: newBoard } });
      saveBoard(newBoard, newBoard, []);
    } else {
      console.error("Failed to generate board:", boardResult.left);
    }
  };

  const resetGame = async () => {
    dispatch({ type: "RESET_GAME" });
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY),
      AsyncStorage.removeItem(STORAGE_TIME_KEY),
      AsyncStorage.removeItem(STORAGE_INVALIDS),
      AsyncStorage.removeItem(STORAGE_STATUS),
      AsyncStorage.removeItem(STORAGE_INITIALBOARD),
      AsyncStorage.removeItem(TIMER_STORAGE_KEY),
    ]);
  };

  const handleNumberInput = useCallback((num: number) => {
    dispatch({ type: "INPUT_NUMBER", payload: { num } });
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    dispatch({ type: "SELECT_CELL", payload: { row, col } });
  }, []);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const [initial, savedBoard, savedTime, savedInvalids, savedStatus] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_INITIALBOARD),
            AsyncStorage.getItem(STORAGE_KEY),
            AsyncStorage.getItem(STORAGE_TIME_KEY),
            AsyncStorage.getItem(STORAGE_INVALIDS),
            AsyncStorage.getItem(STORAGE_STATUS),
          ]);

        if (
          initial &&
          savedBoard &&
          savedTime &&
          savedInvalids &&
          savedStatus
        ) {
          const elapsedTime = Date.now() - parseInt(savedTime);
          if (elapsedTime < FIFTEEN_MINUTES) {
            dispatch({
              type: "LOAD_SAVED_GAME",
              payload: {
                initialBoard: JSON.parse(initial),
                currentBoard: JSON.parse(savedBoard),
                invalids: JSON.parse(savedInvalids),
                isComplete: JSON.parse(savedStatus),
                selectedCell: null,
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to load saved game:", error);
      }
    };
    loadBoard();
  }, []);

  // event listener for keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      let inputNum = 0;
      if (/^[1-9]$/.test(event.key)) {
        handleNumberInput(parseInt(event.key));
        inputNum = parseInt(event.key);
      }
      if (event.key === "Backspace" || event.key === "Delete") {
        handleNumberInput(0);
      }
      const nextState = gameReducer(state, {
        type: "INPUT_NUMBER",
        payload: { num: inputNum },
      });
      saveBoard(
        nextState.initialBoard,
        nextState.currentBoard,
        nextState.invalids
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNumberInput, saveBoard, state]);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {state.showDifficultyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4 text-black">
              Choose Difficulty
            </h2>
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
        initialBoard={state.initialBoard}
        board={state.currentBoard}
        isCompleted={state.isComplete}
        selectedCell={state.selectedCell}
        onClickHandler={handleCellClick}
        invalidCells={state.invalids}
      />
      <div className="w-full space-y-3">
        <SudokuTimer isComplete={state.isComplete}/>
        <Keypad onClickHandler={handleNumberInput} />
      </div>

      {state.isComplete && !state.showDifficultyModal && (
        <>
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
          />
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
