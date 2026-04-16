import Link from "next/link";
import type { Post } from "@/data/types";
import styles from "./PostsList.module.css";

/** Primeros posts en HTML puro (RSC) — visibles sin JavaScript. */
export function PostsFirstPageStatic({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className={styles.staticBlock} aria-label="Publicaciones">
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.id} className={styles.item}>
            <article className={`${styles.card} ${styles.cardInteractive}`}>
              <Link
                href={`/listado/${post.id}`}
                className={styles.cardStaticHit}
                aria-labelledby={`static-post-title-${post.id}`}
              >
                <h2 className={styles.postTitle} id={`static-post-title-${post.id}`}>
                  {post.title}
                </h2>
                <p className={styles.postBody}>{post.body}</p>
                <span className={styles.cardStaticCta}>Ver publicación</span>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
