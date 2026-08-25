import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";
import { isAdmin } from "@/lib/auth";
import { getPost, getSeriesTitles, getTagNames, renderPost } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar entrada" };

export default async function EditPostPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) redirect("/login");

  const { slug } = await params;
  const [post, allTags, allSeries] = await Promise.all([
    getPost(slug),
    getTagNames(),
    getSeriesTitles(),
  ]);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <PostForm
        allTags={allTags}
        allSeries={allSeries}
        initial={{
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          coverImage: post.coverImage ?? "",
          // El editor trabaja en HTML; el archivo guarda Markdown.
          contentHtml: renderPost(post),
          featured: post.featured,
          published: post.published,
          tags: post.tags,
          seriesTitle: post.seriesTitle ?? "",
          seriesOrder: post.seriesOrder ? String(post.seriesOrder) : "",
        }}
      />
    </main>
  );
}
