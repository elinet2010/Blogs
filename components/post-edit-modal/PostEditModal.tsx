"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./PostEditModal.module.css";

export type PostEditModalProps = {
  open: boolean;
  title: string;
  body: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function PostEditModal({
  open,
  title,
  body,
  onTitleChange,
  onBodyChange,
  onSave,
  onCancel,
}: PostEditModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    lastActiveRef.current = document.activeElement as HTMLElement | null;

    const handleDocumentKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") {
        keyboardEvent.preventDefault();
        onCancel();
      }
    };

    document.addEventListener("keydown", handleDocumentKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleDocumentKeyDown);
      document.body.style.overflow = prevOverflow;
      lastActiveRef.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onCancel();
      }}
    >
      <div
        ref={panelRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <div className={styles.head}>
          <h2 id={titleId} className={styles.heading}>
            Editar publicación
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Cerrar sin guardar"
          >
            ×
          </button>
        </div>

        <p className={styles.hint}>
          Los cambios se guardan solo en tu navegador (Zustand + localStorage).
        </p>

        <div className={styles.fields}>
          <label className={styles.label} htmlFor="modal-post-title">
            Título
          </label>
          <input
            id="modal-post-title"
            className={styles.input}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />

          <label className={styles.label} htmlFor="modal-post-body">
            Cuerpo
          </label>
          <textarea
            id="modal-post-body"
            className={styles.textarea}
            rows={12}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btnGhost} onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className={styles.btnPrimary} onClick={onSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
