import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import { Category, Product } from "../types";

export default function Catalog({ offersOnly = false }: { offersOnly?: boolean }) {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const search = sp.get("q") || "";
  const category = sp.get("categoria") || "";

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v); else n.delete(k);
    setSp(n, { replace: true });
  };

  useEffect(() => { api<Category[]>("/api/categories").then(setCats).catch(() => {}); }, []);
  useEffect(() => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (category) qs.set("category", category);
    if (offersOnly) qs.set("offers", "1");
    setLoading(true);
    const t = setTimeout(() => {
      api<Product[]>(`/api/products?${qs}`).then((d) => { setItems(d); setError(""); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [search, category, offersOnly]);

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-brand bg-brand text-white" : "border-gold bg-white hover:bg-brand-light"}`;

  return (
    <div className="container-x py-6">
      <h1 className="mb-4 text-3xl font-bold">{offersOnly ? "Ofertas" : "Catálogo"}</h1>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button className={chip(!category)} onClick={() => set("categoria", "")}>Todos</button>
        {cats.map((c) => (
          <button key={c.id} className={chip(category === c.slug)} onClick={() => set("categoria", c.slug)}>{c.name}</button>
        ))}
      </div>

      <input
        type="search"
        className="input mb-6 py-3"
        placeholder="Buscar productos…"
        value={search}
        onChange={(e) => set("q", e.target.value)}
      />

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="py-12 text-center text-ink/60">Cargando…</p>
      ) : items.length === 0 && !error ? (
        <p className="py-12 text-center text-ink/60">No encontramos productos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
