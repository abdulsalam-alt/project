const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

interface ApiErrorResponse {
  message?: string;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    try {
      const data =
        (await response.json()) as ApiErrorResponse;

      if (data.message) {
        message = data.message;
      }
    } catch {
      // Ignore invalid JSON error responses.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}