"use client";
import { useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { quickAdd } from "@/app/actions";
export function QuickAdd({ id }: { id: number }) {
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="quick-add">
      <button
        className="button outline small"
        disabled={pending || added}
        onClick={() =>
          start(async () => {
            setError("");
            try {
              await quickAdd(id);
              setAdded(true);
            } catch {
              setError("Could not save. Try again.");
            }
          })
        }
      >
        {added ? <Check size={14} /> : <Plus size={14} />}{" "}
        {pending ? "Saving…" : added ? "In your library" : "Plan to watch"}
      </button>
      <span role="status">{error}</span>
    </div>
  );
}
