import { PostCard, type PostCardData } from "@/components/PostCard";

export function PostGrid({
  title,
  description,
  posts,
}: {
  title: string;
  description: string;
  posts: PostCardData[];
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">{description}</p>
      {posts.length === 0 ? (
        <p className="mt-16 text-fg-muted">Nada por aquí todavía.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
