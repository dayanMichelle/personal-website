import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Dayan Arango — Historias, guías e ideas",
    template: "%s · Dayan Arango",
  },
  description: "Blog personal: artículos, historias y notas de ingeniería.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <TopBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-7 place-items-center rounded-full bg-fg text-ink">DR</span>
          <span className="hidden sm:inline">Dayan Arango</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm text-fg-muted">
          <Link href="/articles" className="rounded-md px-3 py-1.5 hover:bg-ink-soft hover:text-fg">
            Artículos
          </Link>
          <Link href="/cursos" className="rounded-md px-3 py-1.5 hover:bg-ink-soft hover:text-fg">
            Cursos
          </Link>
          <Link href="/stories" className="rounded-md px-3 py-1.5 hover:bg-ink-soft hover:text-fg">
            Historias
          </Link>
          <Link
            href="/admin"
            className="ml-2 rounded-md border border-ink-line px-3 py-1.5 text-fg hover:border-accent hover:text-accent"
          >
            Escribir
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Dayan Arango</p>
        <p>Hecho con Next.js, Tiptap y demasiado café.</p>
      </div>
    </footer>
  );
}
