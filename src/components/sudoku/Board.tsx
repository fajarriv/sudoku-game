type BoardProps = {
  initialBoard: number[][];
  board: number[][];
  isCompleted: boolean;
  selectedCell: [number, number] | null;
  onClickHandler: (row: number, col: number) => void;
  invalidCells: number[][];
};

export const Board: React.FC<BoardProps> = ({
  initialBoard,
  board,
  isCompleted,
  selectedCell,
  onClickHandler,
  invalidCells,
}) => {
  return (
    <div className="border-[#ddd] border shadow-sm rounded p-4 w-fit flex flex-shrink-0">
      <div className="grid grid-cols-9 gap-1 p-2 bg-[#959ea53a] rounded-lg">
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => (
            <button
              key={`${rowIdx}-${colIdx}`}
              disabled={isCompleted || initialBoard[rowIdx][colIdx] !== 0}
              className={`aspect-square size-10 text-center text-lg
                ${
                  initialBoard[rowIdx][colIdx] === 0
                    ? "bg-[#242424]"
                    : "bg-[#959ea53a]"
                }
                ${
                  invalidCells.some(([r, c]) => r === rowIdx && c === colIdx)
                    ? "bg-[#ff0d004e]"
                    : ""
                }
                ${
                  selectedCell?.[0] === rowIdx && selectedCell?.[1] === colIdx
                    ? "ring-2 ring-blue-400"
                    : ""
                }
                ${rowIdx % 3 === 2 && rowIdx !== 8 ? "border-b-2" : ""}
                ${colIdx % 3 === 2 && colIdx !== 8 ? "border-r-2" : ""}
                hover:bg-[#959ea53a] hover:text-white
                `}
              onClick={() => onClickHandler(rowIdx, colIdx)}
            >
              {cell !== 0 ? cell : ""}
            </button>
          ))
        )}
      </div>
    </div>
  );
};
