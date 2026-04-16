import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPostViaApi,
  fetchPostById,
  fetchPostsPage,
} from "./api-posts";

describe("api-posts", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetchPostsPage añade userId al query cuando el filtro está definido", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("[]", { status: 200, statusText: "OK" }),
    );
    await fetchPostsPage(0, 5, 4);
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain("userId=4");
  });

  it("fetchPostsPage pasa cache a fetch cuando options lo define", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("[]", { status: 200, statusText: "OK" }),
    );
    await fetchPostsPage(0, 10, undefined, { cache: "no-store" });
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit | undefined;
    expect(init?.cache).toBe("no-store");
  });

  it("fetchPostsPage delega en apiFetchJson vía fetch", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: 1, userId: 1, title: "t", body: "b" }]), {
        status: 200,
        statusText: "OK",
      }),
    );
    const posts = await fetchPostsPage(0, 10, 1);
    expect(posts).toHaveLength(1);
    expect(posts[0].id).toBe(1);
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain("_start=0");
    expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain("userId=1");
  });

  it("fetchPostById devuelve null en 404", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 404, statusText: "Not Found" }),
    );
    await expect(fetchPostById(999)).resolves.toBeNull();
  });

  it("fetchPostById devuelve post en 200", async () => {
    const post = { id: 1, userId: 1, title: "t", body: "b" };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(post), { status: 200, statusText: "OK" }),
    );
    await expect(fetchPostById(1)).resolves.toEqual(post);
  });

  it("fetchPostById lanza si status no ok distinto de 404", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 503, statusText: "x" }),
    );
    await expect(fetchPostById(1)).rejects.toThrow("503");
  });

  it("createPostViaApi envía POST y parsea respuesta", async () => {
    const created = { id: 101, userId: 2, title: "n", body: "c" };
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(created), { status: 201, statusText: "Created" }),
    );
    await expect(
      createPostViaApi({ title: "n", body: "c", userId: 2 }),
    ).resolves.toEqual(created);
    const init = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
  });
});
