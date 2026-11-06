import { FormEvent, useEffect, useState } from "react";
import { api } from "../../api";
import { Category } from "../../types";

export default function AdminCategories() {
  const [list, setList] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const load = () => api<Category[]>("/api/admin/categories", { auth: true }).then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const run = async (fn: () => Promise<unknown>) => { setError(""); try { await fn(); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Error"); } };
  const create = (e: FormEvent) => { e.preventDefault(); run(async () => { await api("/api/admin/categories", { method: "POST", auth: true, body: { name } }); setName(""); }); };

  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Categorías</h1>
      <form onSubmit={create} className="mb-4 flex gap-2">
        <input className="input" placeholder="Nueva categoría" value={name} onChange={(e) => setName(e.target.value)} required />
        <button className="btn-primary">Agregar</button>
      </form>
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="card divide-y divide-gold-light/60">
        {list.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-2 p-3">
            <div><span className="font-semibold">{c.name}</span> <span className="text-xs text-ink/50">({c.products} productos)</span></div>
            <div className="flex gap-1">
              <button className="btn-ghost" onClick={() => { const n = prompt("Nuevo nombre", c.name); if (n?.trim()) run(() => api(`/api/admin/categories/${c.id}`, { method: "PUT", auth: true, body: { name: n } })); }}>Renombrar</button>
              <button className="btn-ghost text-red-600" onClick={() => { if (confirm(`¿Eliminar "${c.name}"? Los productos quedarán sin categoría.`)) run(() => api(`/api/admin/categories/${c.id}`, { method: "DELETE", auth: true })); }}>Eliminar</button>
            </div>
          </div>
        ))}
        {!list.length && <p className="p-4 text-sm text-ink/60">Aún no hay categorías.</p>}
      </div>
    </div>
  );
}
