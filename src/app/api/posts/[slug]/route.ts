import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getPost } from "@/lib/content";
import { deletePost, updatePost } from "@/lib/content-write";
import { htmlToMarkdown } from "@/lib/markdown";
import { readBody } from "../body";

type Ctx = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { slug } = await params;
  const current = await getPost(slug);
  if (!current) return NextResponse.json({ error: "No existe" }, { status: 404 });

  const body = await request.json();
  const input = readBody(body);
  if (!input.title) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  const markdown =
    body.contentHtml === undefined ? current.markdown : htmlToMarkdown(String(body.contentHtml));

  const nextSlug = await updatePost(slug, { ...input, markdown });
  revalidatePath("/", "layout");

  return NextResponse.json({ slug: nextSlug });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { slug } = await params;
  await deletePost(slug);
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
