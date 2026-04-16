import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ButtonLink } from "@/components/commons/button-link/ButtonLink";
import { fetchPostsPage } from "@/data/api-posts";
import { getCategoryBySlug } from "@/data/categories";
import { POSTS_LIST_PAGE_SIZE } from "@/data/list-pagination";
import { parseAuthorParam } from "@/data/post-filters";
import type { Post } from "@/data/types";
import { PostsFirstPageStatic } from "@/components/posts-list/PostsFirstPageStatic";
import { PostsList } from "@/components/posts-list/PostsList";
import styles from "./page.module.css";

type ListadoSearchParams = {
  categoria?: string | string[];
  autor?: string | string[];
};

type ListadoPageProps = {
  searchParams: Promise<ListadoSearchParams>;
};

/** Primera carga del listado con datos frescos desde el origen. */
export const dynamic = "force-dynamic";

function getFirstSearchParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

// Funcion para generar los metadatos de la pagina
export async function generateMetadata({
  searchParams,
}: ListadoPageProps): Promise<Metadata> {
  const params = await searchParams;
  const slug = getFirstSearchParamValue(params.categoria);
  const category = getCategoryBySlug(slug);

  if (category) {
    return {
      title: `Listado — ${category.title}`,
      description: `Publicaciones en la categoría ${category.title}.`,
    };
  }

  if (slug) {
    return {
      title: "Listado — categoría no encontrada",
      description: "La categoría solicitada no existe.",
    };
  }

  return {
    title: "Todos los posts",
    description: "Listado completo de publicaciones.",
  };
}

export default async function ListadoPage({ searchParams }: ListadoPageProps) {
  noStore();

  const params = await searchParams;
  const slug = getFirstSearchParamValue(params.categoria);
  const category = getCategoryBySlug(slug);
  const unknownSlug = slug && !category;

  const authorFromUrl = parseAuthorParam(
    getFirstSearchParamValue(params.autor) ?? null,
  );
  const effectiveListUserId =
    category != null ? category.userId : authorFromUrl;

  let initialRemotePosts: Post[] | undefined;
  if (!unknownSlug) {
    try {
      initialRemotePosts = await fetchPostsPage(
        0,
        POSTS_LIST_PAGE_SIZE,
        effectiveListUserId ?? undefined,
        { cache: "no-store" },
      );
    } catch {
      initialRemotePosts = undefined;
    }
  }

  const title = unknownSlug
    ? "Categoría no encontrada"
    : category
      ? `Listado — ${category.title}`
      : "Todos los posts";

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.back}>
            ← Inicio
          </Link>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {category && (
            <p className={styles.subtitle}>
              Autor fijado por la categoría ({" "}
              <code className={styles.code}>userId {category.userId}</code>). Podés seguir
              filtrando por texto y ordenar el listado; el detalle y la edición están en cada
              post.
            </p>
          )}
          {!slug && (
            <p className={styles.subtitle}>
              Filtros por texto, autor (usuario 1–10) y orden; scroll infinito; enlaces al
              detalle. Los parámetros se reflejan en la URL (<code className={styles.code}>q</code>,{" "}
              <code className={styles.code}>autor</code>, <code className={styles.code}>orden</code>
              ).
            </p>
          )}
          {unknownSlug && (
            <p className={styles.subtitle}>
              No hay una categoría con el identificador{" "}
              <code className={styles.code}>{slug}</code>.{" "}
              <Link href="/listado" className={styles.inlineLink}>
                Ver todos los posts
              </Link>
            </p>
          )}
          {!unknownSlug ? (
            <p className={styles.ctaRow}>
              <ButtonLink href="/listado/nuevo" variant="primary">
                Nueva publicación (local)
              </ButtonLink>
            </p>
          ) : null}
        </header>

        {!unknownSlug && (
          <noscript>
            <p className={styles.noJsNote}>
              Mostramos hasta 25 publicaciones de esta vista. Activá JavaScript para filtros,
              orden y más páginas.
            </p>
          </noscript>
        )}

        {unknownSlug ? (
          <section className={styles.placeholder} aria-label="Sin categoría">
            <p className={styles.placeholderText}>
              Vuelve al inicio o elige otra categoría.
            </p>
          </section>
        ) : (
          <>
            {initialRemotePosts && initialRemotePosts.length > 0 ? (
              <div className="listado-static-posts">
                <PostsFirstPageStatic posts={initialRemotePosts} />
              </div>
            ) : null} 
            <div
              className={
                initialRemotePosts?.length
                  ? "listado-client-posts"
                  : undefined
              }
            >
              <PostsList
                filterUserId={category ? category.userId : null}
                initialRemotePosts={initialRemotePosts}
                initialRemoteListUserId={
                  initialRemotePosts !== undefined
                    ? effectiveListUserId
                    : undefined
                }
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
