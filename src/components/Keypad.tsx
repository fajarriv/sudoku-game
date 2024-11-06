
import React from 'react';
import '../css/Keypad.css';

type KeypadProps = {
  onNumberClick: (num: number) => void;
};

const Keypad: React.FC<KeypadProps> = ({ onNumberClick }) => {
  return (
    <div className="keypad">
      {Array.from({ length: 9 }).map((_, index) => (
        <button key={index} onClick={() => onNumberClick(index + 1)}>
          {index + 1}
        </button>
      ))}
    </div>
  );
};

export default Keypad;
