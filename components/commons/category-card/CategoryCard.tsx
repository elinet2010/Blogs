import type { CSSProperties } from "react";
import Link from "next/link";
import styles from "./CategoryCard.module.css";

export type CategoryCardProps = {
  title: string;
  description: string;
  href: string;
  coverImageUrl: string;
  variant?: "default" | "cover";
};

export function CategoryCard({
  title,
  description,
  href,
  coverImageUrl,
  variant = "default",
}: CategoryCardProps) {
  const cardClass =
    variant === "cover" ? `${styles.card} ${styles.cardCover}` : styles.card;

  return (
    <Link href={href} className={styles.link}>
      <article
        className={cardClass}
        style={
          {
            "--card-cover-image": `url(${JSON.stringify(coverImageUrl)})`,
          } as CSSProperties
        }
      >
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <span className={styles.hint}>Ver publicaciones</span>
      </article>
    </Link>
  );
}
