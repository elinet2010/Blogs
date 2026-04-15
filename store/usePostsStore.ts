/**
 * Store de posts — Zustand (pasos 1–9 del plan técnico)
 * 1. zustand instalado
 * 2. tipo Post en lib/types.ts
 * 3–4. estado remoto + appendPosts, setLoading, setError, fetchPage
 * 5–6. deletedIds, editedById, localPosts + acciones
 * 7. getVisiblePosts (merge remoto + local − borrados + ediciones)
 * 8. persist en localStorage (solo borrados, ediciones, locales)
 * 9. UI: components/posts-list/PostsList.tsx
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Post } from "@/lib/types";
import { fetchPostsPage } from "@/lib/api-posts";

type EditedMap = Record<number, Partial<Post>>;

type PostsState = {
  /* Paso 3 — estado remoto mínimo */
  remotePosts: Post[];
  isLoading: boolean;
  error: string | null;
  /** Paginación del listado activo */
  nextStart: number;
  hasMore: boolean;
  /** null = todos los autores; número = filtro JSONPlaceholder */
  listUserId: number | null;

  /* Paso 5 — estado local / ediciones */
  deletedIds: number[];
  editedById: EditedMap;
  localPosts: Post[];

  /* Paso 4 */
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  appendPosts: (posts: Post[]) => void;
  resetRemoteForList: (userId: number | null) => void;
  fetchPage: (limit?: number) => Promise<void>;

  /* Paso 6 */
  deletePost: (id: number) => void;
  upsertEdit: (id: number, partial: Partial<Post>) => void;
  addLocalPost: (post: Post) => void;

  /* Paso 7 */
  getVisiblePosts: () => Post[];
};

function dedupeAppend(existing: Post[], incoming: Post[]): Post[] {
  const seen = new Set(existing.map((p) => p.id));
  const out = [...existing];
  for (const p of incoming) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

function mergeVisible(state: PostsState): Post[] {
  const deleted = new Set(state.deletedIds);
  const byId = new Map<number, Post>();
  for (const p of state.remotePosts) {
    byId.set(p.id, p);
  }
  for (const p of state.localPosts) {
    byId.set(p.id, p);
  }
  let list = [...byId.values()].filter((p) => !deleted.has(p.id));
  if (state.listUserId != null) {
    list = list.filter((p) => p.userId === state.listUserId);
  }
  return list.map((p) => {
    const edit = state.editedById[p.id];
    return edit ? { ...p, ...edit } : p;
  });
}

/** Para UI: derivar en useMemo; no usar como selector de usePostsStore (nuevo array cada vez → bucle con useSyncExternalStore). */
export type PostsVisibleSlice = Pick<
  PostsState,
  "remotePosts" | "localPosts" | "deletedIds" | "editedById" | "listUserId"
>;

export function computeVisiblePosts(state: PostsVisibleSlice): Post[] {
  return mergeVisible(state as PostsState);
}

export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      remotePosts: [],
      isLoading: false,
      error: null,
      nextStart: 0,
      hasMore: true,
      listUserId: null,

      deletedIds: [],
      editedById: {},
      localPosts: [],

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      appendPosts: (posts) =>
        set((s) => ({
          remotePosts: dedupeAppend(s.remotePosts, posts),
        })),

      resetRemoteForList: (userId) =>
        set({
          remotePosts: [],
          nextStart: 0,
          hasMore: true,
          listUserId: userId,
          error: null,
          isLoading: false,
        }),

      fetchPage: async (limit = 10) => {
        const { isLoading, hasMore, nextStart, listUserId, appendPosts } = get();
        if (isLoading || !hasMore) return;

        set({ isLoading: true, error: null });
        try {
          const userId = listUserId ?? undefined;
          const posts = await fetchPostsPage(nextStart, limit, userId);
          appendPosts(posts);
          set((s) => ({
            nextStart: s.nextStart + posts.length,
            hasMore: posts.length === limit,
            isLoading: false,
          }));
        } catch (e) {
          set({
            error: e instanceof Error ? e.message : "Error desconocido",
            isLoading: false,
          });
        }
      },

      deletePost: (id) =>
        set((s) => ({
          deletedIds: s.deletedIds.includes(id) ? s.deletedIds : [...s.deletedIds, id],
        })),

      upsertEdit: (id, partial) =>
        set((s) => ({
          editedById: { ...s.editedById, [id]: { ...s.editedById[id], ...partial } },
        })),

      addLocalPost: (post) =>
        set((s) => ({
          localPosts: [...s.localPosts, post],
        })),

      getVisiblePosts: () => mergeVisible(get()),
    }),
    {
      name: "posts-app-storage",
      storage: createJSONStorage(() => localStorage),
      /* Paso 8 — no persistir los 100 posts remotos */
      partialize: (s) => ({
        deletedIds: s.deletedIds,
        editedById: s.editedById,
        localPosts: s.localPosts,
      }),
    },
  ),
);
