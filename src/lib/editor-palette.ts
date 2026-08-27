/**
 * Paleta cerrada y con nombre en vez de selector de color libre: el color lo
 * decide el CSS, así siempre encaja con el diseño y nada queda ilegible.
 * Compartida por el editor, el CSS y el conversor a Markdown.
 */
export const TEXT_COLORS = [
  { name: "accent", label: "Acento" },
  { name: "warn", label: "Aviso" },
  { name: "ok", label: "Correcto" },
  { name: "muted", label: "Atenuado" },
] as const;

export const HIGHLIGHTS = [
  { name: "accent", label: "Acento" },
  { name: "warn", label: "Aviso" },
  { name: "ok", label: "Correcto" },
] as const;

export type TextColorName = (typeof TEXT_COLORS)[number]["name"];
export type HighlightName = (typeof HIGHLIGHTS)[number]["name"];

export const TEXT_COLOR_CLASS = "c-";
export const HIGHLIGHT_CLASS = "h-";

/** Tipos de callout, con el marcador de GitHub que se usa en el Markdown. */
export const CALLOUTS = [
  { name: "note", label: "Nota", marker: "NOTE" },
  { name: "tip", label: "Consejo", marker: "TIP" },
  { name: "warning", label: "Cuidado", marker: "WARNING" },
  { name: "danger", label: "Peligro", marker: "CAUTION" },
] as const;

export type CalloutName = (typeof CALLOUTS)[number]["name"];

export const calloutByMarker = (marker: string) =>
  CALLOUTS.find((c) => c.marker === marker.toUpperCase()) ?? null;

export const calloutByName = (name: string) =>
  CALLOUTS.find((c) => c.name === name) ?? null;
