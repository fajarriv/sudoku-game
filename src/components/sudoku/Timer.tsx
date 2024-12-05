import { Timer } from "lucide-react";
import { useCallback, memo } from "react";

export const SudokuTimer: React.FC<{ timer: number}> = memo(
  ({ timer }) => {

    const formatTime = useCallback((seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }, []);

    return (
      <div className="border-[#ddd] border shadow-sm rounded p-4 bg-[#959ea53a] w-full">
        <div className="flex items-center gap-1 justify-center">
          <Timer className="w-4 h-4" />
          <p className="text-2xl font-semibold">{formatTime(timer)}</p>
        </div>
      </div>
    );
  }
);
