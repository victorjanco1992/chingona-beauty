import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, imgUrl, money } from "../api";
import { useCart } from "../cart";
import { Product } from "../types";

export default function ProductPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [idx, setIdx] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api<Product>(`/api/products/${slug}`).then((d) => { setP(d); setIdx(0); setQty(1); }).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <div className="container-x py-20 text-center"><p>{error}</p><Link to="/" className="btn-primary mt-4">Volver al catálogo</Link></div>;
  if (!p) return <p className="py-20 text-center text-ink/60">Cargando…</p>;
  const out = p.stock < 1;
  return (
    <div className="container-x grid gap-8 py-8 md:grid-cols-2">
      <div>
        <div className="card aspect-square overflow-hidden">
          {p.images[idx] ? <img src={imgUrl(p.images[idx].url)} alt={p.name} className="h-full w-full object-cover" /> : <img src="/logo.jpg" alt="" className="h-full w-full object-contain p-10 opacity-30" />}
        </div>
        {p.images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {p.images.map((im, i) => (
              <button key={im.id} onClick={() => setIdx(i)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === idx ? "border-brand" : "border-transparent"}`}>
                <img src={imgUrl(im.url)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        {p.category && <Link to={`/?categoria=${p.category.slug}`} className="text-xs font-semibold uppercase tracking-wide text-gold">{p.category.name}</Link>}
        <h1 className="mt-1 text-3xl font-bold">{p.name}</h1>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-brand">{money(p.offerPrice ?? p.price)}</span>
          {p.offerPrice != null && <span className="text-lg text-ink/50 line-through">{money(p.price)}</span>}
        </div>
        <p className="mt-2 text-sm font-semibold">{out ? <span className="text-red-600">Agotado</span> : p.stock <= 5 ? <span className="text-brand">¡Últimas {p.stock} unidades!</span> : <span className="text-green-700">Disponible</span>}</p>
        {p.description && <p className="mt-4 whitespace-pre-line text-ink/80">{p.description}</p>}
        {!out && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-gold">
              <button className="px-4 py-2" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button className="px-4 py-2" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button>
            </div>
            <button className="btn-primary" onClick={() => add(p, qty)}>Agregar al carrito</button>
            <button className="btn-outline" onClick={() => { add(p, qty); nav("/carrito"); }}>Comprar ahora</button>
          </div>
        )}
      </div>
    </div>
  );
}
