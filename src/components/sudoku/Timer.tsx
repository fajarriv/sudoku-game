import { Timer } from "lucide-react";
import { useCallback, useEffect, useState, memo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TIMER_STORAGE_KEY = "sudoku_timer";

export const SudokuTimer: React.FC<{ isComplete: boolean }> = memo(
  ({ isComplete }) => {
    const [timer, setTimer] = useState<number>(0);

    useEffect(() => {
      const loadTimer = async () => {
        const savedTimer = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (savedTimer) {
          setTimer(parseInt(savedTimer, 10));
        }
      };
      loadTimer();
    }, []);

    useEffect(() => {
      let interval: number;
      if (!isComplete) {
        interval = setInterval(() => {
          setTimer((prev) => {
            const newTime = prev + 1;
            AsyncStorage.setItem(TIMER_STORAGE_KEY, newTime.toString());
            return newTime;
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isComplete]);

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
