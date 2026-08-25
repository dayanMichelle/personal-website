import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPublishedPosts, getSeries, renderPost, type Post } from "@/lib/content";
import { formatDate } from "@/lib/posts";
import { toSlug } from "@/lib/slug";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Entrada no encontrada" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
      type: "article",
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || !post.published) notFound();

  // Si la entrada es una clase, traemos el curso entero para poder navegarlo.
  const course = post.seriesSlug ? await getSeries(post.seriesSlug) : null;
  const lessons = course?.posts ?? [];

  const index = lessons.findIndex((l) => l.slug === post.slug);
  const previous = index > 0 ? lessons[index - 1] : null;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-fg-muted hover:text-accent">
        ← Volver
      </Link>

      <header className="mt-8">
        {course ? (
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            <Link href={`/curso/${course.slug}`} className="hover:underline">
              {course.title}
            </Link>
            {index >= 0 ? (
              <span className="text-fg-muted">
                {" "}
                · Clase {index + 1} de {lessons.length}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{post.category}</p>
        )}

        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-fg-muted">
          {post.authorName} · {formatDate(post.publishedAt)} · {post.readingTime} min de lectura
        </p>
      </header>

      {post.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="mt-10 w-full rounded-xl border border-ink-line object-cover"
        />
      ) : null}

      <article className="prose-post mt-12" dangerouslySetInnerHTML={{ __html: renderPost(post) }} />

      {post.tags.length > 0 ? (
        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${toSlug(tag)}`}
              className="rounded-full border border-ink-line px-3 py-1 text-xs text-fg-muted transition hover:border-accent hover:text-accent"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}

      {course && lessons.length > 1 ? (
        <CourseNav
          courseTitle={course.title}
          courseSlug={course.slug}
          lessons={lessons}
          currentSlug={post.slug}
          previous={previous}
          next={next}
        />
      ) : null}
    </main>
  );
}

function CourseNav({
  courseTitle,
  courseSlug,
  lessons,
  currentSlug,
  previous,
  next,
}: {
  courseTitle: string;
  courseSlug: string;
  lessons: Post[];
  currentSlug: string;
  previous: Post | null;
  next: Post | null;
}) {
  return (
    <nav className="mt-16 rounded-xl border border-ink-line bg-ink-soft p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-fg-muted">
        Curso ·{" "}
        <Link href={`/curso/${courseSlug}`} className="text-fg hover:text-accent">
          {courseTitle}
        </Link>
      </p>

      <ol className="mt-4 space-y-1">
        {lessons.map((lesson, i) => {
          const isCurrent = lesson.slug === currentSlug;
          return (
            <li key={lesson.slug}>
              {isCurrent ? (
                <span className="flex gap-3 rounded-md bg-ink px-3 py-2 text-sm">
                  <span className="w-14 shrink-0 font-mono text-xs text-accent">Clase {i + 1}</span>
                  <span className="font-medium">{lesson.title}</span>
                </span>
              ) : (
                <Link
                  href={`/post/${lesson.slug}`}
                  className="flex gap-3 rounded-md px-3 py-2 text-sm text-fg-muted transition hover:bg-ink hover:text-fg"
                >
                  <span className="w-14 shrink-0 font-mono text-xs">Clase {i + 1}</span>
                  <span>{lesson.title}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-col gap-2 border-t border-ink-line pt-4 sm:flex-row sm:justify-between">
        {previous ? (
          <Link href={`/post/${previous.slug}`} className="text-sm text-fg-muted hover:text-accent">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/post/${next.slug}`}
            className="text-sm text-fg-muted hover:text-accent sm:text-right"
          >
            {next.title} →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
