import { useState, useEffect } from 'react';
import './css/App.css';
import BoardUI from './components/Board';
import Keypad from './components/Keypad';
import { Board } from './core/sudoku';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findInvalids } from './core/sudoku';

const STORAGE_KEY = 'sudoku_cloneBoard';
const STORAGE_TIME_KEY = 'sudoku_lastSaveTime';
const FIFTEEN_MINUTES = 15 * 60 * 1000;

function App() {
  const initialBoard: Board = [
    [1, 0, 3, 4, 5, 6, 7, 8, 0], 
    [0, 0, 6, 7, 0, 9, 0, 2, 3],
    [7, 8, 9, 0, 2, 0, 4, 5, 6],
    [2, 3, 4, 0, 6, 7, 8, 9, 0],
    [0, 6, 0, 8, 9, 1, 2, 3, 4],
    [8, 9, 1, 0, 3, 4, 0, 6, 7],
    [3, 0, 5, 6, 7, 0, 0, 1, 2],
    [6, 0, 0, 9, 1, 2, 3, 0, 5],
    [0, 1, 0, 3, 0, 5, 0, 7, 8]
  ];

  const [board] = useState<Board>(initialBoard); // Static reference board
  const [cloneBoard, setCloneBoard] = useState<Board>(initialBoard); // Editable clone board
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [invalidDict, setInvalidDict] = useState<Map<string, number[][]>>(new Map([]));

  const addInvalidDict = (key: string, newValues: number[][]) => {
    setInvalidDict((prevDict) => {
      const newDict = new Map(prevDict);
      newDict.set(key, newValues); 
      return newDict;
    });
  };

  const deleteInvalidDict = (key: string) => {
    setInvalidDict((prevDict) => {
      const newDict = new Map(prevDict);
      newDict.delete(key);
      return newDict;
    });
  };

  const getAllInvalids = (): number[][][] => {
    return Array.from(invalidDict.values()).reduce((acc, current) => {
      acc.push(current);
      return acc;
    }, [] as number[][][]);
  };

  useEffect(() => {
    // Load saved board if within 15 minutes
    const loadBoard = async () => {
      await AsyncStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
      const savedBoard = await AsyncStorage.getItem(STORAGE_KEY);
      const savedTime = await AsyncStorage.getItem(STORAGE_TIME_KEY);

      if (savedBoard && savedTime) {
        const elapsedTime = Date.now() - parseInt(savedTime);
        if (elapsedTime < FIFTEEN_MINUTES) {
          setCloneBoard(JSON.parse(savedBoard));
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
          await AsyncStorage.removeItem(STORAGE_TIME_KEY);
        }
      }
    };
    loadBoard();

  }, []);

  const saveBoard = async (newBoard: Board) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBoard));
    await AsyncStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  const handleNumberClick = (num: number) => {
    if (selectedCell) {
      const [row, col] = selectedCell;

      // Only allow editing if the cell in the original board is zero
      if (board[row][col] === 0) {
        const newBoard = cloneBoard.map((r, _) => [...r]);
        newBoard[row][col] = num;

        setCloneBoard(newBoard);
        saveBoard(newBoard);
        if (cloneBoard[row][col] !== num){
          const newInvalidCells = findInvalids(newBoard, row, col, num);
          addInvalidDict(JSON.stringify([row,col]), newInvalidCells);
        }
      }
    }
  };

  const handleDelete = () => {
    if (selectedCell) {
      const [row, col] = selectedCell;

      // Only allow deleting if the cell in the original board is zero
      if (board[row][col] === 0) {
        const newBoard = cloneBoard.map((r, _) => [...r]);
        newBoard[row][col] = 0;
        setCloneBoard(newBoard);
        saveBoard(newBoard);
        
        deleteInvalidDict(JSON.stringify([row,col]))
      }
    }
  };

  useEffect(() => {
    // Generate the Sudoku puzzle when the component mounts
    // const generatedBoard = fillPuzzle(board);
    // if (generatedBoard._tag === 'Right') {
    //   setBoard(generatedBoard.right);
    // }

    const handleKeyDown = (event: KeyboardEvent) => {
      const num = parseInt(event.key);
      if (num >= 1 && num <= 9) {
        handleNumberClick(num);
      }
      else if (event.key === 'Backspace' || event.key === 'Delete') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, cloneBoard]);

  return (
    <>
      <h1>Sudoku Puzzle</h1>
      <div className="board">
        <BoardUI 
          initialBoard={initialBoard} 
          board={cloneBoard} 
          selectedCell={selectedCell} 
          onCellClick={handleCellClick} 
          invalidCells={getAllInvalids().flat()}
          />
        <Keypad onNumberClick={handleNumberClick} />
      </div>
    </>
  );
}

export default App;
