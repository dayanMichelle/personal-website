import { validateImage } from "./uploads";

export type UploadResult = { url: string } | { error: string };

/** Valida antes de enviar para no gastar una subida en algo que el servidor va a rechazar. */
export async function uploadImage(file: File): Promise<UploadResult> {
  const problem = validateImage(file);
  if (problem) return { error: problem };

  const body = new FormData();
  body.append("file", file);

  try {
    const res = await fetch("/api/uploads", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) return { error: data.error ?? "No se pudo subir la imagen" };
    return { url: data.url };
  } catch {
    return { error: "No se pudo subir la imagen" };
  }
}

export const ACCEPT_IMAGES = "image/png,image/jpeg,image/webp,image/gif,image/avif";
