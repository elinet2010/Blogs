import type { Post } from "@/lib/types";

const BASE = "https://jsonplaceholder.typicode.com/posts";

export async function fetchPostsPage(
  start: number,
  limit: number,
  userId?: number,
): Promise<Post[]> {
  const url = new URL(BASE);
  url.searchParams.set("_start", String(start));
  url.searchParams.set("_limit", String(limit));
  if (userId != null) {
    url.searchParams.set("userId", String(userId));
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Error al cargar posts (${res.status})`);
  }
  return res.json() as Promise<Post[]>;
}

export async function fetchPostById(id: number): Promise<Post | null> {
  const res = await fetch(`${BASE}/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Error al cargar el post (${res.status})`);
  return res.json() as Promise<Post>;
}
