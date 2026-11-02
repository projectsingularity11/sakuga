"use client";
import { useId } from "react";
import { useRouter } from "next/navigation";
import type { Anime } from "@/lib/domain";
import { resolveTitle } from "@/lib/metadata";
export function SeasonPicker({
  members,
  showId,
  selected,
  workspace = false,
  language = "english",
}: {
  members: Anime[];
  showId: number;
  selected: number;
  workspace?: boolean;
  language?: string;
}) {
  const router = useRouter(),
    id = useId();
  if (members.length < 2) return null;
  return (
    <div className="season-picker">
      <label htmlFor={id}>Season / part</label>
      <select
        id={id}
        value={selected}
        onChange={(e) =>
          router.push(
            `${workspace ? "/app" : ""}/anime/${showId}?season=${e.target.value}`,
          )
        }
      >
        {members.map((a) => (
          <option key={a.id} value={a.id}>
            {resolveTitle(a, language)}
            {a.year ? ` · ${a.year}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
