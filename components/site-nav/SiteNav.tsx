import Link from "next/link";
import styles from "./SiteNav.module.css";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/listado", label: "Publicaciones" },
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
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={styles.link}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
