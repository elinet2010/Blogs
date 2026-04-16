"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Post } from "@/data/types";
import { PostEditModal } from "@/components/post-edit-modal/PostEditModal";
import { PostImageCarousel } from "@/components/post-image-carousel/PostImageCarousel";
import { usePostsStore } from "@/store";
import styles from "./PostDetail.module.css";

export type PostDetailProps = {
  initialPost: Post;
};

export function PostDetail({ initialPost }: PostDetailProps) {
  const deletedIds = usePostsStore((state) => state.deletedIds);
  const editedById = usePostsStore((state) => state.editedById);
  const upsertEdit = usePostsStore((state) => state.upsertEdit);

  const isPostHiddenByUser = deletedIds.includes(initialPost.id);

  const postWithLocalEdits = useMemo(() => {
    const localEdits = editedById[initialPost.id];
    return localEdits ? { ...initialPost, ...localEdits } : initialPost;
  }, [initialPost, editedById]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState(postWithLocalEdits.title);
  const [bodyDraft, setBodyDraft] = useState(postWithLocalEdits.body);
  const modalBaselineContentRef = useRef({
    title: postWithLocalEdits.title,
    body: postWithLocalEdits.body,
  });

  const openEditModal = useCallback(() => {
    modalBaselineContentRef.current = {
      title: postWithLocalEdits.title,
      body: postWithLocalEdits.body,
    };
    setTitleDraft(postWithLocalEdits.title);
    setBodyDraft(postWithLocalEdits.body);
    setIsEditModalOpen(true);
  }, [postWithLocalEdits.title, postWithLocalEdits.body]);

  const cancelEditModal = useCallback(() => {
    setTitleDraft(modalBaselineContentRef.current.title);
    setBodyDraft(modalBaselineContentRef.current.body);
    setIsEditModalOpen(false);
  }, []);

  const saveEditModal = useCallback(() => {
    upsertEdit(postWithLocalEdits.id, {
      title: titleDraft.trim(),
      body: bodyDraft,
    });
    setIsEditModalOpen(false);
  }, [bodyDraft, postWithLocalEdits.id, titleDraft, upsertEdit]);

  if (isPostHiddenByUser) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p className={styles.hiddenMsg}>
            Esta publicación está oculta en tu sesión.
          </p>
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
        <nav className={styles.nav} aria-label="Migas">
          <Link href="/listado" className={styles.back}>
            ← Listado
          </Link>
        </nav>

        <article
          className={styles.article}
          itemScope
          itemType="https://schema.org/BlogPosting"
        >
          <header className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.title} itemProp="headline">
                {postWithLocalEdits.title}
              </h1>
              <button
                type="button"
                className={styles.editBtn}
                onClick={openEditModal}
              >
                Editar
              </button>
            </div>
            <p className={styles.byline}>
              <span className={styles.metaLabel}>Autor</span>{" "}
              <span itemProp="author" className={styles.metaValue}>
                usuario {postWithLocalEdits.userId}
              </span>
              <span className={styles.dot} aria-hidden />
              <span className={styles.metaLabel}>ID</span>{" "}
              <span className={styles.metaValue}>#{postWithLocalEdits.id}</span>
            </p>
          </header>

          <PostImageCarousel
            postId={postWithLocalEdits.id}
            title={postWithLocalEdits.title}
          />

          <div className={styles.body} itemProp="articleBody">
            {postWithLocalEdits.body
              .split(/\n\s*\n/)
              .filter((paragraphBlock) => paragraphBlock.trim().length > 0)
              .map((paragraphBlock, paragraphIndex) => (
                <p key={paragraphIndex} className={styles.paragraph}>
                  {paragraphBlock.split("\n").map((line, lineIndex, allLines) => (
                    <span key={lineIndex}>
                      {line}
                      {lineIndex < allLines.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              ))}
          </div>
        </article>

        <PostEditModal
          open={isEditModalOpen}
          title={titleDraft}
          body={bodyDraft}
          onTitleChange={setTitleDraft}
          onBodyChange={setBodyDraft}
          onSave={saveEditModal}
          onCancel={cancelEditModal}
        />
      </main>
    </div>
  );
}
