const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getAdminToken = () =>
  localStorage.getItem("admin_token");

export const setAdminToken = (token: string) =>
  localStorage.setItem("admin_token", token);

export const clearAdminToken = () =>
  localStorage.removeItem("admin_token");

export async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Request failed");
  }
  return res.json();
}
