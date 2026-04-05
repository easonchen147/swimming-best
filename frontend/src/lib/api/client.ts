export const clientNavigation = {
  replace(path: string) {
    window.location.replace(path);
  },
};

function shouldRedirectAdminUnauthorized(path: string, response: Response, errorMessage: string) {
  if (typeof window === "undefined") {
    return false;
  }

  if (path === "/api/admin/login") {
    return false;
  }

  return window.location.pathname.startsWith("/admin")
    && path.startsWith("/api/admin/")
    && response.status === 401
    && errorMessage === "unauthorized";
}

async function parseJSON<T>(path: string, response: Response): Promise<T> {
  const rawText = response.status === 204 ? "" : await response.text();
  const hasBody = rawText.trim().length > 0;

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (hasBody) {
      try {
        const data = JSON.parse(rawText) as { error?: string; message?: string };
        errorMessage = data.error || data.message || errorMessage;
      } catch {
        errorMessage = rawText;
      }
    }

    if (shouldRedirectAdminUnauthorized(path, response, errorMessage)) {
      clientNavigation.replace("/admin/login");
      return await new Promise<T>(() => {});
    }

    throw new Error(errorMessage);
  }

  if (!hasBody) {
    return undefined as T;
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new Error("invalid_json_response");
  }
}

export async function apiGet<T>(path: string) {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store",
  });

  return parseJSON<T>(path, response);
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

  return parseJSON<T>(path, response);
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

  return parseJSON<T>(path, response);
}

export async function apiDelete<T>(path: string) {
  const response = await fetch(path, {
    method: "DELETE",
    credentials: "include",
  });

  return parseJSON<T>(path, response);
}
