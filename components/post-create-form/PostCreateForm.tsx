"use client";

import { useCallback, useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { JSON_PLACEHOLDER_AUTHOR_USER_IDS } from "@/data/post-filters";
import { usePostsStore } from "@/store";
import { getUserMessageFromUnknownError } from "@/data/api-http";
import { ButtonLink } from "@/components/commons/button-link/ButtonLink";
import editStyles from "@/components/post-edit-modal/PostEditModal.module.css";
import listStyles from "@/components/posts-list/PostsList.module.css";

export function PostCreateForm() {
  const router = useRouter();
  const titleFieldId = useId();
  const bodyFieldId = useId();
  const authorFieldId = useId();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [userId, setUserId] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        setValidationError("El título es obligatorio.");
        return;
      }
      setValidationError(null);
      setApiError(null);

      setIsSubmitting(true);
      try {
        const localId = await usePostsStore.getState().createPostWithApi({
          title: trimmedTitle,
          body: body.trim() || "",
          userId,
        });
        router.push(`/listado/${localId}`);
      } catch (caughtError: unknown) {
        setApiError(getUserMessageFromUnknownError(caughtError));
      } finally {
        setIsSubmitting(false);
      }
    },
    [body, router, title, userId],
  );

  return (
    <form
      className={listStyles.card}
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={
        [validationError && "new-post-error", apiError && "new-post-api-error"]
          .filter(Boolean)
          .join(" ") || undefined
      }
    >
      <p className={editStyles.hint}>
        Primero se envía un <strong>POST</strong> a JSONPlaceholder (petición real). La copia que
        ves en el listado y el detalle se guarda con <strong>Zustand + localStorage</strong> (id
        local negativo, porque la API no persiste en el servidor).
      </p>

      {validationError ? (
        <p id="new-post-error" className={editStyles.hint} role="alert">
          {validationError}
        </p>
      ) : null}

      {apiError ? (
        <p id="new-post-api-error" className={editStyles.hint} role="alert">
          {apiError}
        </p>
      ) : null}

      <div className={editStyles.fields}>
        <label className={editStyles.label} htmlFor={authorFieldId}>
          Autor (userId)
        </label>
        <select
          id={authorFieldId}
          className={editStyles.input}
          value={userId}
          onChange={(event) => setUserId(Number(event.target.value))}
        >
          {JSON_PLACEHOLDER_AUTHOR_USER_IDS.map((id) => (
            <option key={id} value={id}>
              Usuario {id}
            </option>
          ))}
        </select>

        <label className={editStyles.label} htmlFor={titleFieldId}>
          Título
        </label>
        <input
          id={titleFieldId}
          className={editStyles.input}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
          required
        />

        <label className={editStyles.label} htmlFor={bodyFieldId}>
          Cuerpo
        </label>
        <textarea
          id={bodyFieldId}
          className={editStyles.textarea}
          rows={12}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </div>

      <div className={editStyles.footer}>
        <ButtonLink href="/listado" variant="secondary" aria-disabled={isSubmitting}>
          Cancelar
        </ButtonLink>
        <button
          type="submit"
          className={editStyles.btnPrimary}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando…" : "Guardar y ver"}
        </button>
      </div>
    </form>
  );
}
