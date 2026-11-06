import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { Product } from "./types";

export interface CartItem {
  productId: string; slug: string; name: string; price: number; image: string | null; quantity: number; stock: number;
}
interface Ctx {
  items: CartItem[]; count: number; total: number;
  add: (p: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}
const CartCtx = createContext<Ctx>(null as unknown as Ctx);
const KEY = "cb_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);

  const add: Ctx["add"] = (p, qty = 1) =>
    setItems((cur) => {
      const price = p.offerPrice ?? p.price;
      const found = cur.find((i) => i.productId === p.id);
      if (found)
        return cur.map((i) =>
          i.productId === p.id ? { ...i, price, stock: p.stock, quantity: Math.min(i.quantity + qty, p.stock) } : i
        );
      return [...cur, { productId: p.id, slug: p.slug, name: p.name, price, image: p.images[0]?.url ?? null, quantity: Math.min(qty, p.stock), stock: p.stock }];
    });
  const setQty: Ctx["setQty"] = (id, qty) =>
    setItems((cur) => cur.map((i) => (i.productId === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i)));
  const remove: Ctx["remove"] = (id) => setItems((cur) => cur.filter((i) => i.productId !== id));
  const clear = () => setItems([]);

  // Sincroniza precios y stock con el catálogo vigente
  useEffect(() => {
    if (!items.length) return;
    api<Product[]>("/api/products").then((all) => {
      setItems((cur) =>
        cur
          .map((i) => {
            const p = all.find((x) => x.id === i.productId);
            if (!p || p.stock < 1) return null;
            return { ...i, price: p.offerPrice ?? p.price, stock: p.stock, quantity: Math.min(i.quantity, p.stock) };
          })
          .filter((x): x is CartItem => x !== null)
      );
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);
  return <CartCtx.Provider value={{ items, count, total, add, setQty, remove, clear }}>{children}</CartCtx.Provider>;
}
export const useCart = () => useContext(CartCtx);
