import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api";

interface S { whatsappNumber: string; instagram: string; tiktok: string; facebook: string; youtube: string }
const empty: S = { whatsappNumber: "", instagram: "", tiktok: "", facebook: "", youtube: "" };

const socials: { key: keyof S; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tu_usuario" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@tu_usuario" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/tu_pagina" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@tu_canal" },
];

export default function AdminSettings() {
  const [f, setF] = useState<S>(empty);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<S>("/api/admin/settings", { auth: true }).then(setF).catch((e) => setError(e.message));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault(); setMsg(""); setError("");
    try {
      setF(await api<S>("/api/admin/settings", { method: "PUT", auth: true, body: f }));
      setMsg("Guardado");
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  }

  return (
    <form onSubmit={save} className="card max-w-md space-y-3 p-5">
      <h1 className="text-2xl font-bold">Ajustes</h1>
      <div>
        <label className="label">WhatsApp de la tienda</label>
        <input className="input" inputMode="numeric" placeholder="Código de país + número, sin + ni espacios" value={f.whatsappNumber} onChange={(e) => setF({ ...f, whatsappNumber: e.target.value })} required />
        <p className="mt-1 text-xs text-ink/60">Los pedidos y consultas se envían a este número.</p>
      </div>
      <h2 className="pt-2 text-lg font-bold">Redes sociales</h2>
      <p className="-mt-2 text-xs text-ink/60">Dejá vacío lo que no uses. Solo se muestran las que completes.</p>
      {socials.map((s) => (
        <div key={s.key}>
          <label className="label">{s.label}</label>
          <input className="input" placeholder={s.placeholder} value={f[s.key]} onChange={(e) => setF({ ...f, [s.key]: e.target.value })} />
        </div>
      ))}
      {msg && <p className="text-sm font-semibold text-green-700">{msg}</p>}
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="btn-primary">Guardar</button>
    </form>
  );
}
