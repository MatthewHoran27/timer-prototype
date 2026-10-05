"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TimerState = "ready" | "holding" | "running" | "stopped";

function formatTime(milliseconds: number) {
  const totalCentiseconds = Math.floor(milliseconds / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  }

  return `${seconds}.${String(centiseconds).padStart(2, "0")}`;
}

export default function Home() {
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
  }, [updateState]);

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

  const handleButtonClick = () => {
    if (timerState === "running") {
      stopTimer();
    } else if (timerState === "stopped") {
      setElapsed(0);
      updateState("ready");
    } else {
      startTimer();
    }
  };

  const timerLabel = {
    ready: "READY",
    holding: "HOLD",
    running: "SOLVING",
    stopped: "STOPPED",
  }[timerState];

  return (
    <main>
      <section className="timer-stage">
        <button
          className={`timer-button${timerState === "holding" || timerState === "running" ? ` timer-${timerState}` : ""}`}
          type="button"
          onClick={handleButtonClick}
          aria-label={timerState === "running" ? "Stop timer" : timerState === "stopped" ? "Reset timer" : "Start timer"}
        >
          <span>{timerLabel}</span>
          <span className="timer-display">
            {timerState === "running" || timerState === "stopped" ? formatTime(elapsed) : "0.00"}
          </span>
        </button>

        <div>
          <span>{timerState === "running" ? "Press Space to Stop" : "Press Space to Start"}</span>
        </div>
      </section>
    </main>
  );
}
