async function parseJSON<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        errorMessage = data.error;
      }
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(path: string) {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store",
  });

  return parseJSON<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseJSON<T>(response);
}

export async function apiPatch<T>(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseJSON<T>(response);
}

export async function apiDelete<T>(path: string) {
  const response = await fetch(path, {
    method: "DELETE",
    credentials: "include",
  });

  return parseJSON<T>(response);
}
