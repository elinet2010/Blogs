"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import {
  POST_DETAIL_CAROUSEL_SLIDE_COUNT,
  POST_DETAIL_IMAGE_HEIGHT_PX,
  POST_DETAIL_IMAGE_WIDTH_PX,
  buildPostDetailCarouselImageUrl,
} from "@/data/post-images";
import styles from "./PostImageCarousel.module.css";

export type PostImageCarouselProps = {
  postId: number;
  title: string;
};

export function PostImageCarousel({ postId, title }: PostImageCarouselProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const changeSlideByDirection = useCallback(
    (direction: -1 | 1) => {
      setActiveSlideIndex((currentIndex) => {
        const wrappedIndex =
          (currentIndex + direction + POST_DETAIL_CAROUSEL_SLIDE_COUNT) %
          POST_DETAIL_CAROUSEL_SLIDE_COUNT;
        return wrappedIndex;
      });
    },
    [],
  );

  return (
    <div className={styles.carousel}>
      <div className={styles.viewport}>
        <Image
          key={activeSlideIndex}
          src={buildPostDetailCarouselImageUrl(postId, activeSlideIndex)}
          alt={`Fotografía de apoyo ${activeSlideIndex + 1} de ${POST_DETAIL_CAROUSEL_SLIDE_COUNT} para esta entrada`}
          width={POST_DETAIL_IMAGE_WIDTH_PX}
          height={POST_DETAIL_IMAGE_HEIGHT_PX}
          className={styles.image}
          sizes="(max-width: 720px) 100vw, min(720px, 85vw)"
          priority={activeSlideIndex === 0}
          loading={activeSlideIndex === 0 ? undefined : "lazy"}
          decoding="async"
          draggable={false}
        />
      </div>
      <p className={styles.caption}>
        Imagen {activeSlideIndex + 1} de {POST_DETAIL_CAROUSEL_SLIDE_COUNT} ·
        galería ilustrativa para «{title.slice(0, 48)}
        {title.length > 48 ? "…" : ""}»
      </p>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => changeSlideByDirection(-1)}
          aria-label="Imagen anterior"
        >
          ‹
        </button>
        <div className={styles.dots} role="tablist" aria-label="Seleccionar imagen">
          {Array.from(
            { length: POST_DETAIL_CAROUSEL_SLIDE_COUNT },
            (_, slideDotIndex) => (
              <button
                key={slideDotIndex}
                type="button"
                role="tab"
                aria-selected={slideDotIndex === activeSlideIndex}
                aria-label={`Imagen ${slideDotIndex + 1}`}
                className={
                  slideDotIndex === activeSlideIndex
                    ? styles.dotActive
                    : styles.dot
                }
                onClick={() => setActiveSlideIndex(slideDotIndex)}
              />
            ),
          )}
        </div>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => changeSlideByDirection(1)}
          aria-label="Imagen siguiente"
        >
          ›
        </button>
      </div>
    </div>
  );
}
