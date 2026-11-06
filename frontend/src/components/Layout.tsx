import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../api";
import { useCart } from "../cart";

const item = "block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-brand-light";

export default function Layout() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); setOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-gold-light/70 bg-cream/95 backdrop-blur">
        <div className="container-x relative flex items-center justify-between py-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Chingona Beauty" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-display text-lg font-bold">Chingona <span className="font-script text-2xl text-brand">Beauty</span></span>
          </Link>
          <div className="flex items-center gap-1">
            <NavLink to="/" end className="hidden rounded-full px-3 py-2 text-sm font-semibold hover:bg-brand-light sm:block">Catálogo</NavLink>
            <Link to="/carrito" aria-label="Carrito" className="relative rounded-full p-2 hover:bg-brand-light">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l1 13H5L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
              {count > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-brand px-1 text-center text-[11px] font-bold leading-[18px] text-white">{count}</span>}
            </Link>
            <Link to="/contacto" className={item}>Contacto</Link>
            <button aria-label="Menú" onClick={() => setOpen(!open)} className="rounded-full p-2 hover:bg-brand-light">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
          </div>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <nav className="absolute right-4 top-full z-50 mt-1 w-52 rounded-2xl border border-gold-light bg-white p-2 shadow-lg">
                <Link to="/" className={item}>Catálogo</Link>
                <Link to="/carrito" className={item}>Carrito{count > 0 ? ` (${count})` : ""}</Link>
                <div className="my-1 border-t border-gold-light/60" />
                {getToken()
                  ? <Link to="/admin" className={`${item} text-brand`}>Panel</Link>
                  : <Link to="/admin/login" className={`${item} text-ink/60`}>Ingresar</Link>}
              </nav>
            </>
          )}
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="mt-12 border-t border-gold-light/70 py-6 text-center">
        <p className="text-xs tracking-[0.3em] text-ink/60">BELLEZA QUE EMPODERA</p>
      </footer>
    </div>
  );
}
