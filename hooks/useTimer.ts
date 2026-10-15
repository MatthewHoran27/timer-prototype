"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerState } from "@/services/timer-service";

export function useTimer(onNewScramble: () => void | Promise<void>) {
  const [timerState, setTimerState] = useState<TimerState>("ready");
  const [elapsed, setElapsed] = useState(0);
  const timerStateRef = useRef(timerState);
  const heldRef = useRef(false);
  const startedAtRef = useRef(0);

  const updateState = useCallback((nextState: TimerState) => {
    timerStateRef.current = nextState;
    setTimerState(nextState);
  }, []);

  const startTimer = useCallback(() => {
    startedAtRef.current = performance.now();
    setElapsed(0);
    updateState("running");
  }, [updateState]);

  const stopTimer = useCallback(() => {
    setElapsed(performance.now() - startedAtRef.current);
    updateState("stopped");
    heldRef.current = false;
    onNewScramble();
  }, [onNewScramble, updateState]);

  useEffect(() => {
    if (timerState !== "running") return;

    const interval = window.setInterval(() => {
      setElapsed(performance.now() - startedAtRef.current);
    }, 10);

    return () => window.clearInterval(interval);
  }, [timerState]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" || event.repeat) return;
      event.preventDefault();

      if (timerStateRef.current === "running") {
        stopTimer();
      } else if (!heldRef.current) {
        heldRef.current = true;
        if (timerStateRef.current !== "holding") updateState("holding");
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code !== "Space" || !heldRef.current) return;
      event.preventDefault();
      heldRef.current = false;

      if (timerStateRef.current === "holding") startTimer();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [startTimer, stopTimer, updateState]);

  const resetTimer = useCallback(() => {
    setElapsed(0);
    updateState("ready");
    onNewScramble();
  }, [onNewScramble, updateState]);

  const handleButtonClick = useCallback(() => {
    if (timerState === "running") {
      stopTimer();
    } else if (timerState === "stopped") {
      resetTimer();
    }
  }, [resetTimer, stopTimer, timerState]);

  return {
    elapsed,
    handleButtonClick,
    timerState,
  };
}
