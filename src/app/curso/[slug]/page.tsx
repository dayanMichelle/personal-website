import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSeries, getSeries } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllSeries()).map((series) => ({ slug: series.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getSeries(slug);
  if (!course) return { title: "Curso no encontrado" };
  return { title: course.title, description: course.description };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = await getSeries(slug);
  if (!course || course.posts.length === 0) notFound();

  const minutes = course.posts.reduce((total, p) => total + p.readingTime, 0);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/cursos" className="text-sm text-fg-muted hover:text-accent">
        ← Todos los cursos
      </Link>

      <header className="mt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Curso</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {course.title}
        </h1>
        {course.description ? (
          <p className="mt-4 text-lg text-fg-muted">{course.description}</p>
        ) : null}
        <p className="mt-4 font-mono text-xs text-fg-muted">
          {course.posts.length} {course.posts.length === 1 ? "clase" : "clases"}{" "}
          <span className="text-ink-line">{"//"}</span> {minutes} min en total
        </p>
      </header>

      <ol className="mt-12 space-y-px">
        {course.posts.map((lesson, index) => (
          <li key={lesson.slug}>
            <Link
              href={`/post/${lesson.slug}`}
              className="group flex items-baseline gap-4 rounded-lg border border-transparent px-4 py-4 transition hover:border-ink-line hover:bg-ink-soft"
            >
              <span className="w-16 shrink-0 font-mono text-xs text-fg-muted">
                Clase {lesson.seriesOrder ?? index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium group-hover:text-accent">{lesson.title}</span>
                {lesson.excerpt ? (
                  <span className="mt-1 block text-sm text-fg-muted">{lesson.excerpt}</span>
                ) : null}
              </span>
              <span className="shrink-0 font-mono text-xs text-fg-muted">
                {lesson.readingTime} min
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <Link
        href={`/post/${course.posts[0].slug}`}
        className="mt-10 inline-block rounded-lg bg-accent px-5 py-2.5 font-medium text-ink transition hover:opacity-90"
      >
        Empezar por la clase {course.posts[0].seriesOrder ?? 1}
      </Link>
    </main>
  );
}
