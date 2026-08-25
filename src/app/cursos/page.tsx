import Link from "next/link";
import { getAllSeries } from "@/lib/content";

export const metadata = { title: "Cursos" };

export default async function CoursesPage() {
  const courses = await getAllSeries();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">Cursos</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        Series de entradas pensadas para leerse en orden, clase a clase.
      </p>

      {courses.length === 0 ? (
        <p className="mt-16 text-fg-muted">Todavía no hay ningún curso publicado.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const minutes = course.posts.reduce((total, p) => total + p.readingTime, 0);
            return (
              <li key={course.slug}>
                <Link
                  href={`/curso/${course.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-ink-line bg-ink-soft p-5 transition hover:-translate-y-0.5 hover:border-accent"
                >
                  <h2 className="text-xl font-semibold tracking-tight group-hover:text-accent">
                    {course.title}
                  </h2>
                  {course.description ? (
                    <p className="mt-2 text-sm text-fg-muted">{course.description}</p>
                  ) : null}
                  <p className="mt-auto pt-4 font-mono text-xs text-fg-muted">
                    {course.posts.length} {course.posts.length === 1 ? "clase" : "clases"}{" "}
                    <span className="text-ink-line">{"//"}</span> {minutes} min en total
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
