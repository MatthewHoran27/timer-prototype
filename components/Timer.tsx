"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTimer } from "@/hooks/useTimer";
import { drawScramble } from "@/services/scramble-service";
import {
  formatTime,
  getTimerActionLabel,
  getTimerButtonClassName,
  getTimerHint,
  getTimerLabel,
  shouldShowFormattedTime,
} from "@/services/timer-service";

export default function Timer({ initialScramble }: { initialScramble: string }) {
  const [scramble, setScramble] = useState(initialScramble);
  const [scrambleError, setScrambleError] = useState<string | null>(null);
  const scrambleDiagramRef = useRef<HTMLDivElement>(null);
  const generateNextScramble = useCallback(async () => {
    try {
      const response = await fetch("/api/scramble");
      if (!response.ok) {
        throw new Error(`Scramble request failed with status ${response.status}`);
      }

      const result: { scramble: string } = await response.json();
      setScramble(result.scramble);
      setScrambleError(null);
      return true;
    } catch (error) {
      console.error("Unable to request scramble:", error);
      setScrambleError("Could not generate scramble. Try again.");
      return false;
    }
  }, []);
  const { elapsed, handleButtonClick, timerState } = useTimer(generateNextScramble);

  useEffect(() => {
    const container = scrambleDiagramRef.current;
    if (!container) return;

    let active = true;
    container.replaceChildren();
    setScrambleError(null);

    drawScramble(scramble)
      .then((player) => {
        if (active) {
          container.replaceChildren(player);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Unable to draw scramble diagram:", error);
          setScrambleError("Scramble diagram unavailable.");
        }
      });

    return () => {
      active = false;
    };
  }, [scramble]);

  return (
    <main>
      <section className="timer-stage">
        <div className="scramble-display" aria-live="polite">
          {scramble}
        </div>

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

          <span>{getTimerHint(timerState)}</span>

        <div
          ref={scrambleDiagramRef}
          className="scramble-diagram"
          aria-label="Scrambled cube diagram"
        />
        {scrambleError ? (
          <p className="scramble-error" role="status">
            {scrambleError}
          </p>
        ) : null}
        </button>
      </section>
    </main>
  );
}
