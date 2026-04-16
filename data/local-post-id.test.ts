import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLocalPostNumericId, isLocalOnlyPostId } from "./local-post-id";

describe("local-post-id", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("genera id negativo estable con random fijo", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const id = createLocalPostNumericId();
    expect(id).toBeLessThan(0);
    expect(Number.isInteger(id)).toBe(true);
    expect(isLocalOnlyPostId(id)).toBe(true);
  });

  it("isLocalOnlyPostId distingue enteros negativos", () => {
    expect(isLocalOnlyPostId(-7)).toBe(true);
    expect(isLocalOnlyPostId(0)).toBe(false);
    expect(isLocalOnlyPostId(3)).toBe(false);
    expect(isLocalOnlyPostId(1.5)).toBe(false);
  });
});
