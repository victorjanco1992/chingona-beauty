import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { api, getToken, setToken } from "../../api";
import { useNoIndex } from "../../noindex";

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold ${isActive ? "bg-brand text-white" : "hover:bg-brand-light"}`;

export default function AdminLayout() {
  useNoIndex();
  const nav = useNavigate();
  const [ok, setOk] = useState(false);
  const token = getToken();
  useEffect(() => {
    if (token) api("/api/admin/me", { auth: true }).then(() => setOk(true)).catch(() => {});
  }, [token]);
  if (!token) return <Navigate to="/admin/login" replace />;
  if (!ok) return <p className="py-20 text-center text-ink/60">Verificando acceso…</p>;
  return (
    <div className="min-h-screen">
      <header className="border-b border-gold-light bg-white">
        <div className="container-x flex flex-wrap items-center gap-3 py-3">
          <img src="/logo.jpg" alt="" className="h-10 w-10 rounded-full object-cover" />
          <nav className="flex flex-1 flex-wrap gap-1">
            <NavLink end to="/admin" className={link}>Productos</NavLink>
            <NavLink to="/admin/categorias" className={link}>Categorías</NavLink>
            <NavLink to="/admin/pedidos" className={link}>Pedidos</NavLink>
            <NavLink to="/admin/ajustes" className={link}>Ajustes</NavLink>
          </nav>
          <a href="/" className="btn-ghost">Ver tienda</a>
          <button className="btn-outline" onClick={() => { setToken(null); nav("/admin/login"); }}>Salir</button>
        </div>
      </header>
      <div className="container-x py-6"><Outlet /></div>
    </div>
  );
}
