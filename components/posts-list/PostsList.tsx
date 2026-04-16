"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Post } from "@/data/types";
import { POSTS_LIST_PAGE_SIZE } from "@/data/list-pagination";
import {
  parseAuthorParam,
  parseSortParam,
  sortPosts,
  type SortOption,
} from "@/data/post-filters";
import { computeVisiblePosts, usePostsStore } from "@/store";
import { PostsFiltersBar } from "@/components/posts-filters-bar/PostsFiltersBar";
import styles from "./PostsList.module.css";

const useIsoLayoutEffect =
  typeof document !== "undefined" ? useLayoutEffect : useEffect;

/** Clave estable para comparar el filtro de autor del servidor con el de la URL. */
function normalizeAuthorListFilterKey(id: number | null | undefined) {
  return id == null ? "all" : String(id);
}

export type PostsListProps = {
  /** null = todos los posts; número = misma semántica que categoría (userId) */
  filterUserId: number | null;
  /** Primera página cargada en el servidor (misma lógica que el filtro activo al abrir la ruta). */
  initialRemotePosts?: Post[];
  /** Debe coincidir con el `userId` usado en la petición del servidor (`null` = todos). */
  initialRemoteListUserId?: number | null;
};

function filterPostsBySearchQuery(posts: Post[], rawQuery: string): Post[] {
  const normalizedQuery = rawQuery.trim().toLowerCase();
  if (!normalizedQuery) return posts;
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.body.toLowerCase().includes(normalizedQuery),
  );
}

function PostsFiltersSection({
  searchQuery,
  onSearchChange,
  lockAuthor,
  lockedAuthorId,
  onClearFilters,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  lockAuthor: boolean;
  lockedAuthorId: number | null;
  onClearFilters: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sort = parseSortParam(searchParams.get("orden"));
  const authorUserId = parseAuthorParam(searchParams.get("autor"));

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const onSortChange = useCallback(
    (value: SortOption) => {
      setParam("orden", value || null);
    },
    [setParam],
  );

  const onAuthorChange = useCallback(
    (userId: number | null) => {
      setParam("autor", userId !== null ? String(userId) : null);
    },
    [setParam],
  );

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    sort !== "" ||
    (!lockAuthor && authorUserId !== null);

  return (
    <PostsFiltersBar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      sort={sort}
      onSortChange={onSortChange}
      authorUserId={authorUserId}
      onAuthorChange={onAuthorChange}
      lockAuthor={lockAuthor}
      lockedAuthorId={lockedAuthorId}
      onClearFilters={onClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
}

/** Listado: filtros en URL (`q`, `orden`, `autor`) — dentro de `<Suspense>` */
function PostsListInner({
  filterUserId,
  initialRemotePosts,
  initialRemoteListUserId,
}: PostsListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const lockAuthor = filterUserId !== null;

  const [searchQuery, setSearchQueryState] = useState(
    () => searchParams.get("q") ?? "",
  );

  useEffect(() => {
    setSearchQueryState(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQueryState(value);
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  /** No usar handleSearchChange aquí: aún leería searchParams viejos y volvería a poner orden/autor. */
  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    const cat = searchParams.get("categoria");
    if (cat) params.set("categoria", cat);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setSearchQueryState("");
  }, [pathname, router, searchParams]);

  const authorFromUrl = parseAuthorParam(searchParams.get("autor"));
  const effectiveListUserId =
    filterUserId !== null ? filterUserId : authorFromUrl;

  const sort = parseSortParam(searchParams.get("orden"));

  const remotePosts = usePostsStore((state) => state.remotePosts);
  const localPosts = usePostsStore((state) => state.localPosts);
  const deletedIds = usePostsStore((state) => state.deletedIds);
  const editedById = usePostsStore((state) => state.editedById);
  const listUserId = usePostsStore((state) => state.listUserId);

  const serverBatchMatches = useMemo(
    () =>
      initialRemotePosts !== undefined &&
      normalizeAuthorListFilterKey(initialRemoteListUserId ?? null) ===
        normalizeAuthorListFilterKey(effectiveListUserId),
    [initialRemotePosts, initialRemoteListUserId, effectiveListUserId],
  );

  /** Sin JS no hay efectos: el HTML debe salir del primer render usando el lote del RSC. */
  const awaitingClientSeed = useMemo(
    () =>
      serverBatchMatches &&
      remotePosts.length === 0 &&
      initialRemotePosts !== undefined,
    [serverBatchMatches, remotePosts.length, initialRemotePosts],
  );

  const basePosts = useMemo(() => {
    if (awaitingClientSeed && initialRemotePosts) {
      return computeVisiblePosts({
        remotePosts: initialRemotePosts,
        localPosts,
        deletedIds,
        editedById,
        listUserId: effectiveListUserId,
      });
    }
    return computeVisiblePosts({
      remotePosts,
      localPosts,
      deletedIds,
      editedById,
      listUserId,
    });
  }, [
    awaitingClientSeed,
    initialRemotePosts,
    remotePosts,
    localPosts,
    deletedIds,
    editedById,
    listUserId,
    effectiveListUserId,
  ]);

  const postsAfterSearch = useMemo(
    () => filterPostsBySearchQuery(basePosts, searchQuery),
    [basePosts, searchQuery],
  );

  const displayPosts = useMemo(
    () => sortPosts(postsAfterSearch, sort),
    [postsAfterSearch, sort],
  );

  const isLoading = usePostsStore((state) => state.isLoading);
  const error = usePostsStore((state) => state.error);
  const hasMore = usePostsStore((state) => state.hasMore);
  const resetRemoteForList = usePostsStore((state) => state.resetRemoteForList);
  const seedFirstPageFromServer = usePostsStore(
    (state) => state.seedFirstPageFromServer,
  );
  const fetchPage = usePostsStore((state) => state.fetchPage);

  const hasMoreForUi = useMemo(() => {
    if (awaitingClientSeed && initialRemotePosts) {
      return initialRemotePosts.length === POSTS_LIST_PAGE_SIZE;
    }
    return hasMore;
  }, [awaitingClientSeed, initialRemotePosts, hasMore]);

  /** Evita disparar más páginas antes de hidratar el store (doble fetch). */
  const canUseInfiniteScroll =
    !serverBatchMatches || remotePosts.length > 0;

  /** Aplica datos del RSC antes del pintado en el cliente (sin aviso de SSR en useLayoutEffect). */
  useIsoLayoutEffect(() => {
    const serverPrefetchMatchesListFilter =
      initialRemotePosts !== undefined &&
      normalizeAuthorListFilterKey(initialRemoteListUserId ?? null) ===
        normalizeAuthorListFilterKey(effectiveListUserId);

    if (serverPrefetchMatchesListFilter) {
      seedFirstPageFromServer(
        effectiveListUserId,
        initialRemotePosts,
        POSTS_LIST_PAGE_SIZE,
      );
      return;
    }

    resetRemoteForList(effectiveListUserId);
    void fetchPage(POSTS_LIST_PAGE_SIZE);
  }, [
    effectiveListUserId,
    initialRemotePosts,
    initialRemoteListUserId,
    seedFirstPageFromServer,
    resetRemoteForList,
    fetchPage,
  ]);

  const loadMore = useCallback(() => {
    void fetchPage(POSTS_LIST_PAGE_SIZE);
  }, [fetchPage]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !canUseInfiniteScroll || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !usePostsStore.getState().isLoading) {
          void usePostsStore.getState().fetchPage(POSTS_LIST_PAGE_SIZE);
        }
      },
      /* Amplía la zona inferior para disparar antes (scroll infinito fiable) */
      { rootMargin: "0px 0px 720px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [canUseInfiniteScroll, hasMore, basePosts.length]);

  /**
   * Si tras cargar el sentinel sigue en zona “visible” (p. ej. pantalla alta o pocos ítems),
   * pide más hasta llenar el viewport o agotar la API — evita quedarse solo en la 1.ª página.
   */
  useEffect(() => {
    if (!canUseInfiniteScroll || !hasMore || isLoading) return;
    const node = sentinelRef.current;
    if (!node) return;

    const margin = 720;
    const rect = node.getBoundingClientRect();
    const inZone =
      rect.top < window.innerHeight + margin && rect.bottom > -margin;
    if (!inZone) return;

    void fetchPage(POSTS_LIST_PAGE_SIZE);
  }, [canUseInfiniteScroll, hasMore, isLoading, basePosts.length, fetchPage]);

  const filtersEl = (
    <PostsFiltersSection
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      lockAuthor={lockAuthor}
      lockedAuthorId={filterUserId}
      onClearFilters={clearAllFilters}
    />
  );

  if (error) {
    // Si hay un error, mostramos un mensaje de error
    return (
      <div className={styles.root}>
        {filtersEl}
        <div className={styles.error} role="alert">
          <p>{error}</p>
          <button type="button" className={styles.retry} onClick={() => void fetchPage(POSTS_LIST_PAGE_SIZE)}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!isLoading && basePosts.length === 0) { 
    // Si no hay publicaciones, mostramos un mensaje de que no hay publicaciones para mostrar
    return (
      <div className={styles.root}>
        {filtersEl}
        <p className={styles.empty}>No hay publicaciones para mostrar.</p>
      </div>
    );
  }

  const isInitialLoad = isLoading && basePosts.length === 0;
  const isLoadingMore = isLoading && basePosts.length > 0;
  const noSearchResults =
    !isLoading &&
    basePosts.length > 0 &&
    postsAfterSearch.length === 0 &&
    searchQuery.trim() !== "";




  if (noSearchResults) {
    // Si no hay resultados de la busqueda, mostramos un mensaje de que no hay resultados
    return (
      <div className={styles.root}>
        {filtersEl}
        <p className={styles.noHits} role="status">Ninguna publicación coincide con &quot;{searchQuery.trim()}&quot;. Prueba con otras palabras o limpia el filtro.</p>
      </div>
    );
  }

  if (isInitialLoad) {
    // Si esta cargando la pagina inicial, mostramos un mensaje de que esta cargando
    return (
      <div className={styles.root}>
        {filtersEl}
        <ul className={styles.list} aria-busy>
          {[0, 1, 2].map((key) => (
            <li key={`sk-${key}`} className={styles.item}></li>
          ))}
        </ul>
      </div>
    );
  }

  if (displayPosts.length === 0) {
    // Si no hay publicaciones, mostramos un mensaje de que no hay publicaciones para mostrar
    return (
      <div className={styles.root}>
        {filtersEl}
        <p className={styles.empty}>No hay publicaciones para mostrar.</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {filtersEl}
      {isInitialLoad ? (
        <ul className={styles.list} aria-busy>
          {[0, 1, 2].map((key) => (
            <li key={`sk-${key}`} className={styles.item}>
              <article className={`${styles.card} ${styles.skeletonCard}`} aria-hidden>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonLine} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineMuted}`} />
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.list}>
          {displayPosts.map((post) => (
            <li key={post.id} className={styles.item}>
              <article className={`${styles.card} ${styles.cardInteractive}`}>
                <Link
                  href={`/listado/${post.id}`}
                  className={styles.cardCover}
                  aria-labelledby={`post-title-${post.id}`}
                />
                <div className={styles.cardText}>
                  <h2 className={styles.postTitle} id={`post-title-${post.id}`}>
                    {post.title}
                  </h2>
                  <p className={styles.postBody}>{post.body}</p>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.editLink}
                    onClick={() => router.push(`/listado/${post.id}`)}
                  >
                    Editar
                  </button>
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
      )}

      {!noSearchResults && !isInitialLoad && (
        <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
      )}

      {isLoadingMore && (
        <div
          className={styles.loadMoreFoot}
          aria-live="polite"
          aria-label="Cargando más publicaciones"
        >
          <div className={styles.pulseTrack} aria-hidden>
            <span className={styles.pulseDot} />
            <span className={styles.pulseDot} />
            <span className={styles.pulseDot} />
          </div>
          <span className={styles.loadMoreLabel}>Cargando más</span>
        </div>
      )}

      {!hasMoreForUi &&
        basePosts.length > 0 &&
        !isInitialLoad &&
        !noSearchResults && (
        <p className={styles.end}>No hay más publicaciones.</p>
      )}

      {hasMoreForUi && !isLoading && !isInitialLoad && !noSearchResults && (
        <button type="button" className={styles.moreBtn} onClick={loadMore}>
          Cargar más
        </button>
      )}
    </div>
  );
}

export function PostsListFallback() {
  return (
    <div className={styles.root}>
      <div className={styles.suspenseBar} aria-hidden />
      <ul className={styles.list}>
        {[0, 1].map((key) => (
          <li key={`fb-${key}`} className={styles.item}>
            <article className={`${styles.card} ${styles.skeletonCard}`} aria-hidden>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PostsList(props: PostsListProps) {
  return (
    <Suspense fallback={<PostsListFallback />}>
      <PostsListInner {...props} />
    </Suspense>
  );
}
