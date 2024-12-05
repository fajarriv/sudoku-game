import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TIMER_STORAGE_KEY = "sudoku_timer";

export const useSudokuTimer = (isComplete: boolean) => {
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
    let interval: NodeJS.Timer;
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

  const resetTimer = async () => {
    setTimer(0);
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, "0");
  };

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return { timer, resetTimer, formatTime };
};