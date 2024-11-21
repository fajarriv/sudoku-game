// src/components/sudoku/gameReducer.ts
import { type Board as TBoard } from "../../core/sudoku";
import { findEmptyCell, findInvalids } from "../../core/sudoku";

export type CellPosition = [number, number] | null;

export type GameState = {
  initialBoard: TBoard;
  currentBoard: TBoard;
  selectedCell: CellPosition;
  invalids: number[][];
  isComplete: boolean;
  showDifficultyModal: boolean;
}

export type GameAction = 
  | { type: 'INITIALIZE_BOARD'; payload: { board: TBoard } }
  | { type: 'INPUT_NUMBER'; payload: { num: number } }
  | { type: 'SELECT_CELL'; payload: { row: number; col: number } }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_SAVED_GAME'; payload: Omit<GameState, 'showDifficultyModal'> }

export const createInitialState = (): GameState => {
  const zeros = Array(9).fill(null).map(() => Array(9).fill(0));
  return {
    initialBoard: zeros,
    currentBoard: zeros,
    selectedCell: null,
    invalids: [[]],
    isComplete: false,
    showDifficultyModal: true,
  };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INITIALIZE_BOARD':
      return {
        ...state,
        initialBoard: action.payload.board,
        currentBoard: action.payload.board,
        showDifficultyModal: false,
        isComplete: false,
        invalids: [],
        selectedCell: null
      };

    case 'INPUT_NUMBER': {
      if (!state.selectedCell) return state;
      
      const [row, col] = state.selectedCell;
      const newBoard = state.currentBoard.map((r, i) => 
        i === row 
          ? r.map((c, j) => j === col ? action.payload.num : c)
          : [...r]
      );

      const newInvalids = findInvalids(newBoard);
      const isEmpty = findEmptyCell(newBoard)._tag === "None";
      const isComplete = isEmpty && newInvalids.length < 1;

      return {
        ...state,
        currentBoard: newBoard,
        invalids: newInvalids,
        isComplete
      };
    }

    case 'SELECT_CELL':
      return {
        ...state,
        selectedCell: 
          state.initialBoard[action.payload.row][action.payload.col] === 0 
            ? [action.payload.row, action.payload.col]
            : state.selectedCell
      };

    case 'RESET_GAME':
      return createInitialState();

    case 'LOAD_SAVED_GAME':
      return {
        ...state,
        ...action.payload,
        showDifficultyModal: false
      };

    default:
      return state;
  }
};