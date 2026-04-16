import { describe, expect, it } from "vitest";
import { POSTS_LIST_PAGE_SIZE } from "./list-pagination";

describe("list-pagination", () => {
  it("expone tamaño de página alineado con JSONPlaceholder", () => {
    expect(POSTS_LIST_PAGE_SIZE).toBe(25);
  });
});
