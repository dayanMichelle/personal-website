"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  initialContent?: string;
  onChange: (value: { html: string; json: unknown }) => void;
};

export function Editor({ initialContent = "", onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false, // evita desajuste de hidratación en SSR
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Escribe tu entrada…" }),
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: "prose-post focus:outline-none" },
    },
    // onCreate publica el estado inicial: así al editar sin tocar nada
    // se vuelve a guardar el contenido real y no un documento vacío.
    onCreate: ({ editor }) => onChange({ html: editor.getHTML(), json: editor.getJSON() }),
    onUpdate: ({ editor }) => onChange({ html: editor.getHTML(), json: editor.getJSON() }),
  });

  if (!editor) return <div className="h-96 animate-pulse rounded-xl bg-ink-soft" />;

  return (
    <div className="rounded-xl border border-ink-line bg-ink-soft">
      <Toolbar editor={editor} />
      <div className="px-5 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: TiptapEditor }) {
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

  const promptImage = () => {
    const url = window.prompt("URL de la imagen", "https://");
    if (url) editor.chain().focus().setImage({ src: url }).run();
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
        on={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ❝
      </Btn>
      <Btn
        on={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        {"</>"}
      </Btn>
      <Sep />
      <Btn on={editor.isActive("link")} onClick={promptLink}>
        Enlace
      </Btn>
      <Btn onClick={promptImage}>Imagen</Btn>
      <Sep />
      <Btn onClick={() => editor.chain().focus().undo().run()}>↺</Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()}>↻</Btn>
    </div>
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
