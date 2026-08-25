import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createPost } from "@/lib/content-write";
import { htmlToMarkdown } from "@/lib/markdown";
import { readBody } from "./body";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const input = readBody(body);
  if (!input.title) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  const slug = await createPost({ ...input, markdown: htmlToMarkdown(String(body.contentHtml ?? "")) });
  revalidatePath("/", "layout");

  return NextResponse.json({ slug }, { status: 201 });
}
