// src/components/Cell.tsx
import React from 'react';
import '../css/Cell.css';

type CellProps = {
  row: number;
  col: number;
  value: number;
  isSelected: boolean;
  isInitial: boolean;
  isInvalid: boolean;
  onClick: () => void;
};

const Cell: React.FC<CellProps> = ({ value, isSelected, isInitial, isInvalid, onClick }) => {
  return (
    <div
      className={`cell ${isInitial ? 'initial' : ''} ${isSelected ? 'selected' : ''} ${isInvalid ? 'invalid' : ''}`}
      onClick={onClick}
    >
      {value !== 0 ? value : ''}
    </div>
  );
};

export default Cell;
