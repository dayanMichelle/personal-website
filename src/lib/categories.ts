export const CATEGORIES = ["Article", "Story", "Guide", "Engineering", "Product"] as const;
export type Category = (typeof CATEGORIES)[number];
