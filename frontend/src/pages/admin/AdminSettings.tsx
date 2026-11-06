import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api";

export default function AdminSettings() {
  const [wa, setWa] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { api<{ whatsappNumber: string }>("/api/admin/settings", { auth: true }).then((s) => setWa(s.whatsappNumber)).catch((e) => setError(e.message)); }, []);
  async function save(e: FormEvent) {
    e.preventDefault(); setMsg(""); setError("");
    try { const s = await api<{ whatsappNumber: string }>("/api/admin/settings", { method: "PUT", auth: true, body: { whatsappNumber: wa } }); setWa(s.whatsappNumber); setMsg("Guardado"); }
    catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  }
  return (
    <form onSubmit={save} className="card max-w-md space-y-3 p-5">
      <h1 className="text-2xl font-bold">Ajustes</h1>
      <div>
        <label className="label">WhatsApp de la tienda</label>
        <input className="input" inputMode="numeric" placeholder="Código de país + número, sin + ni espacios" value={wa} onChange={(e) => setWa(e.target.value)} required />
        <p className="mt-1 text-xs text-ink/60">Los pedidos del carrito se envían a este número.</p>
      </div>
      {msg && <p className="text-sm font-semibold text-green-700">{msg}</p>}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="btn-primary">Guardar</button>
    </form>
  );
}
