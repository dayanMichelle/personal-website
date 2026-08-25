export { CATEGORIES, type Category } from "./categories";

export function formatDate(date: Date | null) {
  if (!date) return "Borrador";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
