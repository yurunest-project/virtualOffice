import { useCallback, useEffect, useState } from "react";
import {
  todayKey,
  useTimeLogStore,
  formatDuration,
} from "../store/timeLogStore";
import { ROOMS, RoomId } from "../store/roomStore";
import { fetchCompletedTasksForDate, Task } from "../services/dbService";

const TRACKED_ROOMS: RoomId[] = ["work", "study", "break"];

export function DailyStatsPanel() {
  const tickCount = useTimeLogStore((s) => s.tickCount);
  const getLogForDate = useTimeLogStore((s) => s.getLogForDate);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  void tickCount;

  const today = todayKey();
  const todayLog = getLogForDate(today);

  const loadCompleted = useCallback(async () => {
    try {
      const tasks = await fetchCompletedTasksForDate(today);
      setCompletedTasks(tasks);
    } catch (error) {
      console.warn("Failed to load completed tasks:", error);
    }
  }, [today]);

  useEffect(() => {
    loadCompleted();
  }, [loadCompleted, tickCount]);

  return (
    <div className="daily-stats-panel">
      <div className="daily-stats-section daily-stats-section-log">
        <div className="daily-stats-header">今日の滞在記録</div>
        <div className="daily-stats-row">
          <span className="daily-stats-values">
            {TRACKED_ROOMS.map((room, index) => (
              <span key={room}>
                {index > 0 && " · "}
                {ROOMS[room].label} {formatDuration(todayLog[room])}
              </span>
            ))}
          </span>
        </div>
      </div>

      <div className="daily-stats-section daily-stats-section-tasks">
        <div className="daily-stats-header">今日の達成タスク</div>
        {completedTasks.length === 0 ? (
          <p className="muted daily-stats-empty">まだ達成したタスクはありません</p>
        ) : (
          <ul className="daily-stats-tasks">
            {completedTasks.map((task) => (
              <li key={task.id}>
                <span className="daily-stats-task-room">
                  {ROOMS[task.room as keyof typeof ROOMS]?.label ?? task.room}
                </span>
                <span className="daily-stats-task-title">{task.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
