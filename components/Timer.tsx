"use client";

import {
  formatTime,
  getTimerActionLabel,
  getTimerButtonClassName,
  getTimerHint,
  getTimerLabel,
  shouldShowFormattedTime,
} from "@/services/timer-service";
import { useTimer } from "@/hooks/useTimer";

export default function Timer() {
  const { elapsed, handleButtonClick, timerState } = useTimer();

  return (
    <main>
      <section className="timer-stage">
        <button
          className={getTimerButtonClassName(timerState)}
          type="button"
          onClick={handleButtonClick}
          aria-label={getTimerActionLabel(timerState)}
        >
          <span>{getTimerLabel(timerState)}</span>
          <span className="timer-display">
            {shouldShowFormattedTime(timerState) ? formatTime(elapsed) : "0.00"}
          </span>
        </button>

        <div>
          <span>{getTimerHint(timerState)}</span>
        </div>
      </section>
    </main>
  );
}
