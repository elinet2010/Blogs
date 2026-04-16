import { ButtonLink } from "@/components/commons/button-link/ButtonLink";
import styles from "./VerMasButton.module.css";

export function VerMasButton() {
  return (
    <div className={styles.wrap}>
      <ButtonLink href="/listado" variant="primary">
        Ver más
      </ButtonLink>
    </div>
  );
}
