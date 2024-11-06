// src/components/Board.tsx
import React from 'react';
import Cell from './Cell';
import '../css/Board.css';

type BoardProps = {
  initialBoard: number[][];
  board: number[][];
  selectedCell: [number, number] | null;
  onCellClick: (row: number, col: number) => void;
  invalidCells: number[][];
};

const BoardUI: React.FC<BoardProps> = ({ initialBoard, board, selectedCell, onCellClick, invalidCells }) => {
  return (
    <div className="board">
      {board.map((rowValues, row) => (
        <div className="board-row" key={row}>
          {rowValues.map((value, col) => (
            <Cell
              key={`${row}-${col}`}
              row={row}
              col={col}
              value={value}
              isSelected={selectedCell?.[0] === row && selectedCell?.[1] === col}
              isInitial={initialBoard[row][col] !== 0}
              onClick={() => onCellClick(row, col)}
              isInvalid={invalidCells.some(([r, c]) => r === row && c === col)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BoardUI;
