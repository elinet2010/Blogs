import { describe, expect, it } from "vitest";
import type { Post } from "./types";
import type { SortOption } from "./post-filters";
import {
  parseAuthorParam,
  parseSortParam,
  sortPosts,
} from "./post-filters";

const sample: Post[] = [
  { id: 2, userId: 1, title: "B", body: "b" },
  { id: 1, userId: 1, title: "A", body: "a" },
];

describe("post-filters", () => {
  it("parseSortParam acepta valores válidos y rechaza inválidos", () => {
    expect(parseSortParam(null)).toBe("");
    expect(parseSortParam("")).toBe("");
    expect(parseSortParam("titulo-asc")).toBe("titulo-asc");
    expect(parseSortParam("no-existe")).toBe("");
  });

  it("parseAuthorParam valida rango 1–10", () => {
    expect(parseAuthorParam(null)).toBeNull();
    expect(parseAuthorParam("5")).toBe(5);
    expect(parseAuthorParam("0")).toBeNull();
    expect(parseAuthorParam("11")).toBeNull();
    expect(parseAuthorParam("x")).toBeNull();
  });

  it("sortPosts sin orden devuelve la misma referencia", () => {
    expect(sortPosts(sample, "")).toBe(sample);
  });

  it("sortPosts ordena por título e id", () => {
    const byTitleAsc = sortPosts([...sample], "titulo-asc").map((p) => p.id);
    expect(byTitleAsc).toEqual([1, 2]);
    const byTitleDesc = sortPosts([...sample], "titulo-desc").map((p) => p.id);
    expect(byTitleDesc).toEqual([2, 1]);
    const byIdAsc = sortPosts([...sample], "id-asc").map((p) => p.id);
    expect(byIdAsc).toEqual([1, 2]);
    const byIdDesc = sortPosts([...sample], "id-desc").map((p) => p.id);
    expect(byIdDesc).toEqual([2, 1]);
  });

  it("sortPosts default devuelve el array original si sort no matchea switch", () => {
    const copy = [...sample];
    const result = sortPosts(copy, "invalid" as unknown as SortOption);
    expect(result).toBe(copy);
  });
});
