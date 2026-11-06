import { FormEvent, useEffect, useState } from "react";
import { api, imgUrl, money } from "../../api";
import { Category, Product } from "../../types";

interface Form {
  id?: string; name: string; description: string; price: string; offerPrice: string; stock: string;
  active: boolean; featured: boolean; categoryId: string;
  existing: { id: string; url: string }[]; newImages: string[]; removeIds: string[];
}
const empty: Form = { name: "", description: "", price: "", offerPrice: "", stock: "0", active: true, featured: false, categoryId: "", existing: [], newImages: [], removeIds: [] };

async function compress(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82);
}

export default function AdminProducts() {
  const [list, setList] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  const load = () => api<Product[]>("/api/admin/products", { auth: true }).then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); api<Category[]>("/api/categories").then(setCats).catch(() => {}); }, []);

  const edit = (p: Product) => setForm({
    id: p.id, name: p.name, description: p.description, price: String(p.price), offerPrice: p.offerPrice == null ? "" : String(p.offerPrice),
    stock: String(p.stock), active: p.active, featured: p.featured, categoryId: p.categoryId || "", existing: p.images, newImages: [], removeIds: [],
  });

  async function addFiles(files: FileList | null) {
    if (!files || !form) return;
    try {
      const out: string[] = [];
      for (const f of Array.from(files)) out.push(await compress(f));
      setForm((f) => (f ? { ...f, newImages: [...f.newImages, ...out] } : f));
    } catch { setFormError("No se pudo leer una de las imágenes"); }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true); setFormError("");
    const body = {
      name: form.name, description: form.description, price: Number(form.price),
      offerPrice: form.offerPrice === "" ? null : Number(form.offerPrice),
      stock: Math.floor(Number(form.stock)), active: form.active, featured: form.featured,
      categoryId: form.categoryId || null, newImages: form.newImages, removeImageIds: form.removeIds,
    };
    try {
      await api(form.id ? `/api/admin/products/${form.id}` : "/api/admin/products", { method: form.id ? "PUT" : "POST", auth: true, body });
      setForm(null); await load();
    } catch (err) { setFormError(err instanceof Error ? err.message : "Error"); }
    finally { setBusy(false); }
  }

  async function del(p: Product) {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    try { await api(`/api/admin/products/${p.id}`, { method: "DELETE", auth: true }); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
  }

  const shown = list.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()));
  const up = (patch: Partial<Form>) => setForm((f) => (f ? { ...f, ...patch } : f));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">Productos</h1>
        <input className="input w-48" placeholder="Filtrar…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button className="btn-primary" onClick={() => { setFormError(""); setForm({ ...empty }); }}>+ Nuevo producto</button>
      </div>
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="card divide-y divide-gold-light/60">
        {shown.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            <img src={p.images[0] ? imgUrl(p.images[0].url) : "/logo.jpg"} alt="" className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.name} {!p.active && <span className="ml-1 rounded bg-ink/10 px-1.5 text-xs">Oculto</span>}</p>
              <p className="text-xs text-ink/60">
                {p.offerPrice != null ? <><b className="text-brand">{money(p.offerPrice)}</b> <s>{money(p.price)}</s></> : money(p.price)} · Stock: <b className={p.stock < 1 ? "text-red-600" : ""}>{p.stock}</b> · {p.category?.name || "Sin categoría"}
              </p>
            </div>
            <button className="btn-ghost" onClick={() => { setFormError(""); edit(p); }}>Editar</button>
            <button className="btn-ghost text-red-600" onClick={() => del(p)}>Eliminar</button>
          </div>
        ))}
        {!shown.length && <p className="p-4 text-sm text-ink/60">No hay productos.</p>}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={save} className="card my-4 w-full max-w-xl space-y-3 p-5">
            <h2 className="text-xl font-bold">{form.id ? "Editar producto" : "Nuevo producto"}</h2>
            <div><label className="label">Nombre</label><input className="input" required value={form.name} onChange={(e) => up({ name: e.target.value })} /></div>
            <div><label className="label">Descripción</label><textarea className="input" rows={3} value={form.description} onChange={(e) => up({ description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="label">Precio</label><input type="number" min="0" step="0.01" className="input" required value={form.price} onChange={(e) => up({ price: e.target.value })} /></div>
              <div><label className="label">Oferta</label><input type="number" min="0" step="0.01" className="input" placeholder="Sin oferta" value={form.offerPrice} onChange={(e) => up({ offerPrice: e.target.value })} /></div>
              <div><label className="label">Stock</label><input type="number" min="0" step="1" className="input" required value={form.stock} onChange={(e) => up({ stock: e.target.value })} /></div>
            </div>
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={form.categoryId} onChange={(e) => up({ categoryId: e.target.value })}>
                <option value="">Sin categoría</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-5 text-sm font-semibold">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => up({ active: e.target.checked })} /> Visible en tienda</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => up({ featured: e.target.checked })} /> Destacado</label>
            </div>
            <div>
              <label className="label">Fotografías</label>
              <div className="flex flex-wrap gap-2">
                {form.existing.filter((i) => !form.removeIds.includes(i.id)).map((i) => (
                  <div key={i.id} className="relative"><img src={imgUrl(i.url)} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    <button type="button" className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-600 text-xs text-white" onClick={() => up({ removeIds: [...form.removeIds, i.id] })}>✕</button></div>
                ))}
                {form.newImages.map((src, idx) => (
                  <div key={idx} className="relative"><img src={src} alt="" className="h-20 w-20 rounded-lg object-cover ring-2 ring-brand" />
                    <button type="button" className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-600 text-xs text-white" onClick={() => up({ newImages: form.newImages.filter((_, k) => k !== idx) })}>✕</button></div>
                ))}
              </div>
              <input type="file" accept="image/*" multiple className="mt-2 text-sm" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              <p className="mt-1 text-xs text-ink/60">Se optimizan automáticamente. Máximo 8 nuevas por guardado.</p>
            </div>
            {formError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancelar</button>
              <button className="btn-primary" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
