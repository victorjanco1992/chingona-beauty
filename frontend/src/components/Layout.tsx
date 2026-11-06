import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "../cart";

const nav = "text-sm font-semibold px-3 py-2 rounded-full hover:bg-brand-light";
const active = ({ isActive }: { isActive: boolean }) => `${nav} ${isActive ? "bg-brand-light text-brand" : ""}`;

export default function Layout() {
  const { count } = useCart();
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-gold-light/70 bg-cream/95 backdrop-blur">
        <div className="container-x flex items-center justify-between gap-2 py-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Chingona Beauty" className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14" />
            <span className="hidden font-display text-lg font-bold sm:block">Chingona <span className="font-script text-2xl text-brand">Beauty</span></span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/catalogo" className={active}>Catálogo</NavLink>
            <NavLink to="/ofertas" className={active}>Ofertas</NavLink>
            <NavLink to="/carrito" className={active}>
              Carrito
              {count > 0 && <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs text-white">{count}</span>}
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="mt-12 border-t border-gold-light/70 bg-white py-8 text-center">
        <img src="/logo.jpg" alt="" className="mx-auto h-20 w-20 rounded-full object-cover" />
        <p className="mt-2 text-xs tracking-[0.3em] text-ink/70">BELLEZA QUE EMPODERA</p>
        <p className="mt-1 text-xs text-ink/50">© {new Date().getFullYear()} Chingona Beauty</p>
      </footer>
    </div>
  );
}
