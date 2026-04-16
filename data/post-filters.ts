import type { Post } from "@/data/types";

/** Opciones de orden del listado (valor = query `orden`). */
export const POST_LIST_SORT_OPTIONS = [
  { value: "", label: "Orden de carga" },
  { value: "titulo-asc", label: "Título A → Z" },
  { value: "titulo-desc", label: "Título Z → A" },
  { value: "id-asc", label: "ID menor primero" },
  { value: "id-desc", label: "ID mayor primero" },
] as const;

export type SortOption = (typeof POST_LIST_SORT_OPTIONS)[number]["value"];

const ALLOWED_SORT_QUERY_VALUES = new Set<string>(
  POST_LIST_SORT_OPTIONS.map((option) => option.value),
);

/** JSONPlaceholder expone posts por `userId` 1–10 en esta prueba. */
export const JSON_PLACEHOLDER_MIN_AUTHOR_USER_ID = 1;
export const JSON_PLACEHOLDER_MAX_AUTHOR_USER_ID = 10;

export const JSON_PLACEHOLDER_AUTHOR_USER_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
] as const;

export function parseSortParam(raw: string | null): SortOption {
  if (!raw || !ALLOWED_SORT_QUERY_VALUES.has(raw)) return "";
  return raw as SortOption;
}

export function sortPosts(posts: Post[], sort: SortOption): Post[] {
  if (!sort) return posts;
  const postsCopy = [...posts];
  switch (sort) {
    case "titulo-asc":
      return postsCopy.sort((postA, postB) =>
        postA.title.localeCompare(postB.title, "es"),
      );
    case "titulo-desc":
      return postsCopy.sort((postA, postB) =>
        postB.title.localeCompare(postA.title, "es"),
      );
    case "id-asc":
      return postsCopy.sort((postA, postB) => postA.id - postB.id);
    case "id-desc":
      return postsCopy.sort((postA, postB) => postB.id - postA.id);
    default:
      return posts;
  }
}

export function parseAuthorParam(raw: string | null): number | null {
  if (!raw) return null;
  const parsedAuthorUserId = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsedAuthorUserId)) return null;
  if (
    parsedAuthorUserId < JSON_PLACEHOLDER_MIN_AUTHOR_USER_ID ||
    parsedAuthorUserId > JSON_PLACEHOLDER_MAX_AUTHOR_USER_ID
  ) {
    return null;
  }
  return parsedAuthorUserId;
}
