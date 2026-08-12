import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getPopoutRoot } from "../services/panelPopoutService";

interface PanelPopoutProps {
  children: ReactNode;
  onClose: () => void;
}

export function PanelPopout({ children, onClose }: PanelPopoutProps) {
  const root = getPopoutRoot();

  useEffect(() => {
    if (!root) {
      onClose();
    }
  }, [root, onClose]);

  if (!root) return null;

  return createPortal(
    <div className="panels-container panels-popout" style={{ position: "static" }}>
      {children}
    </div>,
    root,
  );
}
