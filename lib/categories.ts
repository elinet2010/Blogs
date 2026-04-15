export type Category = {
  slug: string;
  title: string;
  description: string;
  /** JSONPlaceholder: GET /posts?userId=n */
  userId: number;
  /** Imagen de fondo estable por categoría (Picsum por seed) */
  coverImageUrl: string;
};

function picsumCover(slug: string, width = 720, height = 420): string {
  return `https://picsum.photos/seed/blog-cat-${slug}/${width}/${height}`;
}

export const CATEGORIES: readonly Category[] = [
  {
    slug: "vida-digital",
    title: "Vida digital",
    description: "Ideas y reflexiones sobre tecnología en el día a día.",
    userId: 1,
    coverImageUrl: picsumCover("vida-digital"),
  },
  {
    slug: "creatividad",
    title: "Creatividad",
    description: "Proyectos, inspiración y formas de contar historias.",
    userId: 2,
    coverImageUrl: picsumCover("creatividad"),
  },
  {
    slug: "aprendizaje",
    title: "Aprendizaje",
    description: "Notas, recursos y caminos para seguir aprendiendo.",
    userId: 3,
    coverImageUrl: picsumCover("aprendizaje"),
  },
] as const;

export function getCategoryBySlug(slug: string | undefined): Category | undefined {
  if (!slug) return undefined;
  return CATEGORIES.find((c) => c.slug === slug);
}

export function listadoHrefForCategory(slug: string): string {
  return `/listado?categoria=${encodeURIComponent(slug)}`;
}
