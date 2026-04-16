import type { Post } from "@/data/types";
import { apiFetchJson } from "@/data/api-http";

const JSON_PLACEHOLDER_POSTS_BASE_URL =
  "https://jsonplaceholder.typicode.com/posts";

export type FetchPostsPageOptions = {
  /** En Server Components, `no-store` evita la caché de datos de Next para esta petición. */
  cache?: RequestCache;
};

/**
 * Página remota JSONPlaceholder: `_start` + `_limit`, opcionalmente `userId`.
 */
export async function fetchPostsPage(
  pageStartOffset: number,
  pageSize: number,
  authorUserIdFilter?: number,
  options?: FetchPostsPageOptions,
): Promise<Post[]> {
  const url = new URL(JSON_PLACEHOLDER_POSTS_BASE_URL);
  url.searchParams.set("_start", String(pageStartOffset));
  url.searchParams.set("_limit", String(pageSize));
  if (authorUserIdFilter != null) {
    url.searchParams.set("userId", String(authorUserIdFilter));
  }
  return apiFetchJson<Post[]>(
    url.toString(),
    options?.cache !== undefined ? { cache: options.cache } : undefined,
  );
}

export async function fetchPostById(postId: number): Promise<Post | null> {
  const response = await fetch(`${JSON_PLACEHOLDER_POSTS_BASE_URL}/${postId}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Error al cargar el post (${response.status})`);
  }
  return response.json() as Promise<Post>;
}

export type CreatePostPayload = {
  title: string;
  body: string;
  userId: number;
};

/**
 * POST a JSONPlaceholder: petición HTTP real; la API **no persiste** el recurso en el servidor
 * (respuesta simulada con `id` típico 101). Los datos se guardan en la app con Zustand/localStorage.
 */
export async function createPostViaApi(
  payload: CreatePostPayload,
): Promise<Post> {
  return apiFetchJson<Post>(JSON_PLACEHOLDER_POSTS_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
