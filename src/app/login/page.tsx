"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Contraseña incorrecta");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-32">
      <h1 className="text-2xl font-bold tracking-tight">Entrar a escribir</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="input"
          autoFocus
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-ink hover:opacity-90">
          Entrar
        </button>
      </form>
    </main>
  );
}
