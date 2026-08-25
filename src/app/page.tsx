import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { getAllSeries, getPublishedPosts, type Post } from "@/lib/content";

export default async function Home() {
  const [published, allCourses] = await Promise.all([getPublishedPosts(), getAllSeries()]);

  // Las destacadas primero; dentro de cada grupo, las más recientes.
  const posts = [...published]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 12);
  const courses = allCourses.slice(0, 4);

  const [latest, stories] = [
    posts.filter((p) => p.category !== "Story").slice(0, 4),
    posts.filter((p) => p.category === "Story").slice(0, 4),
  ];

  return (
    <main>
      <Hero />
      <div className="mx-auto max-w-6xl px-6">
        <Section title="Lo último" href="/articles" posts={latest} highlightFirst />
        <Courses courses={courses} />
        {stories.length > 0 ? <Section title="Historias" href="/stories" posts={stories} /> : null}
        {posts.length === 0 ? <EmptyState /> : null}
      </div>
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-line">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_20%_0%,rgba(169,112,255,0.22),transparent_60%)]"
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[220px_1fr] md:py-28">
        <nav className="hidden flex-col gap-3 text-sm text-fg-muted md:flex">
          <SideLink href="/articles" label="Artículos" />
          <SideLink href="/cursos" label="Cursos" />
          <SideLink href="/stories" label="Historias" />
          <SideLink href="/admin" label="Escribir" />
        </nav>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          Historias, guías e ideas escritas por Dayan
        </h1>
      </div>
    </section>
  );
}

function SideLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="transition hover:translate-x-1 hover:text-fg">
      {label}
    </Link>
  );
}

function Courses({
  courses,
}: {
  courses: { slug: string; title: string; description: string; posts: unknown[] }[];
}) {
  if (courses.length === 0) return null;
  return (
    <section className="py-12">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Cursos</h2>
        <Link href="/cursos" className="text-sm text-fg-muted hover:text-accent">
          Ver todo →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course) => (
          <Link
            key={course.slug}
            href={`/curso/${course.slug}`}
            className="group flex flex-col rounded-xl border border-ink-line bg-ink-soft p-5 transition hover:-translate-y-0.5 hover:border-accent"
          >
            <h3 className="font-semibold tracking-tight group-hover:text-accent">
              {course.title}
            </h3>
            {course.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{course.description}</p>
            ) : null}
            <p className="mt-auto pt-4 font-mono text-xs text-fg-muted">
              {course.posts.length} {course.posts.length === 1 ? "clase" : "clases"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Section({
  title,
  href,
  posts,
  highlightFirst = false,
}: {
  title: string;
  href: string;
  posts: Post[];
  highlightFirst?: boolean;
}) {
  if (posts.length === 0) return null;
  return (
    <section className="py-12">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <Link href={href} className="text-sm text-fg-muted hover:text-accent">
          Ver todo →
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} featured={highlightFirst && i === 0} />
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="py-24 text-center">
      <p className="text-lg text-fg-muted">Todavía no hay entradas publicadas.</p>
      <Link
        href="/admin/new"
        className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 font-medium text-ink hover:opacity-90"
      >
        Escribir la primera
      </Link>
    </section>
  );
}
