import { PostGrid } from "@/components/PostGrid";
import { getPublishedPosts } from "@/lib/content";

export const metadata = { title: "Historias" };

export default async function StoriesPage() {
  const posts = (await getPublishedPosts()).filter((post) => post.category === "Story");
  return (
    <PostGrid title="Historias" description="Lo que pasa alrededor del código." posts={posts} />
  );
}
