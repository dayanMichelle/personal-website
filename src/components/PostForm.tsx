"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Editor } from "@/components/Editor";
import { ImagePicker } from "@/components/ImagePicker";
import { TagInput } from "@/components/TagInput";
import { CATEGORIES } from "@/lib/categories";

export type PostFormValues = {
  slug?: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  contentHtml: string;
  featured: boolean;
  published: boolean;
  tags: string[];
  seriesTitle: string;
  seriesOrder: string;
};

const EMPTY: PostFormValues = {
  title: "",
  excerpt: "",
  category: "Article",
  coverImage: "",
  contentHtml: "",
  featured: false,
  published: false,
  tags: [],
  seriesTitle: "",
  seriesOrder: "",
};

export function PostForm({
  initial: given = EMPTY,
  allTags = [],
  allSeries = [],
}: {
  initial?: PostFormValues;
  allTags?: string[];
  allSeries?: string[];
}) {
  const router = useRouter();
  // Fusionar con EMPTY tolera un `initial` sin los campos más nuevos.
  const initial = { ...EMPTY, ...given };
  const [values, setValues] = useState(initial);
  const [contentJson, setContentJson] = useState<unknown>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function save(published: boolean) {
    setSaving(true);
    setError(null);
    const res = await fetch(values.slug ? `/api/posts/${values.slug}` : "/api/posts", {
      method: values.slug ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        published,
        contentJson,
        seriesOrder: values.seriesOrder ? Number(values.seriesOrder) : null,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function remove() {
    if (!values.slug || !window.confirm("¿Eliminar esta entrada definitivamente?")) return;
    await fetch(`/api/posts/${values.slug}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <input
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Título de la entrada"
          className="w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-ink-line"
        />
        <Editor
          initialContent={initial.contentHtml}
          onChange={({ html, json }) => {
            set("contentHtml", html);
            setContentJson(json);
          }}
        />
      </div>

      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <Field label="Categoría">
          <select
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Resumen" hint="Si lo dejas vacío se genera del contenido.">
          <textarea
            value={values.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={3}
            className="input resize-none"
          />
        </Field>

        <Field label="Tags" hint="Enter o coma para añadir cada uno.">
          <TagInput
            value={values.tags}
            onChange={(tags) => set("tags", tags)}
            suggestions={allTags}
          />
        </Field>

        <div className="space-y-3 rounded-lg border border-ink-line p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
            Curso (opcional)
          </p>
          <input
            value={values.seriesTitle}
            onChange={(e) => set("seriesTitle", e.target.value)}
            list="series-suggestions"
            placeholder="OAuth 2.0"
            className="input"
          />
          <datalist id="series-suggestions">
            {allSeries.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <input
            value={values.seriesOrder}
            onChange={(e) => set("seriesOrder", e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            placeholder="Nº de clase"
            className="input"
            disabled={!values.seriesTitle.trim()}
          />
          <p className="text-xs text-fg-muted/70">
            Escribe el nombre del curso y esta entrada será una de sus clases. Si dejas el
            número vacío, se añade al final.
          </p>
        </div>

        <Field label="Imagen de portada">
          <ImagePicker value={values.coverImage} onChange={(url) => set("coverImage", url)} />
        </Field>

        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          Destacar en la portada
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => save(true)}
            disabled={saving || !values.title.trim()}
            className="rounded-lg bg-accent px-4 py-2.5 font-medium text-ink transition hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Guardando…" : "Publicar"}
          </button>
          <button
            onClick={() => save(false)}
            disabled={saving || !values.title.trim()}
            className="rounded-lg border border-ink-line px-4 py-2.5 text-sm text-fg-muted transition hover:text-fg disabled:opacity-40"
          >
            Guardar como borrador
          </button>
          {values.slug ? (
            <button
              onClick={remove}
              className="rounded-lg px-4 py-2 text-sm text-red-400/80 hover:text-red-400"
            >
              Eliminar entrada
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-fg-muted">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-fg-muted/70">{hint}</span> : null}
    </label>
  );
}
