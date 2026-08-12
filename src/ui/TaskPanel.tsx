import { useCallback, useEffect, useState } from "react";
import { useRoomStateStore } from "../store/roomStateStore";
import {
  Task,
  addTask,
  deleteTask,
  fetchAllTasks,
  toggleTask,
} from "../services/dbService";

interface TaskPanelProps {
  embedded?: boolean;
}

export function TaskPanel({ embedded = false }: TaskPanelProps) {
  const currentRoom = useRoomStateStore((s) => s.currentRoom);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllTasks();
      setTasks(data);
    } catch (error) {
      console.warn("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    try {
      await addTask(currentRoom, title);
      setNewTitle("");
      await loadTasks();
    } catch (error) {
      console.warn("Failed to add task:", error);
    }
  }

  async function handleToggle(task: Task) {
    try {
      await toggleTask(task.id, !task.completed);
      await loadTasks();
    } catch (error) {
      console.warn("Failed to toggle task:", error);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (error) {
      console.warn("Failed to delete task:", error);
    }
  }

  const content = (
    <>
      <h3>タスク</h3>
      <form className="task-form" onSubmit={handleAdd}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しいタスク..."
        />
        <button type="submit">追加</button>
      </form>
      {loading ? (
        <p className="muted">読み込み中...</p>
      ) : tasks.length === 0 ? (
        <p className="muted">タスクがありません</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? "completed" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task)}
                />
                <span>{task.title}</span>
              </label>
              <button
                type="button"
                className="icon-btn"
                onClick={() => handleDelete(task.id)}
                aria-label="削除"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (embedded) {
    return <div className="task-panel">{content}</div>;
  }

  return (
    <div className="panel task-panel">
      {content}
    </div>
  );
}
