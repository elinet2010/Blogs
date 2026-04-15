"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { usePostsStore } from "@/store/usePostsStore";
import styles from "./PostDetail.module.css";

export type PostDetailProps = {
  initialPost: Post;
};

export function PostDetail({ initialPost }: PostDetailProps) {
  const deletedIds = usePostsStore((s) => s.deletedIds);
  const editedById = usePostsStore((s) => s.editedById);
  const upsertEdit = usePostsStore((s) => s.upsertEdit);

  const isHidden = deletedIds.includes(initialPost.id);

  const post = useMemo(() => {
    const edit = editedById[initialPost.id];
    return edit ? { ...initialPost, ...edit } : initialPost;
  }, [initialPost, editedById]);

  const [titleDraft, setTitleDraft] = useState(post.title);
  const [bodyDraft, setBodyDraft] = useState(post.body);

  useEffect(() => {
    setTitleDraft(post.title);
    setBodyDraft(post.body);
  }, [post.title, post.body]);

  if (isHidden) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p className={styles.hiddenMsg}>Esta publicación está oculta en tu sesión.</p>
          <Link href="/listado" className={styles.back}>
            Volver al listado
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav className={styles.nav}>
          <Link href="/listado" className={styles.back}>
            ← Listado
          </Link>
        </nav>

        <article className={styles.article}>
          <label className={styles.label} htmlFor="post-title">
            Título
          </label>
          <input
            id="post-title"
            className={styles.input}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => upsertEdit(post.id, { title: titleDraft })}
          />

          <label className={styles.label} htmlFor="post-body">
            Cuerpo
          </label>
          <textarea
            id="post-body"
            className={styles.textarea}
            rows={12}
            value={bodyDraft}
            onChange={(e) => setBodyDraft(e.target.value)}
            onBlur={() => upsertEdit(post.id, { body: bodyDraft })}
          />

          <p className={styles.meta}>Autor userId: {post.userId}</p>
        </article>
      </main>
    </div>
  );
}
