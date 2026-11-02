"use client";
import { useState, useSyncExternalStore } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener("resize", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("resize", cb);
  };
};
const snapshot = () => {
  try {
    const value = localStorage.getItem("sakuga-sidebar");
    return value
      ? value === "collapsed"
      : matchMedia("(max-width:600px)").matches;
  } catch {
    return false;
  }
};
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, snapshot, () => false);
  const [override, setOverride] = useState<boolean | null>(null);
  const collapsed = override ?? stored;
  return (
    <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <button
        className="sidebar-toggle icon-control"
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        aria-controls="workspace-sidebar"
        onClick={() => {
          setOverride(!collapsed);
          try {
            localStorage.setItem(
              "sakuga-sidebar",
              collapsed ? "expanded" : "collapsed",
            );
          } catch {}
        }}
      >
        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
      </button>
      {children}
    </div>
  );
}
