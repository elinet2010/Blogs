import type { Metadata } from "next";
import { HomeCoverHero } from "@/components/home/home-cover-hero/HomeCoverHero";
import { HomeCategoriesGrid } from "@/components/home/home-categories-grid/HomeCategoriesGrid";
import { VerMasButton } from "@/components/home/ver-mas-button/VerMasButton";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Explora publicaciones de ejemplo por categoría o accede al listado completo.",
};

export default function Home() {
  return (
    <div className={styles.cover}>
      <div className={styles.coverGlow} aria-hidden />
      <main className={styles.main}>
        <div className={styles.heroBlock}>
          <HomeCoverHero />
        </div>
        <div className={styles.lower}>
          <HomeCategoriesGrid surface="cover" />
          <VerMasButton />
        </div>
      </main>
    </div>
  );
}
