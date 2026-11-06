const BASE = ((import.meta.env.VITE_API_URL as string | undefined) || "").replace(/\/$/, "");
const CURRENCY = (import.meta.env.VITE_CURRENCY as string | undefined) || "ARS";
const LOCALE = (import.meta.env.VITE_LOCALE as string | undefined) || "es-AR";

const fmt = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 });
export const money = (n: number) => fmt.format(n);
export const imgUrl = (u: string) => BASE + u;

const TOKEN_KEY = "cb_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export async function api<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.auth) headers.Authorization = `Bearer ${getToken() ?? ""}`;
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method: opts.method || "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && opts.auth) {
      setToken(null);
      if (!location.pathname.endsWith("/login")) location.href = "/admin/login";
    }
    throw new Error((data as { error?: string }).error || "Error inesperado");
  }
  return data as T;
}
