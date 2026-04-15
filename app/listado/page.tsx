import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryBySlug } from "@/lib/categories";
import { PostsList } from "@/components/posts-list/PostsList";
import styles from "./page.module.css";

type ListadoPageProps = {
  searchParams: Promise<{ categoria?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: ListadoPageProps): Promise<Metadata> {
  const params = await searchParams;
  const slug = firstParam(params.categoria);
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
  const params = await searchParams;
  const slug = firstParam(params.categoria);
  const category = getCategoryBySlug(slug);
  const unknownSlug = slug && !category;

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
              Filtro activo: publicaciones del autor (userId){" "}
              <code className={styles.code}>{category.userId}</code>. Aquí irá el listado
              con scroll infinito.
            </p>
          )}
          {!slug && (
            <p className={styles.subtitle}>
              Sin filtro de categoría. Aquí irá el listado completo con scroll infinito.
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
        </header>

        {unknownSlug ? (
          <section className={styles.placeholder} aria-label="Sin categoría">
            <p className={styles.placeholderText}>
              Vuelve al inicio o elige otra categoría.
            </p>
          </section>
        ) : (
          <PostsList filterUserId={category ? category.userId : null} />
        )}
      </main>
    </div>
  );
}
