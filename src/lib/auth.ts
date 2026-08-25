import "server-only";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "blog_admin";

/**
 * Si ADMIN_PASSWORD no está definida (desarrollo local) el panel queda abierto.
 * En cuanto la defines —por ejemplo al desplegar— hace falta iniciar sesión.
 */
export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return true;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === password;
}
