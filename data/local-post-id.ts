/**
 * JSONPlaceholder usa ids enteros positivos (p. ej. 1–100).
 * Los posts creados solo en cliente deben usar ids negativos para no solaparse.
 */
export function createLocalPostNumericId(): number {
  const base = Date.now() % 8_000_000_000;
  const jitter = Math.floor(Math.random() * 1024);
  return -(base * 1024 + jitter);
}

export function isLocalOnlyPostId(postId: number): boolean {
  return Number.isInteger(postId) && postId < 0;
}
