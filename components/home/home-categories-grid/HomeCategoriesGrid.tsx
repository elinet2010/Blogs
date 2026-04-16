import { CATEGORIES, listadoHrefForCategory } from "@/data/categories";
import { CategoryCard } from "@/components/commons/category-card/CategoryCard";
import type { CategoryCardProps } from "@/components/commons/category-card/CategoryCard";
import styles from "./HomeCategoriesGrid.module.css";

export type HomeCategoriesGridProps = {
  /** Sobre el cover oscuro usa estilos en vidrio / texto claro */
  surface?: "default" | "cover";
};

type GridSurface = NonNullable<HomeCategoriesGridProps["surface"]>;

/** Una entrada por superficie: contenedor + variante de tarjeta alineadas. */
const GRID_LAYOUT_BY_SURFACE: Record<
  GridSurface,
  { rootClassName: string; categoryCardVariant: CategoryCardProps["variant"] }
> = {
  default: {
    rootClassName: styles.section,
    categoryCardVariant: "default",
  },
  cover: {
    rootClassName: `${styles.section} ${styles.sectionCover}`,
    categoryCardVariant: "cover",
  },
};

export function HomeCategoriesGrid({ surface = "default" }: HomeCategoriesGridProps) {
  const { rootClassName, categoryCardVariant } =
    GRID_LAYOUT_BY_SURFACE[surface];

  return (
    <section className={rootClassName} aria-labelledby="categories-heading">
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
              variant={categoryCardVariant}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
