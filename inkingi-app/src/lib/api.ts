import { API_BASE_URL, authClient } from "./auth-client";

type ApiOptions = RequestInit & {
  json?: unknown;
};

const getHeaders = (options?: ApiOptions) => {
  const headers = new Headers(options?.headers);
  const cookie = authClient.getCookie();

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  if (options?.json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
};

export const apiRequest = async <T,>(path: string, options: ApiOptions = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "omit",
    headers: getHeaders(options),
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
};

export const apiGet = <T,>(path: string) => apiRequest<T>(path);

export const apiPost = <T,>(path: string, json?: unknown) =>
  apiRequest<T>(path, { method: "POST", json });

export const apiPatch = <T,>(path: string, json?: unknown) =>
  apiRequest<T>(path, { method: "PATCH", json });

export const apiPut = <T,>(path: string, json?: unknown) =>
  apiRequest<T>(path, { method: "PUT", json });
