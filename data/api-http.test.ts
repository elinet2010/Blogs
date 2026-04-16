import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiHttpError,
  apiFetchJson,
  getUserMessageFromUnknownError,
} from "./api-http";

describe("api-http", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("apiFetchJson combina señal externa con timeout cuando ambos existen", async () => {
    const ac = new AbortController();
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ x: 1 }), { status: 200, statusText: "OK" }),
    );
    await apiFetchJson("https://x.test", { signal: ac.signal }, { timeoutMs: 60_000 });
    expect(vi.mocked(fetch).mock.calls[0][1]?.signal).toBeDefined();
  });

  it("apiFetchJson parsea JSON en respuesta ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ a: 1 }), {
        status: 200,
        statusText: "OK",
      }),
    );
    await expect(apiFetchJson<{ a: number }>("https://x.test", undefined)).resolves.toEqual({
      a: 1,
    });
  });

  it("apiFetchJson rechaza cuerpo vacío", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("", { status: 200, statusText: "OK" }),
    );
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toThrow(
      "respuesta vacía",
    );
  });

  it("apiFetchJson rechaza JSON inválido", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("not-json", { status: 200, statusText: "OK" }),
    );
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toThrow(
      "no es JSON válido",
    );
  });

  it("apiFetchJson lanza ApiHttpError con detalle de cuerpo JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "detalle" }), {
        status: 400,
        statusText: "Bad Request",
      }),
    );
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toMatchObject({
      name: "ApiHttpError",
      status: 400,
    });
  });

  it("apiFetchJson usa mensaje genérico para códigos <400 en error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 302, statusText: "Found" }),
    );
    try {
      await apiFetchJson("https://x.test", undefined);
      expect.fail("debería lanzar");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiHttpError);
      expect(String((e as ApiHttpError).message)).toContain("302");
    }
  });

  it("apiFetchJson mapea distintos códigos HTTP", async () => {
    const codes = [401, 403, 404, 408, 504, 429, 500, 418] as const;
    for (const status of codes) {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(null, { status, statusText: "x" }),
      );
      try {
        await apiFetchJson("https://x.test", undefined);
        expect.fail("debería lanzar");
      } catch (e) {
        expect(e).toBeInstanceOf(ApiHttpError);
      }
    }
  });

  it("apiFetchJson si readErrorBodySummary falla usa solo mensaje base", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      text: () => Promise.reject(new Error("read fail")),
    } as unknown as Response);
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toBeInstanceOf(
      ApiHttpError,
    );
  });

  it("apiFetchJson maneja cuerpo de error no JSON con texto plano", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("plain error", { status: 502, statusText: "Bad Gateway" }),
    );
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toBeInstanceOf(
      ApiHttpError,
    );
  });

  it("apiFetchJson con JSON sin campos string útil devuelve cuerpo recortado", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: null }), {
        status: 400,
        statusText: "Bad Request",
      }),
    );
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toBeInstanceOf(
      ApiHttpError,
    );
  });

  it("apiFetchJson maneja error JSON con campo errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: { a: "x" } }), {
        status: 422,
        statusText: "x",
      }),
    );
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toBeInstanceOf(
      ApiHttpError,
    );
  });

  it("apiFetchJson propagó AbortError como mensaje claro", async () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    vi.mocked(fetch).mockRejectedValueOnce(err);
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toThrow(
      "tiempo de espera",
    );
  });

  it("apiFetchJson mapea TypeError de red", async () => {
    const err = new TypeError("Failed to fetch");
    vi.mocked(fetch).mockRejectedValueOnce(err);
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toThrow(
      "conectar",
    );
  });

  it("apiFetchJson relanza TypeError que no parece fallo de red", async () => {
    const err = new TypeError("other");
    vi.mocked(fetch).mockRejectedValueOnce(err);
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toThrow("other");
  });

  it("apiFetchJson relanza Error genérico", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("otro"));
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toThrow("otro");
  });

  it("apiFetchJson lanza Error de red desconocido si fetch no lanza Error", async () => {
    vi.mocked(fetch).mockRejectedValueOnce("string");
    await expect(apiFetchJson("https://x.test", undefined)).rejects.toThrow(
      "desconocido",
    );
  });

  it("getUserMessageFromUnknownError cubre ApiHttpError, Error y resto", () => {
    expect(
      getUserMessageFromUnknownError(new ApiHttpError("m", 400, "x")),
    ).toBe("m");
    expect(getUserMessageFromUnknownError(new Error("e"))).toBe("e");
    expect(getUserMessageFromUnknownError({})).toBe(
      "Ocurrió un error inesperado. Intentá de nuevo.",
    );
  });
});
