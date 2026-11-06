import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getSettings, prisma, productInclude, serializeProduct, signToken, wrap } from "../lib";

const r = Router();

r.post(
  "/auth/login",
  wrap(async (req, res) => {
    const { email, password } = z
      .object({ email: z.string().email("Correo inválido"), password: z.string().min(1, "Falta la contraseña") })
      .parse(req.body);
    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash)))
      return res.status(401).json({ error: "Credenciales incorrectas" });
    res.json({ token: signToken(admin.id) });
  })
);

r.get("/settings", wrap(async (_req, res) => res.json(await getSettings())));

r.get(
  "/categories",
  wrap(async (_req, res) => {
    const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
  })
);

r.get(
  "/products",
  wrap(async (req, res) => {
    const q = req.query;
    const search = String(q.search || "").trim();
    const category = String(q.category || "");
    const where: Prisma.ProductWhereInput = { active: true };
    if (search)
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    if (category) where.category = { slug: category };
    if (q.offers === "1") where.offerPrice = { not: null };
    if (q.featured === "1") where.featured = true;
    if (q.inStock === "1") where.stock = { gt: 0 };

    let list = (
      await prisma.product.findMany({ where, include: productInclude, orderBy: { createdAt: "desc" }, take: 500 })
    ).map(serializeProduct);

    const eff = (p: { price: number; offerPrice: number | null }) => p.offerPrice ?? p.price;
    const min = Number(q.minPrice);
    const max = Number(q.maxPrice);
    if (q.minPrice && !isNaN(min)) list = list.filter((p) => eff(p) >= min);
    if (q.maxPrice && !isNaN(max)) list = list.filter((p) => eff(p) <= max);
    if (q.sort === "price_asc") list.sort((a, b) => eff(a) - eff(b));
    if (q.sort === "price_desc") list.sort((a, b) => eff(b) - eff(a));
    res.json(list);
  })
);

r.get(
  "/products/:slug",
  wrap(async (req, res) => {
    const p = await prisma.product.findFirst({ where: { slug: req.params.slug, active: true }, include: productInclude });
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(serializeProduct(p));
  })
);

r.get(
  "/images/:id",
  wrap(async (req, res) => {
    const img = await prisma.productImage.findUnique({ where: { id: req.params.id } });
    if (!img) return res.status(404).end();
    res.setHeader("Content-Type", img.mime);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(Buffer.from(img.data));
  })
);

const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Ingresa tu nombre").max(120),
  phone: z.string().trim().min(6, "Ingresa tu teléfono").max(30),
  notes: z.string().trim().max(1000).default(""),
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(99) }))
    .min(1, "El carrito está vacío")
    .max(50),
});

r.post(
  "/orders",
  wrap(async (req, res) => {
    const data = orderSchema.parse(req.body);
    try {
      const order = await prisma.$transaction(async (tx) => {
        let total = 0;
        const lines: { productId: string; name: string; unitPrice: number; quantity: number }[] = [];
        for (const it of data.items) {
          const p = await tx.product.findUnique({ where: { id: it.productId } });
          if (!p || !p.active) throw new Error("Un producto del carrito ya no está disponible");
          const done = await tx.product.updateMany({
            where: { id: p.id, stock: { gte: it.quantity } },
            data: { stock: { decrement: it.quantity } },
          });
          if (done.count === 0) throw new Error(`Stock insuficiente para "${p.name}"`);
          const unitPrice = Number(p.offerPrice ?? p.price);
          total += unitPrice * it.quantity;
          lines.push({ productId: p.id, name: p.name, unitPrice, quantity: it.quantity });
        }
        return tx.order.create({
          data: { customerName: data.customerName, phone: data.phone, notes: data.notes, total, items: { create: lines } },
        });
      });
      res.status(201).json({ number: order.number, total: Number(order.total) });
    } catch (e) {
      res.status(409).json({ error: e instanceof Error ? e.message : "No se pudo crear el pedido" });
    }
  })
);

export default r;
