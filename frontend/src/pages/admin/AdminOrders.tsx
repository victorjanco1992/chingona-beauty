import { useEffect, useState } from "react";
import { api, money } from "../../api";
import { Order, OrderStatus } from "../../types";

const labels: Record<OrderStatus, string> = { PENDING: "Pendiente", CONFIRMED: "Confirmado", DELIVERED: "Entregado", CANCELLED: "Cancelado" };

export default function AdminOrders() {
  const [list, setList] = useState<Order[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState("");
  const load = () => api<Order[]>("/api/admin/orders", { auth: true }).then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const change = async (id: string, status: OrderStatus) => {
    try { await api(`/api/admin/orders/${id}/status`, { method: "PATCH", auth: true, body: { status } }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Error"); }
  };
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Pedidos</h1>
      {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="space-y-2">
        {list.map((o) => (
          <div key={o.id} className="card p-3">
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex-1 text-left" onClick={() => setOpen(open === o.id ? null : o.id)}>
                <span className="font-bold text-brand">#{o.number}</span> · <span className="font-semibold">{o.customerName}</span>
                <span className="block text-xs text-ink/60">{new Date(o.createdAt).toLocaleString()} · {money(o.total)}</span>
              </button>
              <select className="input w-auto" value={o.status} onChange={(e) => change(o.id, e.target.value as OrderStatus)}>
                {(Object.keys(labels) as OrderStatus[]).map((s) => <option key={s} value={s}>{labels[s]}</option>)}
              </select>
            </div>
            {open === o.id && (
              <div className="mt-3 space-y-2 border-t border-gold-light pt-3 text-sm">
                <ul>{o.items.map((i) => <li key={i.id}>{i.quantity} × {i.name} — {money(i.unitPrice * i.quantity)}</li>)}</ul>
                <p>Teléfono: <a className="font-semibold text-brand" href={`https://wa.me/${o.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{o.phone}</a></p>
                {o.notes && <p>Notas: {o.notes}</p>}
              </div>
            )}
          </div>
        ))}
        {!list.length && !error && <p className="text-sm text-ink/60">Todavía no hay pedidos.</p>}
      </div>
    </div>
  );
}
