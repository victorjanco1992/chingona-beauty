import { Link } from "react-router-dom";
import { imgUrl, money } from "../api";
import { useCart } from "../cart";
import { Product } from "../types";

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const out = p.stock < 1;
  const off = p.offerPrice != null;
  const pct = off ? Math.round((1 - (p.offerPrice as number) / p.price) * 100) : 0;
  return (
    <div className="card flex flex-col overflow-hidden">
      <Link to={`/producto/${p.slug}`} className="relative block aspect-square bg-brand-light/40">
        {p.images[0] ? (
          <img src={imgUrl(p.images[0].url)} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <img src="/logo.jpg" alt="" className="h-full w-full object-contain p-6 opacity-30" />
        )}
        {off && !out && (
          <span className="absolute left-2 top-2 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white shadow">
            OFERTA{pct > 0 ? ` -${pct}%` : ""}
          </span>
        )}
        {out && <span className="absolute left-2 top-2 rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white shadow">AGOTADO</span>}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {p.category && <span className="text-[11px] font-semibold uppercase tracking-wide text-gold">{p.category.name}</span>}
        <Link to={`/producto/${p.slug}`} className="line-clamp-2 font-semibold leading-snug hover:text-brand">{p.name}</Link>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-brand">{money(p.offerPrice ?? p.price)}</span>
          {off && <span className="text-sm text-ink/50 line-through">{money(p.price)}</span>}
        </div>
        <button className="btn-primary mt-2" disabled={out} onClick={() => add(p)}>{out ? "Sin stock" : "Agregar al carrito"}</button>
      </div>
    </div>
  );
}
