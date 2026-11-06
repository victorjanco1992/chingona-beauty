import { FormEvent, useEffect, useState } from "react";
import { api } from "../api";

export default function ContactPage() {
  const [wa, setWa] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<{ whatsappNumber: string }>("/api/settings").then((s) => setWa(s.whatsappNumber)).catch(() => setWa(""));
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!wa) return;
    const text = `Hola Chingona Beauty! Soy ${name.trim()}.\n\n${message.trim()}`;
    window.location.href = `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
  }

  return (
    <div className="container-x max-w-xl py-8">
      <h1 className="mb-2 text-3xl font-bold">Contacto</h1>
      <p className="mb-6 text-ink/70">Escribinos tu consulta y te respondemos por WhatsApp.</p>
      <form onSubmit={submit} className="card space-y-3 p-5">
        <div>
          <label className="label">Tu nombre</label>
          <input className="input" required minLength={2} maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Tu consulta</label>
          <textarea className="input" rows={5} required minLength={3} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        {wa === "" && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">El WhatsApp de la tienda todavía no está configurado.</p>}
        <button className="btn-primary w-full py-3" disabled={!wa}>Enviar consulta por WhatsApp</button>
      </form>
    </div>
  );
}
