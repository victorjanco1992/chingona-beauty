import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, imgUrl, money } from "../api";
import { useCart } from "../cart";

export default function CartPage() {
  const { items, total, setQty, remove, clear } = useCart();
  const [wa, setWa] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { api<{ whatsappNumber: string }>("/api/settings").then((s) => setWa(s.whatsappNumber)).catch(() => setWa("")); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!wa) return setError("La tienda todavía no configuró su número de WhatsApp.");
    setBusy(true);
    try {
      const order = await api<{ number: number; total: number }>("/api/orders", {
        method: "POST",
        body: { customerName: name, phone, notes, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
      });
      const lines = items.map((i) => `• ${i.quantity} x ${i.name} — ${money(i.price * i.quantity)}`);
      const text = [
        `Hola Chingona Beauty! Quiero confirmar mi pedido #${order.number}`,
        "",
        ...lines,
        "",
        `Total: ${money(order.total)}`,
        `Nombre: ${name}`,
        `Teléfono: ${phone}`,
        notes ? `Notas: ${notes}` : "",
      ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
      clear();
      window.location.href = `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el pedido");
      setBusy(false);
    }
  }

  if (!items.length)
    return <div className="container-x py-20 text-center"><h1 className="text-3xl font-bold">Tu carrito está vacío</h1><Link to="/catalogo" className="btn-primary mt-6">Ir al catálogo</Link></div>;

  return (
    <div className="container-x grid gap-8 py-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <h1 className="mb-4 text-3xl font-bold">Tu carrito</h1>
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.productId} className="card flex gap-3 p-3">
              <img src={i.image ? imgUrl(i.image) : "/logo.jpg"} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col">
                <Link to={`/producto/${i.slug}`} className="font-semibold hover:text-brand">{i.name}</Link>
                <span className="text-sm text-ink/60">{money(i.price)} c/u</span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-gold text-sm">
                    <button className="px-3 py-1" onClick={() => setQty(i.productId, i.quantity - 1)}>−</button>
                    <span className="w-6 text-center font-semibold">{i.quantity}</span>
                    <button className="px-3 py-1" onClick={() => setQty(i.productId, i.quantity + 1)} disabled={i.quantity >= i.stock}>+</button>
                  </div>
                  <span className="font-bold text-brand">{money(i.price * i.quantity)}</span>
                </div>
              </div>
              <button onClick={() => remove(i.productId)} className="self-start text-ink/40 hover:text-red-600" aria-label="Quitar">✕</button>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="card h-fit space-y-3 p-5 lg:col-span-2">
        <h2 className="text-xl font-bold">Finalizar pedido</h2>
        <div><label className="label">Nombre</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><label className="label">Teléfono</label><input className="input" required value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div><label className="label">Notas (opcional)</label><textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        <div className="flex items-center justify-between border-t border-gold-light pt-3 text-lg font-bold"><span>Total</span><span className="text-brand">{money(total)}</span></div>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {wa === "" && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Falta configurar el WhatsApp de la tienda.</p>}
        <button className="btn-primary w-full" disabled={busy || wa === ""}>{busy ? "Procesando…" : "Enviar pedido por WhatsApp"}</button>
      </form>
    </div>
  );
}
