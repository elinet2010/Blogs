import { describe, expect, it } from "vitest";
import type { Post } from "./types";
import { computeVisiblePosts } from "./visible-posts";

const p = (id: number, userId: number, title: string): Post => ({
  id,
  userId,
  title,
  body: "",
});

describe("computeVisiblePosts", () => {
  it("mezcla remotos y locales; local pisa id repetido", () => {
    const out = computeVisiblePosts({
      remotePosts: [p(1, 1, "r")],
      localPosts: [p(1, 1, "local")],
      deletedIds: [],
      editedById: {},
      listUserId: null,
    });
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe("local");
  });

  it("excluye ids borrados", () => {
    const out = computeVisiblePosts({
      remotePosts: [p(1, 1, "a")],
      localPosts: [],
      deletedIds: [1],
      editedById: {},
      listUserId: null,
    });
    expect(out).toHaveLength(0);
  });

  it("filtra por listUserId", () => {
    const out = computeVisiblePosts({
      remotePosts: [p(1, 2, "a"), p(2, 1, "b")],
      localPosts: [],
      deletedIds: [],
      editedById: {},
      listUserId: 1,
    });
    expect(out.map((x) => x.id)).toEqual([2]);
  });

  it("aplica editedById encima del post final", () => {
    const out = computeVisiblePosts({
      remotePosts: [p(1, 1, "orig")],
      localPosts: [],
      deletedIds: [],
      editedById: { 1: { title: "editado" } },
      listUserId: null,
    });
    expect(out[0].title).toBe("editado");
  });
});
