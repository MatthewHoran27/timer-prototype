export type TimerState = "ready" | "holding" | "running" | "stopped";

const TIMER_STATE_LABELS: Record<TimerState, string> = {
  ready: "READY",
  holding: "HOLD",
  running: "SOLVING",
  stopped: "STOPPED",
};

const TIMER_ACTION_LABELS: Record<TimerState, string> = {
  ready: "Start timer",
  holding: "Start timer",
  running: "Stop timer",
  stopped: "Reset timer",
};

const TIMER_HINTS: Record<TimerState, string> = {
  ready: "Press Space to Start",
  holding: "Press Space to Start",
  running: "Press Space to Stop",
  stopped: "Press Space to Start",
};

export function formatTime(milliseconds: number) {
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

export function getTimerLabel(timerState: TimerState) {
  return TIMER_STATE_LABELS[timerState];
}

export function getTimerActionLabel(timerState: TimerState) {
  return TIMER_ACTION_LABELS[timerState];
}

export function getTimerHint(timerState: TimerState) {
  return TIMER_HINTS[timerState];
}

export function getTimerButtonClassName(timerState: TimerState) {
  return `timer-button${timerState === "holding" || timerState === "running" ? ` timer-${timerState}` : ""}`;
}

export function shouldShowFormattedTime(timerState: TimerState) {
  return timerState === "running" || timerState === "stopped";
}
