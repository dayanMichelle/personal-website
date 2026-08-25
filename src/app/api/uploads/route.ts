import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { toSlug } from "@/lib/slug";
import { extensionFor, validateImage } from "@/lib/uploads";

export const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No llegó ninguna imagen" }, { status: 400 });
  }

  const problem = validateImage(file);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const extension = extensionFor(file.type);
  if (!extension) {
    return NextResponse.json({ error: "Formato no admitido" }, { status: 400 });
  }

  // Nombre legible a partir del original, con sufijo corto para no pisar nada.
  const base = toSlug(file.name.replace(/\.[^.]+$/, "")).slice(0, 60) || "imagen";
  const suffix = crypto.randomBytes(3).toString("hex");
  const year = String(new Date().getFullYear());
  const filename = `${base}-${suffix}.${extension}`;

  const directory = path.join(UPLOADS_DIR, year);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));

  // Ruta pública: public/ se sirve desde la raíz.
  return NextResponse.json({ url: `/uploads/${year}/${filename}` }, { status: 201 });
}
