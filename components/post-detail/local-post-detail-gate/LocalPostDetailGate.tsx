"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { usePostsStore } from "@/store";
import { PostDetail } from "../PostDetail";
import styles from "../PostDetail.module.css";

export type LocalPostDetailGateProps = {
  requestedPostId: number;
};

/**
 * Cuando la API no tiene el post, intenta resolverlo desde `localPosts` tras hidratar el persist de Zustand.
 * Reutiliza {@link PostDetail} para la vista final.
 */
export function LocalPostDetailGate({
  requestedPostId,
}: LocalPostDetailGateProps) {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const markReady = () => setStorageReady(true);
    if (usePostsStore.persist.hasHydrated()) {
      markReady();
      return;
    }
    const unsub = usePostsStore.persist.onFinishHydration(markReady);
    void usePostsStore.persist.rehydrate();
    return unsub;
  }, []);

  const localPost = usePostsStore((state) =>
    state.localPosts.find((post) => post.id === requestedPostId),
  );

  if (!storageReady) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <p className={styles.hiddenMsg} aria-busy="true">
            Cargando publicación…
          </p>
        </main>
      </div>
    );
  }

  if (!localPost) {
    notFound();
  }

  return <PostDetail initialPost={localPost} />;
}
