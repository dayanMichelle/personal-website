// Migración de una sola vez: vuelca las entradas de SQLite a content/posts/*.md
import fs from "node:fs/promises";
import path from "node:path";
import Database from "better-sqlite3";
import matter from "gray-matter";
import TurndownService from "turndown";

const DB = process.argv[2] ?? "prisma/dev.db";
const OUT = path.join(process.cwd(), "content", "posts");

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "_",
});

const db = new Database(DB, { readonly: true });

const posts = db.prepare("SELECT * FROM Post").all();
const tagsByPost = new Map();
for (const row of db
  .prepare("SELECT pt.A as postId, t.name FROM _PostToTag pt JOIN Tag t ON t.id = pt.B")
  .all()) {
  tagsByPost.set(row.postId, [...(tagsByPost.get(row.postId) ?? []), row.name]);
}
const seriesById = new Map(db.prepare("SELECT id, title FROM Series").all().map((s) => [s.id, s.title]));

await fs.mkdir(OUT, { recursive: true });

for (const post of posts) {
  const data = { title: post.title, category: post.category, published: Boolean(post.published) };
  if (post.excerpt) data.excerpt = post.excerpt;
  if (post.publishedAt) data.publishedAt = new Date(post.publishedAt).toISOString();
  if (post.coverImage) data.coverImage = post.coverImage;

  const tags = tagsByPost.get(post.id);
  if (tags?.length) data.tags = tags;

  const seriesTitle = post.seriesId ? seriesById.get(post.seriesId) : null;
  if (seriesTitle) {
    data.series = seriesTitle;
    if (post.seriesOrder) data.seriesOrder = post.seriesOrder;
  }
  if (post.featured) data.featured = true;

  const markdown = turndown.turndown(post.contentHtml ?? "").trim();
  await fs.writeFile(path.join(OUT, `${post.slug}.md`), matter.stringify(`\n${markdown}\n`, data), "utf8");
  console.log(`✓ ${post.slug}.md  (${markdown.length} caracteres)`);
}

console.log(`\n${posts.length} entradas exportadas a content/posts/`);
