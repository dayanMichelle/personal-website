"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorContent, useEditor, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useRef, useState } from "react";
import { Callout, Highlight, TextColor } from "@/lib/editor-extensions";
import { CALLOUTS, HIGHLIGHTS, TEXT_COLORS } from "@/lib/editor-palette";
import { CODE_LANGUAGES, lowlight } from "@/lib/highlight";
import { ACCEPT_IMAGES, uploadImage } from "@/lib/upload-client";
import { isAllowedImage } from "@/lib/uploads";

type Props = {
  initialContent?: string;
  onChange: (value: { html: string; json: unknown }) => void;
};

export function Editor({ initialContent = "", onChange }: Props) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Los handlers de ProseMirror se definen antes de que exista el editor,
  // así que lo alcanzan por referencia.
  const editorRef = useRef<TiptapEditor | null>(null);

  /** Sube y coloca las imágenes en el punto del cursor, una detrás de otra. */
  const insertImages = useCallback(
    async (editorInstance: TiptapEditor, files: File[]) => {
      if (files.length === 0) return;
      setError(null);
      setUploading((n) => n + files.length);

      for (const file of files) {
        const result = await uploadImage(file);
        if ("error" in result) setError(result.error);
        else editorInstance.chain().focus().setImage({ src: result.url }).run();
        setUploading((n) => n - 1);
      }
    },
    [],
  );

  const editor = useEditor({
    immediatelyRender: false, // evita desajuste de hidratación en SSR
    extensions: [
      // blockquote y codeBlock se sustituyen por las versiones con callout y
      // con resaltado de sintaxis.
      StarterKit.configure({ link: false, blockquote: false, codeBlock: false }),
      Callout,
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "ts" }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextColor,
      Highlight,
      Placeholder.configure({ placeholder: "Escribe tu entrada…" }),
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: "prose-post focus:outline-none" },
      // Pegar o arrastrar una imagen la sube; el resto del pegado sigue igual.
      handlePaste: (_view, event) => {
        const files = imageFilesFrom(event.clipboardData);
        if (files.length === 0 || !editorRef.current) return false;
        event.preventDefault();
        void insertImages(editorRef.current, files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = imageFilesFrom((event as DragEvent).dataTransfer);
        if (files.length === 0 || !editorRef.current) return false;
        event.preventDefault();
        void insertImages(editorRef.current, files);
        return true;
      },
    },
    // onCreate publica el estado inicial: así al editar sin tocar nada
    // se vuelve a guardar el contenido real y no un documento vacío.
    onCreate: ({ editor }) => {
      editorRef.current = editor;
      onChange({ html: editor.getHTML(), json: editor.getJSON() });
    },
    onUpdate: ({ editor }) => onChange({ html: editor.getHTML(), json: editor.getJSON() }),
  });

  if (!editor) return <div className="h-96 animate-pulse rounded-xl bg-ink-soft" />;

  return (
    <div className="rounded-xl border border-ink-line bg-ink-soft">
      <Toolbar
        editor={editor}
        onPickImages={(files) => void insertImages(editor, files)}
      />
      {uploading > 0 || error ? (
        <p
          className={`border-b border-ink-line px-5 py-2 text-xs ${
            error ? "text-red-400" : "text-fg-muted"
          }`}
        >
          {error ??
            (uploading === 1 ? "Subiendo imagen…" : `Subiendo ${uploading} imágenes…`)}
        </p>
      ) : null}
      <div className="px-5 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

/** Saca solo los archivos de imagen admitidos de un pegado o un arrastre. */
function imageFilesFrom(source: DataTransfer | null) {
  if (!source) return [];
  return [...source.files].filter((file) => isAllowedImage(file.type));
}

function Toolbar({
  editor,
  onPickImages,
}: {
  editor: TiptapEditor;
  onPickImages: (files: File[]) => void;
}) {
  const fileInput = useRef<HTMLInputElement | null>(null);

  const promptLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del enlace", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };



  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink-line px-3 py-2">
      <Btn on={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </Btn>
      <Btn on={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>i</em>
      </Btn>
      <Btn
        on={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <s>S</s>
      </Btn>
      <Sep />
      <Btn
        on={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Btn>
      <Btn
        on={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Btn>
      <Sep />
      <Btn
        on={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • Lista
      </Btn>
      <Btn
        on={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. Lista
      </Btn>
      <Btn
        on={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        ☑ Tareas
      </Btn>
      <Btn
        on={editor.isActive("blockquote", { callout: null })}
        onClick={() => editor.chain().focus().setCallout(null).run()}
      >
        ❝
      </Btn>
      <Picker
        label="Aviso"
        active={CALLOUTS.some((c) => editor.isActive("blockquote", { callout: c.name }))}
        options={CALLOUTS.map((c) => ({ value: c.name, label: c.label }))}
        onSelect={(value) =>
          editor
            .chain()
            .focus()
            .setCallout(value as (typeof CALLOUTS)[number]["name"])
            .run()
        }
      />
      <Btn
        on={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {"</>"}
      </Btn>
      {editor.isActive("codeBlock") ? (
        <select
          value={(editor.getAttributes("codeBlock").language as string) ?? "ts"}
          onChange={(e) =>
            editor.chain().focus().updateAttributes("codeBlock", { language: e.target.value }).run()
          }
          className="rounded-md border border-ink-line bg-ink px-2 py-1 text-xs text-fg-muted"
        >
          {CODE_LANGUAGES.map((language) => (
            <option key={language.id} value={language.id}>
              {language.label}
            </option>
          ))}
        </select>
      ) : null}
      <Sep />
      <Picker
        label="Color"
        active={editor.isActive("textColor")}
        options={[
          ...TEXT_COLORS.map((c) => ({ value: c.name, label: c.label, swatch: `c-${c.name}` })),
          { value: "", label: "Quitar color" },
        ]}
        onSelect={(value) =>
          value
            ? editor
                .chain()
                .focus()
                .setTextColor(value as (typeof TEXT_COLORS)[number]["name"])
                .run()
            : editor.chain().focus().unsetTextColor().run()
        }
      />
      <Picker
        label="Resaltar"
        active={editor.isActive("highlight")}
        options={HIGHLIGHTS.map((h) => ({ value: h.name, label: h.label, swatch: `h-${h.name}` }))}
        onSelect={(value) =>
          editor
            .chain()
            .focus()
            .toggleHighlight(value as (typeof HIGHLIGHTS)[number]["name"])
            .run()
        }
      />
      <Sep />
      <Btn on={editor.isActive("link")} onClick={promptLink}>
        Enlace
      </Btn>
      <Btn onClick={() => fileInput.current?.click()}>Imagen</Btn>
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPT_IMAGES}
        multiple
        hidden
        onChange={(e) => {
          onPickImages([...(e.target.files ?? [])]);
          // Permite volver a elegir el mismo archivo justo después.
          e.target.value = "";
        }}
      />
      <Sep />
      <Btn onClick={() => editor.chain().focus().undo().run()}>↺</Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()}>↻</Btn>
    </div>
  );
}

/** Menú corto: evita llenar la barra de botones para cada color o tipo de aviso. */
function Picker({
  label,
  options,
  onSelect,
  active = false,
}: {
  label: string;
  options: { value: string; label: string; swatch?: string }[];
  onSelect: (value: string) => void;
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className={`rounded-md px-2.5 py-1 text-sm transition ${
          active ? "bg-accent text-ink" : "text-fg-muted hover:bg-ink hover:text-fg"
        }`}
      >
        {label} ▾
      </button>
      {open ? (
        <span className="absolute left-0 top-full z-20 mt-1 flex w-40 flex-col overflow-hidden rounded-lg border border-ink-line bg-ink shadow-lg">
          {options.map((option) => (
            <button
              key={option.value || "none"}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(option.value);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-left text-sm text-fg-muted hover:bg-ink-soft hover:text-fg"
            >
              {option.swatch ? (
                <span className={`size-3 shrink-0 rounded-full swatch-${option.swatch}`} />
              ) : null}
              {option.label}
            </button>
          ))}
        </span>
      ) : null}
    </span>
  );
}

function Btn({
  children,
  onClick,
  on = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  on?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-sm transition ${
        on ? "bg-accent text-ink" : "text-fg-muted hover:bg-ink hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-ink-line" />;
}
