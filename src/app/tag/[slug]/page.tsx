import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/PostGrid";
import { getAllTags, getPostsByTag } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllTags()).map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = (await getAllTags()).find((t) => t.slug === slug);
  return { title: tag ? `#${tag.name}` : "Tag no encontrado" };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = (await getAllTags()).find((t) => t.slug === slug);
  if (!tag) notFound();

  const posts = await getPostsByTag(slug);

  return (
    <PostGrid
      title={`#${tag.name}`}
      description={`${posts.length} ${posts.length === 1 ? "entrada" : "entradas"} con este tag.`}
      posts={posts}
    />
  );
}
