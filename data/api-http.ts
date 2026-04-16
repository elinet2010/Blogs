/** Errores HTTP de API con mensaje listo para mostrar al usuario. */
export class ApiHttpError extends Error {
  readonly status: number;
  readonly statusText: string;

  constructor(message: string, status: number, statusText: string) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.statusText = statusText;
  }
}

const DEFAULT_TIMEOUT_MS = 25_000;

function mapHttpStatusToUserMessage(status: number): string {
  if (status === 401) return "No autorizado. Revisá credenciales o sesión.";
  if (status === 403) return "Acceso denegado.";
  if (status === 404) return "Recurso no encontrado.";
  if (status === 408 || status === 504)
    return "El servidor tardó demasiado en responder.";
  if (status === 429) return "Demasiadas solicitudes. Esperá un momento e intentá de nuevo.";
  if (status >= 500) return "Error en el servidor. Intentá más tarde.";
  if (status >= 400) return "La solicitud no pudo procesarse.";
  return `Error HTTP ${status}.`;
}

async function readErrorBodySummary(response: Response): Promise<string | null> {
  const raw = await response.text();
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const candidate =
      parsed.message ??
      parsed.error ??
      parsed.title ??
      parsed.detail ??
      (typeof parsed.errors === "object" && parsed.errors !== null
        ? JSON.stringify(parsed.errors)
        : null);
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim().slice(0, 280);
    }
  } catch {
    return raw.trim().slice(0, 280);
  }
  return raw.trim().slice(0, 280);
}

export type ApiFetchJsonOptions = {
  /** Por defecto 25 s. */
  timeoutMs?: number;
};

/**
 * `fetch` + timeout + mensajes claros en fallos de red, HTTP y JSON inválido.
 */
export async function apiFetchJson<T>(
  input: string | URL,
  init: RequestInit | undefined,
  options?: ApiFetchJsonOptions,
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const externalSignal = init?.signal;
  const timeoutSignal =
    typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
      ? AbortSignal.timeout(timeoutMs)
      : undefined;

  const signal =
    externalSignal && timeoutSignal
      ? AbortSignal.any([externalSignal, timeoutSignal])
      : externalSignal ?? timeoutSignal;

  let response: Response;
  try {
    response = await fetch(input, { ...init, signal });
  } catch (caughtError: unknown) {
    if (caughtError instanceof Error) {
      if (caughtError.name === "AbortError") {
        throw new Error(
          "La solicitud superó el tiempo de espera o fue cancelada. Verificá tu conexión e intentá de nuevo.",
        );
      }
      if (
        caughtError.name === "TypeError" &&
        /fetch|network|failed|load/i.test(caughtError.message)
      ) {
        throw new Error(
          "No se pudo conectar con el servidor. Comprobá tu conexión a internet.",
        );
      }
    }
    throw caughtError instanceof Error
      ? caughtError
      : new Error("Error de red desconocido.");
  }

  if (!response.ok) {
    const base = mapHttpStatusToUserMessage(response.status);
    let detail: string | null = null;
    try {
      detail = await readErrorBodySummary(response);
    } catch {
      detail = null;
    }
    const message = detail ? `${base} ${detail}` : base;
    throw new ApiHttpError(message, response.status, response.statusText);
  }

  const text = await response.text();
  if (!text.trim()) {
    throw new Error("El servidor devolvió una respuesta vacía.");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("La respuesta no es JSON válido.");
  }
}

/** Convierte cualquier error de `fetch` / API en mensaje seguro para UI. */
export function getUserMessageFromUnknownError(error: unknown): string {
  if (error instanceof ApiHttpError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Ocurrió un error inesperado. Intentá de nuevo.";
}
