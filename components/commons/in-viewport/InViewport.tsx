"use client";

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./InViewport.module.css";

export type InViewportProps = {
  /** Contenido que solo se monta al intersectar (p. ej. imágenes pesadas) */
  children: ReactNode;
  /** Marcador de altura mientras no es visible (evita saltos de layout) */
  fallback: ReactNode;
  /** Margen extra para empezar a cargar un poco antes de entrar en vista */
  rootMargin?: string;
  className?: string;
};

/**
 * Monta `children` solo cuando el contenedor entra en el viewport,
 * para diferir peticiones (imágenes, etc.).
 */
export function InViewport({
  children,
  fallback,
  rootMargin = "120px",
  className,
}: InViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHasIntersected(true);
        }
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasIntersected, rootMargin]);

  return (
    <div ref={containerRef} className={className ?? styles.wrap}>
      {hasIntersected ? children : fallback}
    </div>
  );
}
