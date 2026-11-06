import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import { Category, Product } from "../types";

function Section({ title, to, items }: { title: string; to: string; items: Product[] }) {
  if (!items.length) return null;
  return (
    <section className="container-x mt-12">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to={to} className="text-sm font-semibold text-brand hover:underline">Ver todo →</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{items.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </section>
  );
}

export default function Home() {
  const [offers, setOffers] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  useEffect(() => {
    api<Product[]>("/api/products?offers=1").then(setOffers).catch(() => {});
    api<Product[]>("/api/products?featured=1").then(setFeatured).catch(() => {});
    api<Category[]>("/api/categories").then(setCats).catch(() => {});
  }, []);
  return (
    <>
      <section className="container-x flex flex-col items-center py-8 text-center">
        <img src="/logo.jpg" alt="Chingona Beauty - Belleza que empodera" className="w-64 max-w-full rounded-full shadow-lg sm:w-80" />
        <div className="mt-6 flex gap-3">
          <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
          <Link to="/ofertas" className="btn-outline">Ofertas</Link>
        </div>
      </section>
      {cats.length > 0 && (
        <section className="container-x flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <Link key={c.id} to={`/catalogo?categoria=${c.slug}`} className="rounded-full border border-gold bg-white px-4 py-1.5 text-sm font-semibold hover:bg-brand-light">{c.name}</Link>
          ))}
        </section>
      )}
      <Section title="Ofertas" to="/ofertas" items={offers} />
      <Section title="Destacados" to="/catalogo" items={featured} />
    </>
  );
}
