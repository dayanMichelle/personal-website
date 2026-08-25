"use client";

import { useState } from "react";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
};

export function TagInput({ value, onChange, suggestions = [] }: Props) {
  const [draft, setDraft] = useState("");

  /** Añade uno o varios nombres, ignorando duplicados. */
  const add = (raw: string) => {
    const names = raw
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    const next = [...value];
    for (const name of names) {
      // Comparación laxa para no acabar con "OAuth" y "oauth" como tags distintos.
      if (!next.some((t) => t.toLowerCase() === name.toLowerCase())) next.push(name);
    }
    onChange(next);
    setDraft("");
  };

  /** Separa por comas al escribir o pegar, sin depender de la tecla pulsada. */
  const onDraftChange = (raw: string) => {
    if (!raw.includes(",")) {
      setDraft(raw);
      return;
    }
    const parts = raw.split(",");
    const trailing = parts.pop() ?? "";
    add(parts.join(","));
    setDraft(trailing);
  };

  const remove = (name: string) => onChange(value.filter((t) => t !== name));

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="rounded-lg border border-ink-line bg-ink-soft px-2 py-2 focus-within:border-accent">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              className="text-accent/60 hover:text-accent"
              aria-label={`Quitar ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          list="tag-suggestions"
          placeholder={value.length === 0 ? "oauth, seguridad…" : ""}
          className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none"
        />
        <datalist id="tag-suggestions">
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
