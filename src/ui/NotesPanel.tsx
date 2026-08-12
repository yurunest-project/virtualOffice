import { useCallback, useEffect, useRef, useState } from "react";
import { todayKey, useTimeLogStore } from "../store/timeLogStore";
import { fetchDailyNote, saveDailyNote } from "../services/dbService";

interface NotesPanelProps {
  embedded?: boolean;
}

export function NotesPanel({ embedded = false }: NotesPanelProps) {
  const tickCount = useTimeLogStore((s) => s.tickCount);
  const noteDate = todayKey();
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadNote = useCallback(async () => {
    try {
      const note = await fetchDailyNote(noteDate);
      setContent(note?.content ?? "");
      setSaved(true);
    } catch (error) {
      console.warn("Failed to load note:", error);
    }
  }, [noteDate]);

  useEffect(() => {
    loadNote();
  }, [loadNote, tickCount]);

  function handleChange(value: string) {
    setContent(value);
    setSaved(false);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveDailyNote(value, noteDate);
        setSaved(true);
      } catch (error) {
        console.warn("Failed to save note:", error);
      }
    }, 800);
  }

  const contentBlock = (
    <>
      <div className="panel-header-row">
        <h3>メモ</h3>
        <span className="save-indicator">
          {saved ? "保存済み" : "保存中..."}
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="メモを入力..."
        rows={6}
      />
    </>
  );

  if (embedded) {
    return <div className="notes-panel">{contentBlock}</div>;
  }

  return (
    <div className="panel notes-panel">
      {contentBlock}
    </div>
  );
}
