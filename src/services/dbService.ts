import { isTauri } from "@tauri-apps/api/core";
import { todayKey } from "../store/timeLogStore";

export interface Task {
  id: number;
  room: string;
  title: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface Note {
  id: number;
  room: string;
  date: string;
  content: string;
  updated_at: string;
}

const TASKS_KEY = "virtual-office-tasks";
const NOTES_KEY = "virtual-office-notes";

function nowIso(): string {
  return new Date().toISOString();
}

function nowLocalDateTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getCompletionDateKey(task: Task): string | null {
  if (!task.completed) return null;
  const at = task.completed_at ?? task.created_at;
  if (!at) return null;
  const parsed = new Date(at);
  if (!Number.isNaN(parsed.getTime())) {
    return todayKey(parsed);
  }
  return at.slice(0, 10);
}

function readTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Task>[]) : [];
    return parsed.map((task) => ({
      id: task.id ?? 0,
      room: task.room ?? "work",
      title: task.title ?? "",
      completed: Boolean(task.completed),
      created_at: task.created_at ?? nowIso(),
      completed_at: task.completed_at ?? null,
    }));
  } catch {
    return [];
  }
}

function writeTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function readNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Note>[]) : [];
    return parsed.map((note) => ({
      id: note.id ?? 0,
      room: note.room ?? "work",
      date: note.date ?? todayKey(),
      content: note.content ?? "",
      updated_at: note.updated_at ?? nowIso(),
    }));
  } catch {
    return [];
  }
}

function writeNotes(notes: Note[]): void {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

async function getDb() {
  const Database = (await import("@tauri-apps/plugin-sql")).default;
  return Database.load("sqlite:virtual_office.db");
}

export async function fetchAllTasks(): Promise<Task[]> {
  if (!isTauri()) {
    return readTasks().sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.created_at.localeCompare(a.created_at);
    });
  }

  const database = await getDb();
  const rows = await database.select<Task[]>(
    "SELECT id, room, title, completed, created_at, completed_at FROM tasks ORDER BY completed ASC, created_at DESC",
  );
  return rows.map((row) => ({
    ...row,
    completed: Boolean(row.completed),
    completed_at: row.completed_at ?? null,
  }));
}

export async function fetchTasks(room: string): Promise<Task[]> {
  if (!isTauri()) {
    return readTasks()
      .filter((t) => t.room === room)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.created_at.localeCompare(a.created_at);
      });
  }

  const database = await getDb();
  const rows = await database.select<Task[]>(
    "SELECT id, room, title, completed, created_at, completed_at FROM tasks WHERE room = $1 ORDER BY completed ASC, created_at DESC",
    [room],
  );
  return rows.map((row) => ({
    ...row,
    completed: Boolean(row.completed),
    completed_at: row.completed_at ?? null,
  }));
}

export async function fetchCompletedTasksForDate(date: string): Promise<Task[]> {
  if (!isTauri()) {
    return readTasks()
      .filter((t) => getCompletionDateKey(t) === date)
      .sort((a, b) =>
        (b.completed_at ?? b.created_at).localeCompare(a.completed_at ?? a.created_at),
      );
  }

  const database = await getDb();
  const rows = await database.select<Task[]>(
    "SELECT id, room, title, completed, created_at, completed_at FROM tasks WHERE completed = 1 ORDER BY completed_at DESC",
  );
  return rows
    .map((row) => ({
      ...row,
      completed: Boolean(row.completed),
      completed_at: row.completed_at ?? null,
    }))
    .filter((t) => getCompletionDateKey(t) === date);
}

export async function addTask(room: string, title: string): Promise<void> {
  if (!isTauri()) {
    const tasks = readTasks();
    const nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    tasks.push({
      id: nextId,
      room,
      title,
      completed: false,
      created_at: nowIso(),
      completed_at: null,
    });
    writeTasks(tasks);
    return;
  }

  const database = await getDb();
  await database.execute(
    "INSERT INTO tasks (room, title) VALUES ($1, $2)",
    [room, title],
  );
}

export async function toggleTask(id: number, completed: boolean): Promise<void> {
  const completedAt = completed ? nowLocalDateTime() : null;

  if (!isTauri()) {
    writeTasks(
      readTasks().map((t) =>
        t.id === id ? { ...t, completed, completed_at: completedAt } : t,
      ),
    );
    return;
  }

  const database = await getDb();
  await database.execute(
    "UPDATE tasks SET completed = $1, completed_at = $2 WHERE id = $3",
    [completed ? 1 : 0, completedAt, id],
  );
}

export async function deleteTask(id: number): Promise<void> {
  if (!isTauri()) {
    writeTasks(readTasks().filter((t) => t.id !== id));
    return;
  }

  const database = await getDb();
  await database.execute("DELETE FROM tasks WHERE id = $1", [id]);
}

export async function fetchDailyNote(date: string = todayKey()): Promise<Note | null> {
  if (!isTauri()) {
    const notes = readNotes();
    const dated = notes.find((n) => n.date === date);
    if (dated) return dated;

    const legacy = notes.find((n) => n.room === "work" && !n.date);
    if (legacy && date === todayKey()) {
      return { ...legacy, date };
    }
    return null;
  }

  const database = await getDb();
  const rows = await database.select<Note[]>(
    "SELECT id, room, note_date AS date, content, updated_at FROM notes WHERE note_date = $1 ORDER BY updated_at DESC LIMIT 1",
    [date],
  );
  return rows[0] ?? null;
}

export async function saveDailyNote(
  content: string,
  date: string = todayKey(),
): Promise<void> {
  if (!isTauri()) {
    const notes = readNotes();
    const existing = notes.find((n) => n.date === date);
    if (existing) {
      writeNotes(
        notes.map((n) =>
          n.id === existing.id
            ? { ...n, content, updated_at: nowIso(), date, room: "shared" }
            : n,
        ),
      );
      return;
    }

    const nextId = notes.reduce((max, n) => Math.max(max, n.id), 0) + 1;
    writeNotes([
      ...notes,
      {
        id: nextId,
        room: "shared",
        date,
        content,
        updated_at: nowIso(),
      },
    ]);
    return;
  }

  const database = await getDb();
  const existing = await fetchDailyNote(date);
  if (existing) {
    await database.execute(
      "UPDATE notes SET content = $1, updated_at = datetime('now') WHERE id = $2",
      [content, existing.id],
    );
  } else {
    await database.execute(
      "INSERT INTO notes (room, note_date, content) VALUES ($1, $2, $3)",
      ["shared", date, content],
    );
  }
}

export async function fetchNote(
  room: string,
  date: string = todayKey(),
): Promise<Note | null> {
  if (!isTauri()) {
    const notes = readNotes();
    const dated = notes.find((n) => n.room === room && n.date === date);
    if (dated) return dated;

    const legacy = notes.find((n) => n.room === room && !n.date);
    if (legacy && date === todayKey()) {
      return { ...legacy, date };
    }
    return null;
  }

  const database = await getDb();
  const rows = await database.select<Note[]>(
    "SELECT id, room, note_date AS date, content, updated_at FROM notes WHERE room = $1 AND note_date = $2 LIMIT 1",
    [room, date],
  );
  return rows[0] ?? null;
}

export async function saveNote(
  room: string,
  content: string,
  date: string = todayKey(),
): Promise<void> {
  if (!isTauri()) {
    const notes = readNotes();
    const existing = notes.find((n) => n.room === room && n.date === date);
    if (existing) {
      writeNotes(
        notes.map((n) =>
          n.id === existing.id
            ? { ...n, content, updated_at: nowIso(), date }
            : n,
        ),
      );
      return;
    }

    const nextId = notes.reduce((max, n) => Math.max(max, n.id), 0) + 1;
    writeNotes([
      ...notes,
      {
        id: nextId,
        room,
        date,
        content,
        updated_at: nowIso(),
      },
    ]);
    return;
  }

  const database = await getDb();
  const existing = await fetchNote(room, date);
  if (existing) {
    await database.execute(
      "UPDATE notes SET content = $1, updated_at = datetime('now') WHERE id = $2",
      [content, existing.id],
    );
  } else {
    await database.execute(
      "INSERT INTO notes (room, note_date, content) VALUES ($1, $2, $3)",
      [room, date, content],
    );
  }
}
