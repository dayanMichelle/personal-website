import type { PostInput } from "@/lib/content-write";

/** Normaliza lo que manda el editor. `markdown` lo añade cada ruta tras convertir el HTML. */
export function readBody(body: Record<string, unknown>): Omit<PostInput, "markdown"> {
  return {
    title: String(body.title ?? "").trim(),
    excerpt: String(body.excerpt ?? "").trim(),
    category: String(body.category ?? "Article"),
    coverImage: body.coverImage ? String(body.coverImage) : null,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    seriesTitle: body.seriesTitle ? String(body.seriesTitle).trim() : null,
    seriesOrder: typeof body.seriesOrder === "number" ? body.seriesOrder : null,
    featured: Boolean(body.featured),
    published: Boolean(body.published),
  };
}
