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
  const sort = sp.get("orden") || "";
  const minPrice = sp.get("min") || "";
  const maxPrice = sp.get("max") || "";
  const inStock = sp.get("stock") === "1";

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
    if (sort) qs.set("sort", sort);
    if (minPrice) qs.set("minPrice", minPrice);
    if (maxPrice) qs.set("maxPrice", maxPrice);
    if (inStock) qs.set("inStock", "1");
    if (offersOnly) qs.set("offers", "1");
    setLoading(true);
    const t = setTimeout(() => {
      api<Product[]>(`/api/products?${qs}`).then((d) => { setItems(d); setError(""); }).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [search, category, sort, minPrice, maxPrice, inStock, offersOnly]);

  return (
    <div className="container-x py-6">
      <h1 className="mb-4 text-3xl font-bold">{offersOnly ? "Ofertas" : "Catálogo"}</h1>
      <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="label">Buscar</label>
          <input className="input" placeholder="Labial, base, sérum…" value={search} onChange={(e) => set("q", e.target.value)} />
        </div>
        <div>
          <label className="label">Categoría</label>
          <select className="input" value={category} onChange={(e) => set("categoria", e.target.value)}>
            <option value="">Todas</option>
            {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Ordenar</label>
          <select className="input" value={sort} onChange={(e) => set("orden", e.target.value)}>
            <option value="">Más nuevos</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div><label className="label">Mín.</label><input type="number" min="0" className="input" value={minPrice} onChange={(e) => set("min", e.target.value)} /></div>
          <div><label className="label">Máx.</label><input type="number" min="0" className="input" value={maxPrice} onChange={(e) => set("max", e.target.value)} /></div>
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold">
          <input type="checkbox" checked={inStock} onChange={(e) => set("stock", e.target.checked ? "1" : "")} /> Solo con stock
        </label>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? <p className="py-12 text-center text-ink/60">Cargando…</p> : items.length === 0 && !error ? (
        <p className="py-12 text-center text-ink/60">No encontramos productos con esos filtros.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
