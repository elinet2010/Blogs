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
            <article className={styles.card}>
              <Link href={`/listado/${post.id}`} className={styles.postLink}>
                <h2 className={styles.postTitle}>{post.title}</h2>
              </Link>
              <p className={styles.postBody}>{post.body}</p>
              <p className={styles.staticDetailLink}>
                <Link href={`/listado/${post.id}`}>Ver publicación</Link>
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
