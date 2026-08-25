"use client";

import { useRef, useState } from "react";
import { ACCEPT_IMAGES, uploadImage } from "@/lib/upload-client";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export function ImagePicker({ value, onChange }: Props) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    const result = await uploadImage(file);
    setUploading(false);

    if ("error" in result) setError(result.error);
    else onChange(result.url);
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="overflow-hidden rounded-lg border border-ink-line">
          {/* Imagen local ya subida: <img> evita configurar next/image para esto. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="aspect-[16/10] w-full object-cover" />
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="flex-1 rounded-lg border border-ink-line px-3 py-2 text-sm text-fg-muted transition hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {uploading ? "Subiendo…" : value ? "Cambiar imagen" : "Subir imagen"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg px-3 py-2 text-sm text-fg-muted transition hover:text-red-400"
          >
            Quitar
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      <input
        ref={fileInput}
        type="file"
        accept={ACCEPT_IMAGES}
        hidden
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
