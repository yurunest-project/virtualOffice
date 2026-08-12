import { useEffect, useRef, useState, type RefObject } from "react";
import { useSettingsStore } from "../store/settingsStore";
import { updatePanelHitbox } from "../clickthrough/hitbox";
import { PomodoroPanel } from "./PomodoroPanel";
import { TaskPanel } from "./TaskPanel";
import { NotesPanel } from "./NotesPanel";

interface WorkspacePanelProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  onDragEnd?: () => void;
}

interface DragState {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

function clampPosition(x: number, y: number) {
  const margin = 8;
  const minVisible = 48;
  const maxX = window.innerWidth - minVisible;
  const maxY = window.innerHeight - minVisible;
  return {
    x: Math.min(Math.max(margin, x), Math.max(margin, maxX)),
    y: Math.min(Math.max(margin, y), Math.max(margin, maxY)),
  };
}

export function WorkspacePanel({ containerRef, onDragEnd }: WorkspacePanelProps) {
  const panelsPosition = useSettingsStore((s) => s.panelsPosition);
  const setPanelsPosition = useSettingsStore((s) => s.setPanelsPosition);
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const dragRef = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    function onResize() {
      const pos = useSettingsStore.getState().panelsPosition;
      if (!pos || !containerRef?.current) return;
      const clamped = clampPosition(pos.x, pos.y);
      if (clamped.x !== pos.x || clamped.y !== pos.y) {
        setPanelsPosition(clamped);
      }
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setPanelsPosition, containerRef]);

  function startDrag(e: React.MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const container = containerRef?.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const originX = panelsPosition?.x ?? rect.left;
    const originY = panelsPosition?.y ?? rect.top;

    if (!panelsPosition) {
      setPanelsPosition({ x: originX, y: originY });
    }

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX,
      originY,
      moved: false,
    };
    setDragging(true);

    const onMove = (ev: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = ev.clientX - drag.startX;
      const dy = ev.clientY - drag.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        drag.moved = true;
      }

      const next = clampPosition(drag.originX + dx, drag.originY + dy);
      setPanelsPosition(next);
      if (containerRef?.current) {
        updatePanelHitbox("panels", containerRef.current);
      }
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);

      if (dragRef.current?.moved) {
        onDragEndRef.current?.();
      }
      dragRef.current = null;
      setDragging(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function stopPanelClickBubble(e: React.MouseEvent) {
    e.stopPropagation();
  }

  const positionStyle = panelsPosition
    ? {
        left: panelsPosition.x,
        top: panelsPosition.y,
        right: "auto" as const,
        bottom: "auto" as const,
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      className={`panels-container${dragging ? " panels-container-dragging" : ""}`}
      style={positionStyle}
      onClick={stopPanelClickBubble}
    >
      <div
        className="panels-drag-handle"
        onMouseDown={startDrag}
        title="ドラッグで移動"
      >
        <span className="panels-drag-label">パネル</span>
        <span className="panels-drag-icon" aria-hidden="true">
          ⠿
        </span>
      </div>
      <PomodoroPanel />
      <TaskPanel />
      <NotesPanel />
    </div>
  );
}
