/** Compartido entre cliente y servidor: ambos validan antes de subir nada. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

// SVG queda fuera a propósito: se sirve desde tu propio dominio y puede llevar
// scripts dentro. Para diagramas, exporta a PNG o WebP.
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function extensionFor(type: string) {
  return EXTENSIONS[type] ?? null;
}

export function isAllowedImage(type: string) {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

export function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

/** Mensaje único para los dos lados, así el usuario ve siempre lo mismo. */
export function validateImage(file: { type: string; size: number }) {
  if (!isAllowedImage(file.type)) {
    return "Formato no admitido. Usa PNG, JPG, WebP, GIF o AVIF.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `La imagen pesa ${formatBytes(file.size)}; el máximo son ${formatBytes(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
}
