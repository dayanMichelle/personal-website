import { toHtml } from "hast-util-to-html";
import { marked } from "marked";
import TurndownService from "turndown";
import { TEXT_COLOR_CLASS, calloutByMarker, calloutByName } from "./editor-palette";
import { grammarFor, lowlight } from "./highlight";

/**
 * El editor trabaja en HTML y los archivos guardan Markdown, así que cada
 * guardado y cada carga cruzan esta frontera. Con los nodos de StarterKit
 * (títulos, listas, citas, código, enlaces, imágenes) la ida y vuelta es fiel.
 */
const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "_",
});

// Tiptap emite <pre><code class="language-ts">, y turndown por defecto pierde el lenguaje.
turndown.addRule("fencedCodeWithLanguage", {
  filter: (node) =>
    node.nodeName === "PRE" && node.firstChild?.nodeName === "CODE",
  replacement: (_content, node) => {
    const code = (node as HTMLElement).firstChild as HTMLElement;
    const language = code.className.match(/language-(\S+)/)?.[1] ?? "";
    const body = (code.textContent ?? "").replace(/\n+$/, "");
    return `\n\n\`\`\`${language}\n${body}\n\`\`\`\n\n`;
  },
});

const isListItem = (line?: string) => !!line && /^[ \t]*(?:[-*+]|\d+\.)[ \t]/.test(line);

/**
 * Tiptap envuelve cada <li> en un <p>, y turndown lo traduce a listas "sueltas"
 * con líneas en blanco entre elementos. Sin esto el archivo se ensucia un poco
 * más en cada guardado.
 */
function tidy(markdown: string) {
  // Vacía las líneas que solo tienen espacios, respetando los dos espacios
  // finales que en Markdown significan salto de línea.
  const lines = markdown.replace(/^[ \t]+$/gm, "").split("\n");
  const out: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const betweenItems = isListItem(out[out.length - 1]) && isListItem(lines[i + 1]);
    if (line === "" && betweenItems) continue;
    out.push(line);
  }

  return out.join("\n");
}

// El editor trata las imágenes como bloque, así que en el archivo cada una va
// en su propia línea en vez de pegada a la siguiente.
turndown.addRule("blockImage", {
  filter: "img",
  replacement: (_content, node) => {
    const image = node as HTMLElement;
    const src = image.getAttribute("src");
    if (!src) return "";
    return `\n\n![${image.getAttribute("alt") ?? ""}](${src})\n\n`;
  },
});

// Color y resaltado no existen en Markdown: se conservan como HTML en línea,
// que Markdown admite y el editor vuelve a interpretar al abrir la entrada.
turndown.keep((node) => {
  const element = node as HTMLElement;
  if (element.nodeName === "MARK") return true;
  return (
    element.nodeName === "SPAN" && (element.getAttribute("class") ?? "").startsWith(TEXT_COLOR_CLASS)
  );
});

// Los avisos salen como `> [!NOTE]`, la sintaxis que usa GitHub.
turndown.addRule("callout", {
  filter: (node) => node.nodeName === "BLOCKQUOTE" && node.hasAttribute("data-callout"),
  replacement: (content, node) => {
    const callout = calloutByName((node as HTMLElement).getAttribute("data-callout") ?? "");
    const body = content.trim().replace(/^/gm, "> ");
    if (!callout) return `\n\n${body}\n\n`;
    return `\n\n> [!${callout.marker}]\n${body}\n\n`;
  },
});

turndown.addRule("taskList", {
  filter: (node) => node.nodeName === "UL" && node.getAttribute("data-type") === "taskList",
  replacement: (content) => `\n\n${content.trim()}\n\n`,
});

turndown.addRule("taskItem", {
  filter: (node) => node.nodeName === "LI" && node.getAttribute("data-type") === "taskItem",
  replacement: (content, node) => {
    const checked = (node as HTMLElement).getAttribute("data-checked") === "true";
    const text = content.replace(/\s+/g, " ").trim();
    return `- [${checked ? "x" : " "}] ${text}\n`;
  },
});

export function htmlToMarkdown(html: string) {
  return tidy(
    turndown
      .turndown(html ?? "")
      // turndown rellena el marcador hasta 4 caracteres ("-   Uno"); lo dejamos
      // en "- Uno", que es como se escribe a mano. La sangría se respeta.
      .replace(/^(\s*)([-*+]|\d+\.)\s{2,}/gm, "$1$2 ")
      // turndown escapa todo guion bajo; dentro de una palabra GFM no lo
      // interpreta como énfasis, y `client_id` se lee mucho mejor sin barras.
      .replace(/(\w)\\_(\w)/g, "$1_$2"),
  ).trim();
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

marked.use({
  gfm: true,
  renderer: {
    /** El mismo resaltador que el editor, así el sitio y la edición coinciden. */
    code({ text, lang }) {
      const grammar = grammarFor(lang ?? "");
      if (!grammar) return `<pre><code>${escapeHtml(text)}</code></pre>`;
      const highlighted = toHtml(lowlight.highlight(grammar, text));
      return `<pre><code class="language-${escapeHtml(lang ?? "")}">${highlighted}</code></pre>`;
    },

    /** Reconoce `> [!NOTE]` y lo convierte en un aviso con tipo. */
    blockquote({ tokens }) {
      const body = this.parser.parse(tokens);
      const match = body.match(/^\s*<p>\s*\[!(\w+)\]\s*(?:<br\s*\/?>)?\s*/i);
      const callout = match ? calloutByMarker(match[1]) : null;

      if (!match || !callout) return `<blockquote>${body}</blockquote>`;

      // Quita el marcador y, si el párrafo se queda vacío, también el párrafo.
      const rest = body.slice(match[0].length).replace(/^<\/p>\s*/, "");
      return `<blockquote data-callout="${callout.name}">${rest}</blockquote>`;
    },

    /** Estructura de lista de tareas que entiende Tiptap, en lugar del input suelto de GFM. */
    list(token) {
      if (!token.items.some((item) => item.task)) return false;
      const items = token.items
        .map((item) => {
          const text = this.parser.parseInline(
            item.tokens
              .flatMap((t) => ("tokens" in t && t.tokens ? t.tokens : [t]))
              // marked ya emite su propia casilla; nos quedamos solo con el texto.
              .filter((t) => t.type !== "checkbox"),
          );
          return `<li data-type="taskItem" data-checked="${item.checked ? "true" : "false"}"><label><input type="checkbox" disabled${item.checked ? " checked" : ""}><span></span></label><div><p>${text}</p></div></li>`;
        })
        .join("");
      return `<ul data-type="taskList">${items}</ul>`;
    },
  },
});

export function markdownToHtml(markdown: string) {
  // `marked` es síncrono mientras no se registren extensiones asíncronas.
  return marked.parse(markdown ?? "", { async: false, breaks: false });
}

export function readingTimeFromMarkdown(markdown: string) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>\-[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function excerptFromMarkdown(markdown: string, max = 160) {
  const firstParagraph =
    markdown
      .split("\n\n")
      .map((block) => block.trim())
      .find((block) => block && !block.startsWith("#") && !block.startsWith("```")) ?? "";

  const text = firstParagraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // El color y el resaltado viajan como HTML en línea: fuera del resumen.
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
