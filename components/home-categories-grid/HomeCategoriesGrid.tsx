import { CATEGORIES, listadoHrefForCategory } from "@/lib/categories";
import { CategoryCard } from "@/components/category-card/CategoryCard";
import styles from "./HomeCategoriesGrid.module.css";

export type HomeCategoriesGridProps = {
  /** Sobre el cover oscuro usa estilos en vidrio / texto claro */
  surface?: "default" | "cover";
};

export function HomeCategoriesGrid({ surface = "default" }: HomeCategoriesGridProps) {
  const rootClass =
    surface === "cover"
      ? `${styles.section} ${styles.sectionCover}`
      : styles.section;

  return (
    <section className={rootClass} aria-labelledby="categories-heading">
      <h2 id="categories-heading" className={styles.heading}>
        Explora por categoría
      </h2>
      <p className={styles.lead}>
        Elige una sección para ver publicaciones filtradas, o usa &quot;Ver más&quot; para
        ver el listado completo.
      </p>
      <ul className={styles.grid}>
        {CATEGORIES.map((category) => (
          <li key={category.slug} className={styles.item}>
            <CategoryCard
              title={category.title}
              description={category.description}
              href={listadoHrefForCategory(category.slug)}
              coverImageUrl={category.coverImageUrl}
              variant={surface === "cover" ? "cover" : "default"}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
