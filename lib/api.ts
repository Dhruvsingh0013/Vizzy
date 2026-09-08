export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function postJson<T>(
  url: string,
  body: unknown,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    const errorMsg =
      (data && typeof data === "object" && ("error" in data || "message" in data)
        ? (data as { error?: string; message?: string }).error || (data as { error?: string; message?: string }).message
        : null) || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}
