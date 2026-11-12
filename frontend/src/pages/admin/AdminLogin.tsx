import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setToken } from "../../api";
import { useNoIndex } from "../../noindex";

export default function AdminLogin() {
  useNoIndex();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const { token } = await api<{ token: string }>("/api/auth/login", { method: "POST", body: { email, password } });
      setToken(token);
      nav("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setBusy(false); }
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3 p-6">
        <img src="/logo.jpg" alt="Chingona Beauty" className="mx-auto h-32 w-32 rounded-full object-cover" />
        <h1 className="text-center text-xl font-bold">Panel administrativo</h1>
        <div><label className="label">Correo</label><input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Contraseña</label><input type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Ingresando…" : "Ingresar"}</button>
        <Link to="/" className="btn-ghost w-full">← Volver a la tienda</Link>
      </form>
    </div>
  );
}
