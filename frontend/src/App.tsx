import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/ofertas" element={<Catalog offersOnly />} />
        <Route path="/producto/:slug" element={<ProductPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="*" element={<div className="container-x py-24 text-center">Página no encontrada</div>} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminProducts />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route path="pedidos" element={<AdminOrders />} />
        <Route path="ajustes" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
