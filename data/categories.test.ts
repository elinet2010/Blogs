import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  getCategoryBySlug,
  listadoHrefForCategory,
} from "./categories";

describe("categories", () => {
  it("getCategoryBySlug con slug vacío o desconocido", () => {
    expect(getCategoryBySlug(undefined)).toBeUndefined();
    expect(getCategoryBySlug("")).toBeUndefined();
    expect(getCategoryBySlug("no-existe")).toBeUndefined();
  });

  it("getCategoryBySlug encuentra categoría", () => {
    const cat = getCategoryBySlug("vida-digital");
    expect(cat?.title).toBe("Vida digital");
    expect(cat?.coverImageUrl).toContain("picsum");
  });

  it("CATEGORIES tiene slugs únicos", () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });

  it("listadoHrefForCategory codifica el slug", () => {
    expect(listadoHrefForCategory("vida-digital")).toBe(
      "/listado?categoria=vida-digital",
    );
  });
});
