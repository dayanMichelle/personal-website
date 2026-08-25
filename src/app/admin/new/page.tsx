import { redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { isAdmin } from "@/lib/auth";
import { getSeriesTitles, getTagNames } from "@/lib/content";

// Fuerza render dinámico: sin esto la comprobación de sesión quedaría prerenderizada.
export const dynamic = "force-dynamic";
export const metadata = { title: "Nueva entrada" };

export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/login");

  const [allTags, allSeries] = await Promise.all([getTagNames(), getSeriesTitles()]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <PostForm allTags={allTags} allSeries={allSeries} />
    </main>
  );
}
