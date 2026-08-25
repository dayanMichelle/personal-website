import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getAllPosts } from "@/lib/content";
import { formatDate } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mis entradas" };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/login");

  const posts = await getAllPosts();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Mis entradas</h1>
        <Link
          href="/admin/new"
          className="rounded-lg bg-accent px-4 py-2 font-medium text-ink hover:opacity-90"
        >
          Nueva entrada
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-16 text-fg-muted">Aún no has escrito nada. Empieza por la primera.</p>
      ) : (
        <ul className="mt-10 divide-y divide-ink-line border-y border-ink-line">
          {posts.map((post) => (
            <li key={post.slug} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <Link
                  href={`/admin/${post.slug}`}
                  className="block truncate font-medium hover:text-accent"
                >
                  {post.title}
                </Link>
                <p className="mt-1 font-mono text-xs text-fg-muted">
                  {post.seriesTitle
                    ? `${post.seriesTitle} · Clase ${post.seriesOrder ?? "?"}`
                    : post.category}{" "}
                  <span className="text-ink-line">{"//"}</span>{" "}
                  {post.published ? formatDate(post.publishedAt) : "Borrador"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs ${
                    post.published ? "bg-accent/15 text-accent" : "bg-ink-soft text-fg-muted"
                  }`}
                >
                  {post.published ? "Publicada" : "Borrador"}
                </span>
                {post.published ? (
                  <Link href={`/post/${post.slug}`} className="text-fg-muted hover:text-fg">
                    Ver
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
