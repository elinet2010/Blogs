"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { computeVisiblePosts, usePostsStore } from "@/store/usePostsStore";
import styles from "./PostsList.module.css";

export type PostsListProps = {
  /** null = todos los posts; número = misma semántica que categoría (userId) */
  filterUserId: number | null;
};

/** Paso 9 — listado conectado al store (carga inicial + scroll infinito) */
export function PostsList({ filterUserId }: PostsListProps) {
  const remotePosts = usePostsStore((s) => s.remotePosts);
  const localPosts = usePostsStore((s) => s.localPosts);
  const deletedIds = usePostsStore((s) => s.deletedIds);
  const editedById = usePostsStore((s) => s.editedById);
  const listUserId = usePostsStore((s) => s.listUserId);

  const posts = useMemo(
    () =>
      computeVisiblePosts({
        remotePosts,
        localPosts,
        deletedIds,
        editedById,
        listUserId,
      }),
    [remotePosts, localPosts, deletedIds, editedById, listUserId],
  );

  const isLoading = usePostsStore((s) => s.isLoading);
  const error = usePostsStore((s) => s.error);
  const hasMore = usePostsStore((s) => s.hasMore);
  const resetRemoteForList = usePostsStore((s) => s.resetRemoteForList);
  const fetchPage = usePostsStore((s) => s.fetchPage);

  useEffect(() => {
    resetRemoteForList(filterUserId);
    void fetchPage(10);
  }, [filterUserId, resetRemoteForList, fetchPage]);

  const loadMore = useCallback(() => {
    void fetchPage(10);
  }, [fetchPage]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !usePostsStore.getState().isLoading) {
          void usePostsStore.getState().fetchPage(10);
        }
      },
      { rootMargin: "160px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, posts.length]);

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>{error}</p>
        <button type="button" className={styles.retry} onClick={() => void fetchPage(10)}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return <p className={styles.empty}>No hay publicaciones para mostrar.</p>;
  }

  return (
    <div className={styles.root}>
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.id} className={styles.item}>
            <article className={styles.card}>
              <Link href={`/listado/${post.id}`} className={styles.postLink}>
                <h2 className={styles.postTitle}>{post.title}</h2>
              </Link>
              <p className={styles.postBody}>{post.body}</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => usePostsStore.getState().deletePost(post.id)}
                >
                  Ocultar
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden />

      {isLoading && (
        <p className={styles.loading} aria-live="polite">
          Cargando…
        </p>
      )}

      {!hasMore && posts.length > 0 && (
        <p className={styles.end}>No hay más publicaciones.</p>
      )}

      {hasMore && !isLoading && (
        <button type="button" className={styles.moreBtn} onClick={loadMore}>
          Cargar más
        </button>
      )}
    </div>
  );
}
