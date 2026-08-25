import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { excerptFromMarkdown, markdownToHtml, readingTimeFromMarkdown } from "./markdown";
import { toSlug } from "./slug";

export const CONTENT_DIR = path.join(process.cwd(), "content");
export const POSTS_DIR = path.join(CONTENT_DIR, "posts");
export const SERIES_DIR = path.join(CONTENT_DIR, "series");

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string | null;
  tags: string[];
  seriesTitle: string | null;
  seriesSlug: string | null;
  seriesOrder: number | null;
  featured: boolean;
  published: boolean;
  publishedAt: Date | null;
  authorName: string;
  readingTime: number;
  markdown: string;
};

export type Series = {
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  posts: Post[];
};

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const asDate = (value: unknown) => {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

function parsePost(slug: string, raw: string): Post {
  const { data, content } = matter(raw);
  const markdown = content.trim();
  const seriesTitle = asString(data.series) || null;

  return {
    slug,
    title: asString(data.title, slug),
    excerpt: asString(data.excerpt) || excerptFromMarkdown(markdown),
    category: asString(data.category, "Article"),
    coverImage: asString(data.coverImage) || null,
    tags: Array.isArray(data.tags) ? data.tags.map((t) => String(t)) : [],
    seriesTitle,
    seriesSlug: seriesTitle ? toSlug(seriesTitle) : null,
    seriesOrder: typeof data.seriesOrder === "number" ? data.seriesOrder : null,
    featured: data.featured === true,
    published: data.published === true,
    publishedAt: asDate(data.publishedAt),
    authorName: asString(data.author, "Dayan Arango"),
    readingTime: readingTimeFromMarkdown(markdown),
    markdown,
  };
}

/** Lee todas las entradas del disco. Sin caché: en dev queremos ver los cambios al guardar. */
export async function getAllPosts(): Promise<Post[]> {
  let files: string[];
  try {
    files = await fs.readdir(POSTS_DIR);
  } catch {
    return []; // Todavía no hay carpeta de contenido.
  }

  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
        return parsePost(file.replace(/\.md$/, ""), raw);
      }),
  );

  return posts.sort(byNewest);
}

/** Solo lo publicado: es lo que ve cualquiera que no seas tú. */
export async function getPublishedPosts() {
  return (await getAllPosts()).filter((post) => post.published);
}

export async function getPost(slug: string) {
  try {
    const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.md`), "utf8");
    return parsePost(slug, raw);
  } catch {
    return null;
  }
}

export function renderPost(post: Post) {
  return markdownToHtml(post.markdown);
}

function byNewest(a: Post, b: Post) {
  const at = a.publishedAt?.getTime() ?? 0;
  const bt = b.publishedAt?.getTime() ?? 0;
  return bt - at;
}

// ---------- Tags ----------

export type TagSummary = { name: string; slug: string; count: number };

export async function getAllTags(): Promise<TagSummary[]> {
  const posts = await getPublishedPosts();
  const bySlug = new Map<string, TagSummary>();

  for (const post of posts) {
    for (const name of post.tags) {
      const slug = toSlug(name);
      const existing = bySlug.get(slug);
      if (existing) existing.count += 1;
      else bySlug.set(slug, { name, slug, count: 1 });
    }
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getPostsByTag(tagSlug: string) {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.tags.some((name) => toSlug(name) === tagSlug));
}

// ---------- Series (cursos) ----------

/** Metadatos opcionales: content/series/<slug>.md con title/description en el frontmatter. */
async function readSeriesMeta(slug: string) {
  try {
    const raw = await fs.readFile(path.join(SERIES_DIR, `${slug}.md`), "utf8");
    const { data, content } = matter(raw);
    return {
      title: asString(data.title) || null,
      description: asString(data.description) || content.trim(),
      coverImage: asString(data.coverImage) || null,
    };
  } catch {
    return null;
  }
}

/** Los cursos se derivan del frontmatter `series` de las entradas publicadas. */
export async function getAllSeries(): Promise<Series[]> {
  const posts = await getPublishedPosts();
  const bySlug = new Map<string, Series>();

  for (const post of posts) {
    if (!post.seriesSlug || !post.seriesTitle) continue;
    const existing = bySlug.get(post.seriesSlug);
    if (existing) existing.posts.push(post);
    else
      bySlug.set(post.seriesSlug, {
        slug: post.seriesSlug,
        title: post.seriesTitle,
        description: "",
        coverImage: null,
        posts: [post],
      });
  }

  const series = await Promise.all(
    [...bySlug.values()].map(async (item) => {
      const meta = await readSeriesMeta(item.slug);
      return {
        ...item,
        title: meta?.title ?? item.title,
        description: meta?.description ?? "",
        coverImage: meta?.coverImage ?? null,
        posts: item.posts.sort(bySeriesOrder),
      };
    }),
  );

  return series.sort((a, b) => a.title.localeCompare(b.title, "es"));
}

export async function getSeries(slug: string) {
  return (await getAllSeries()).find((series) => series.slug === slug) ?? null;
}

/** Sin número explícito la clase va al final, no al principio. */
function bySeriesOrder(a: Post, b: Post) {
  return (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER);
}

/** Títulos de curso conocidos, incluidos los de entradas en borrador. */
export async function getSeriesTitles() {
  const titles = new Set<string>();
  for (const post of await getAllPosts()) {
    if (post.seriesTitle) titles.add(post.seriesTitle);
  }
  return [...titles].sort((a, b) => a.localeCompare(b, "es"));
}

/** Nombres de tag conocidos, incluidos los de borradores, para el autocompletado. */
export async function getTagNames() {
  const names = new Map<string, string>();
  for (const post of await getAllPosts()) {
    for (const name of post.tags) names.set(toSlug(name), name);
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b, "es"));
}
