import { createRoot } from "react-dom/client";
import App from "./App";

try {
  const raw = localStorage.getItem("virtual-office-settings");
  const parsed = raw ? (JSON.parse(raw) as { state?: { colorMode?: string } }) : null;
  const mode = parsed?.state?.colorMode === "cool" ? "cool" : "warm";
  document.documentElement.dataset.colorMode = mode;
} catch {
  document.documentElement.dataset.colorMode = "warm";
}

createRoot(document.getElementById("root")!).render(<App />);

