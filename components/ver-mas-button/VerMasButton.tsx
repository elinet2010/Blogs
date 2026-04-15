import Link from "next/link";
import styles from "./VerMasButton.module.css";

export type VerMasButtonProps = {
  variant?: "default" | "cover";
};

export function VerMasButton({ variant = "default" }: VerMasButtonProps) {
  const btnClass =
    variant === "cover" ? `${styles.button} ${styles.buttonCover}` : styles.button;

  return (
    <div className={variant === "cover" ? `${styles.wrap} ${styles.wrapCover}` : styles.wrap}>
      <Link href="/listado" className={btnClass}>
        Ver más
      </Link>
    </div>
  );
}
