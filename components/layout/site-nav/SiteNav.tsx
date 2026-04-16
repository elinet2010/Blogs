import Link from "next/link";
import styles from "./SiteNav.module.css";
import { ButtonLink } from "@/components/commons/button-link/ButtonLink";

const PRIMARY_NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/listado", label: "Publicaciones" },
  { href: "/listado/nuevo", label: "Nueva" },
] as const;

export function SiteNav() {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Ir al inicio">
          <span className={styles.brandMark} aria-hidden />
          <span className={styles.brandText}>Lectura</span>
        </Link>
        <nav className={styles.nav} aria-label="Principal">
          <ul className={styles.list}>
            {PRIMARY_NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <ButtonLink href={href} variant="secondary" size="small">
                  {label}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
