import type { ComponentProps } from "react";
import Link from "next/link";
import styles from "./ButtonLink.module.css";

export type ButtonLinkVariant = "primary" | "secondary";

export type ButtonLinkTone = "default" | "inverse";

export type ButtonLinkSize = "medium" | "small";

export type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant: ButtonLinkVariant;
  /**
   * `inverse` = secundario sobre fondo oscuro (mismo contraste que el primary).
   * El primary ya lleva ese tratamiento visual por defecto.
   */
  tone?: ButtonLinkTone;
  /** `small` replica tipografía y padding del enlace en SiteNav. */
  size?: ButtonLinkSize;
};

function mergeButtonLinkClasses(
  variant: ButtonLinkVariant,
  tone: ButtonLinkTone,
  size: ButtonLinkSize,
): string {
  const useInverseSecondary = tone === "inverse" && variant === "secondary";
  const sizeClass = size === "small" ? styles.sizeSmall : styles.sizeMedium;

  if (variant === "primary") {
    return `${styles.root} ${sizeClass} ${styles.primary}`;
  }

  return `${styles.root} ${sizeClass} ${styles.secondary}${useInverseSecondary ? ` ${styles.secondaryInverse}` : ""}`;
}

export function ButtonLink({
  variant,
  tone = "default",
  size = "medium",
  className,
  children,
  ...linkProps
}: ButtonLinkProps) {
  const composedClassName = [
    mergeButtonLinkClasses(variant, tone, size),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link {...linkProps} className={composedClassName}>
      {children}
    </Link>
  );
}
