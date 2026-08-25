import Link from "next/link";
import { formatDate } from "@/lib/posts";

export type PostCardData = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string | null;
  readingTime: number;
  publishedAt: Date | null;
};

export function PostCard({ post, featured = false }: { post: PostCardData; featured?: boolean }) {
  return (
    <Link
      href={`/post/${post.slug}`}
      className={`group flex flex-col overflow-hidden rounded-xl border bg-ink-soft transition hover:-translate-y-0.5 hover:border-accent ${
        featured ? "border-accent/70" : "border-ink-line"
      }`}
    >
      <Cover post={post} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold leading-snug tracking-tight group-hover:text-accent">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="line-clamp-2 text-sm text-fg-muted">{post.excerpt}</p>
        ) : null}
        <p className="mt-auto pt-2 font-mono text-xs text-fg-muted">
          {post.category} <span className="text-ink-line">{"//"}</span> {formatDate(post.publishedAt)}{" "}
          <span className="text-ink-line">{"//"}</span> {post.readingTime} min
        </p>
      </div>
    </Link>
  );
}

function Cover({ post }: { post: PostCardData }) {
  if (post.coverImage) {
    return (
      // Imagen remota arbitraria: <img> evita configurar cada dominio en next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={post.coverImage} alt="" className="aspect-[16/10] w-full object-cover" />
    );
  }
  return (
    <div className="grid aspect-[16/10] w-full place-items-center bg-gradient-to-br from-accent/25 via-ink-soft to-ink">
      <span className="font-mono text-3xl text-fg-muted">{post.title.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}
