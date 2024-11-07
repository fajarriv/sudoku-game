import { memo } from "react";

type KeypadProps = {
  onClickHandler: (num: number) => void;
};

export const Keypad: React.FC<KeypadProps> = memo(({ onClickHandler }) => {
  return (
    <div className="border-[#ddd] border shadow-sm rounded p-4 bg-[#959ea53a] w-full">
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }).map((_, index) => (
          <button
            key={index}
            className="text-center text-lg h-12 hover:bg-[#959ea53a] bg-[#242424]"
            onClick={() => onClickHandler(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="col-span-3 text-center text-lg h-12 hover:bg-[#959ea53a] bg-[#242424]"
          onClick={() => onClickHandler(0)}
        >
          Delete
        </button>
      </div>
    </div>
  );
});
