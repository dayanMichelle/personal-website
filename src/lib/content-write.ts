import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { getAllPosts, getPost, POSTS_DIR, type Post } from "./content";
import { excerptFromMarkdown } from "./markdown";
import { toSlug } from "./slug";

export type PostInput = {
  title: string;
  markdown: string;
  excerpt?: string;
  category?: string;
  coverImage?: string | null;
  tags?: string[];
  seriesTitle?: string | null;
  seriesOrder?: number | null;
  featured?: boolean;
  published?: boolean;
};

/** Genera un slug libre, añadiendo -2, -3… si el archivo ya existe. */
async function uniqueSlug(title: string, ignoreSlug?: string) {
  const base = toSlug(title);
  const taken = new Set((await getAllPosts()).map((p) => p.slug));
  if (ignoreSlug) taken.delete(ignoreSlug);

  let candidate = base;
  let n = 1;
  while (taken.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

/**
 * Si otra clase del mismo curso ya ocupa ese número, se la empuja al final.
 * Mantiene la promesa de que elegir un número nunca falla.
 */
async function freeSeriesSlot(seriesTitle: string | null, order: number | null, exceptSlug?: string) {
  if (!seriesTitle || !order) return;
  const seriesSlug = toSlug(seriesTitle);
  const posts = await getAllPosts();
  const clash = posts.find(
    (p) => p.seriesSlug === seriesSlug && p.seriesOrder === order && p.slug !== exceptSlug,
  );
  if (!clash) return;

  const last = posts
    .filter((p) => p.seriesSlug === seriesSlug)
    .reduce((max, p) => Math.max(max, p.seriesOrder ?? 0), 0);
  await writeFile(clash.slug, { ...toInput(clash), seriesOrder: last + 1 });
}

/** Número de clase por defecto: la siguiente libre al final del curso. */
async function nextSeriesOrder(seriesTitle: string) {
  const seriesSlug = toSlug(seriesTitle);
  const posts = await getAllPosts();
  const last = posts
    .filter((p) => p.seriesSlug === seriesSlug)
    .reduce((max, p) => Math.max(max, p.seriesOrder ?? 0), 0);
  return last + 1;
}

function toInput(post: Post): PostInput {
  return {
    title: post.title,
    markdown: post.markdown,
    excerpt: post.excerpt,
    category: post.category,
    coverImage: post.coverImage,
    tags: post.tags,
    seriesTitle: post.seriesTitle,
    seriesOrder: post.seriesOrder,
    featured: post.featured,
    published: post.published,
  };
}

/** Escribe el archivo. El frontmatter omite lo vacío para que el .md se lea a gusto a mano. */
async function writeFile(slug: string, input: PostInput, publishedAt?: Date | null) {
  const markdown = input.markdown ?? "";
  const seriesTitle = input.seriesTitle?.trim() || null;

  const data: Record<string, unknown> = {
    title: input.title,
    excerpt: input.excerpt?.trim() || excerptFromMarkdown(markdown),
    category: input.category ?? "Article",
    published: input.published ?? false,
  };

  if (publishedAt) data.publishedAt = publishedAt.toISOString();
  if (input.coverImage) data.coverImage = input.coverImage;
  if (input.tags && input.tags.length > 0) data.tags = input.tags;
  if (seriesTitle) {
    data.series = seriesTitle;
    data.seriesOrder = input.seriesOrder ?? (await nextSeriesOrder(seriesTitle));
  }
  if (input.featured) data.featured = true;

  await fs.mkdir(POSTS_DIR, { recursive: true });
  await fs.writeFile(
    path.join(POSTS_DIR, `${slug}.md`),
    matter.stringify(`\n${markdown}\n`, data),
    "utf8",
  );
}

export async function createPost(input: PostInput) {
  const slug = await uniqueSlug(input.title);
  await freeSeriesSlot(input.seriesTitle ?? null, input.seriesOrder ?? null);
  await writeFile(slug, input, input.published ? new Date() : null);
  return slug;
}

export async function updatePost(slug: string, input: PostInput) {
  const current = await getPost(slug);
  if (!current) return null;

  // El slug (y con él la URL) solo cambia si cambió el título.
  const nextSlug =
    input.title === current.title ? slug : await uniqueSlug(input.title, slug);

  await freeSeriesSlot(input.seriesTitle ?? null, input.seriesOrder ?? null, slug);

  const publishedAt = input.published ? (current.publishedAt ?? new Date()) : null;
  await writeFile(nextSlug, input, publishedAt);

  if (nextSlug !== slug) await deletePost(slug);
  return nextSlug;
}

export async function deletePost(slug: string) {
  await fs.rm(path.join(POSTS_DIR, `${slug}.md`), { force: true });
}
