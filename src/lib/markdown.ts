import { marked } from "marked";
import TurndownService from "turndown";

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

export function htmlToMarkdown(html: string) {
  return tidy(
    turndown
      .turndown(html ?? "")
      // turndown rellena el marcador hasta 4 caracteres ("-   Uno"); lo dejamos
      // en "- Uno", que es como se escribe a mano. La sangría se respeta.
      .replace(/^(\s*)([-*+]|\d+\.)\s{2,}/gm, "$1$2 "),
  ).trim();
}

export function markdownToHtml(markdown: string) {
  // `marked` es síncrono mientras no se registren extensiones asíncronas.
  return marked.parse(markdown ?? "", { async: false, gfm: true, breaks: false });
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
    .replace(/[*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
