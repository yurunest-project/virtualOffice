import { useEffect } from "react";
import {
  usePomodoroStore,
  formatTime,
  PomodoroPhase,
} from "../store/pomodoroStore";

const phaseLabels: Record<PomodoroPhase, string> = {
  work: "作業中",
  break: "休憩中",
  idle: "待機中",
};

export function PomodoroPanel({ embedded = false }: { embedded?: boolean }) {
  const {
    phase,
    remainingSeconds,
    workMinutes,
    breakMinutes,
    isRunning,
    completedSessions,
    start,
    pause,
    reset,
    tick,
  } = usePomodoroStore();

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  const content = (
    <>
      <h3>ポモドーロ</h3>
      <div className="pomodoro-timer">{formatTime(remainingSeconds)}</div>
      <div className="pomodoro-phase">{phaseLabels[phase]}</div>
      <div className="pomodoro-meta">
        {workMinutes}分 / {breakMinutes}分 · 完了 {completedSessions}
      </div>
      <div className="panel-actions">
        {isRunning ? (
          <button type="button" onClick={pause}>
            一時停止
          </button>
        ) : (
          <button type="button" onClick={start}>
            開始
          </button>
        )}
        <button type="button" className="secondary" onClick={reset}>
          リセット
        </button>
      </div>
    </>
  );

  if (embedded) {
    return <div className="pomodoro-panel">{content}</div>;
  }

  return (
    <div className="panel pomodoro-panel">
      {content}
    </div>
  );
}
