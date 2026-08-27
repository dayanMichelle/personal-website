import { Mark, mergeAttributes } from "@tiptap/core";
import Blockquote from "@tiptap/extension-blockquote";
import {
  CALLOUTS,
  HIGHLIGHT_CLASS,
  TEXT_COLOR_CLASS,
  type CalloutName,
  type HighlightName,
  type TextColorName,
} from "./editor-palette";

const names = <T extends { name: string }>(list: readonly T[]) => list.map((c) => c.name);

/** Color de texto como clase (`<span class="c-warn">`), no como estilo en línea. */
export const TextColor = Mark.create({
  name: "textColor",

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) =>
          element.className.match(new RegExp(`${TEXT_COLOR_CLASS}([a-z]+)`))?.[1] ?? null,
        renderHTML: (attributes) =>
          attributes.color ? { class: `${TEXT_COLOR_CLASS}${attributes.color}` } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: `span[class^="${TEXT_COLOR_CLASS}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setTextColor:
        (color: TextColorName) =>
        ({ commands }) =>
          commands.setMark(this.name, { color }),
      unsetTextColor:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

/** Rotulador, también por clase, para que respete el tema del sitio. */
export const Highlight = Mark.create({
  name: "highlight",

  addAttributes() {
    return {
      tone: {
        default: null,
        parseHTML: (element) =>
          element.className.match(new RegExp(`${HIGHLIGHT_CLASS}([a-z]+)`))?.[1] ?? null,
        renderHTML: (attributes) =>
          attributes.tone ? { class: `${HIGHLIGHT_CLASS}${attributes.tone}` } : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "mark" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mark", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      toggleHighlight:
        (tone: HighlightName) =>
        ({ commands }) =>
          commands.toggleMark(this.name, { tone }),
    };
  },
});

/**
 * Los callouts son una cita con un tipo: así reutilizamos el nodo blockquote
 * y en el Markdown salen como `> [!NOTE]`, que GitHub también entiende.
 */
export const Callout = Blockquote.extend({
  addAttributes() {
    return {
      callout: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-callout"),
        renderHTML: (attributes) =>
          attributes.callout ? { "data-callout": attributes.callout } : {},
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setCallout:
        (callout: CalloutName | null) =>
        ({ chain, editor }) => {
          const inQuote = editor.isActive("blockquote");
          const base = inQuote ? chain() : chain().toggleBlockquote();
          return base.updateAttributes("blockquote", { callout }).run();
        },
    };
  },
});

export const CALLOUT_NAMES = names(CALLOUTS);

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textColor: {
      setTextColor: (color: TextColorName) => ReturnType;
      unsetTextColor: () => ReturnType;
    };
    highlightMark: {
      toggleHighlight: (tone: HighlightName) => ReturnType;
    };
    calloutBlock: {
      setCallout: (callout: CalloutName | null) => ReturnType;
    };
  }
}
