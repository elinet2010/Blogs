import type { Metadata } from "next";
import Link from "next/link";
import { PostCreateForm } from "@/components/post-create-form/PostCreateForm";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Nueva publicación",
  description:
    "Creá un post: POST a JSONPlaceholder y copia persistente con Zustand en el navegador.",
};

export default function NuevoPostPage() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav className={styles.nav}>
          <Link href="/listado" className={styles.back}>
            ← Listado
          </Link>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Nueva publicación</h1>
          <p className={styles.subtitle}>
            Al guardar se hace un POST real a JSONPlaceholder y, si responde bien, se guarda una copia
            en tu navegador (Zustand + localStorage) para listado y detalle.
          </p>
        </header>

        <PostCreateForm />
      </main>
    </div>
  );
}
