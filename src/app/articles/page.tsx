import { PostGrid } from "@/components/PostGrid";
import { getPublishedPosts } from "@/lib/content";

export const metadata = { title: "Artículos" };

export default async function ArticlesPage() {
  const posts = (await getPublishedPosts()).filter((post) => post.category !== "Story");
  return (
    <PostGrid
      title="Artículos"
      description="Notas técnicas, guías y aprendizajes del día a día."
      posts={posts}
    />
  );
}
