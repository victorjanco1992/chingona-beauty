import { Router } from "express";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { getSettings, parseDataUrl, prisma, productInclude, requireAuth, serializeProduct, slugify, wrap } from "../lib";

const r = Router();
r.use(requireAuth);

r.get("/me", (_req, res) => res.json({ ok: true }));

/* ---------- Categorías ---------- */
const catSchema = z.object({ name: z.string().trim().min(1, "Falta el nombre").max(80) });

r.get(
  "/categories",
  wrap(async (_req, res) => {
    const cats = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    res.json(cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, products: c._count.products })));
  })
);

r.post(
  "/categories",
  wrap(async (req, res) => {
    const { name } = catSchema.parse(req.body);
    try {
      res.status(201).json(await prisma.category.create({ data: { name, slug: slugify(name) } }));
    } catch {
      res.status(409).json({ error: "Ya existe una categoría con ese nombre" });
    }
  })
);

r.put(
  "/categories/:id",
  wrap(async (req, res) => {
    const { name } = catSchema.parse(req.body);
    try {
      res.json(await prisma.category.update({ where: { id: req.params.id }, data: { name, slug: slugify(name) } }));
    } catch {
      res.status(409).json({ error: "No se pudo actualizar (¿nombre repetido?)" });
    }
  })
);

r.delete(
  "/categories/:id",
  wrap(async (req, res) => {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

/* ---------- Productos ---------- */
const productSchema = z
  .object({
    name: z.string().trim().min(1, "Falta el nombre").max(160),
    description: z.string().max(5000).default(""),
    price: z.number().positive("El precio debe ser mayor a 0"),
    offerPrice: z.number().positive("Precio de oferta inválido").nullable().optional(),
    stock: z.number().int().min(0, "Stock inválido"),
    active: z.boolean().default(true),
    featured: z.boolean().default(false),
    categoryId: z.string().nullable().optional(),
    newImages: z.array(z.string()).max(8).default([]),
    removeImageIds: z.array(z.string()).default([]),
  })
  .refine((d) => d.offerPrice == null || d.offerPrice < d.price, {
    message: "El precio de oferta debe ser menor al precio normal",
    path: ["offerPrice"],
  });

async function uniqueSlug(name: string, exceptId?: string) {
  const base = slugify(name);
  let slug = base;
  let n = 1;
  while (await prisma.product.findFirst({ where: { slug, NOT: exceptId ? { id: exceptId } : undefined } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

r.get(
  "/products",
  wrap(async (_req, res) => {
    const list = await prisma.product.findMany({ include: productInclude, orderBy: { createdAt: "desc" } });
    res.json(list.map(serializeProduct));
  })
);

r.post(
  "/products",
  wrap(async (req, res) => {
    const d = productSchema.parse(req.body);
    const imgs = d.newImages.map(parseDataUrl);
    const p = await prisma.product.create({
      data: {
        name: d.name,
        slug: await uniqueSlug(d.name),
        description: d.description,
        price: d.price,
        offerPrice: d.offerPrice ?? null,
        stock: d.stock,
        active: d.active,
        featured: d.featured,
        categoryId: d.categoryId || null,
        images: { create: imgs.map((i, idx) => ({ data: i.data, mime: i.mime, position: idx })) },
      },
      include: productInclude,
    });
    res.status(201).json(serializeProduct(p));
  })
);

r.put(
  "/products/:id",
  wrap(async (req, res) => {
    const id = req.params.id;
    const d = productSchema.parse(req.body);
    const imgs = d.newImages.map(parseDataUrl);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Producto no encontrado" });
    const last = await prisma.productImage.aggregate({ where: { productId: id }, _max: { position: true } });
    let pos = (last._max.position ?? -1) + 1;
    const slug = existing.name === d.name ? existing.slug : await uniqueSlug(d.name, id);
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id, id: { in: d.removeImageIds } } }),
      prisma.product.update({
        where: { id },
        data: {
          name: d.name,
          slug,
          description: d.description,
          price: d.price,
          offerPrice: d.offerPrice ?? null,
          stock: d.stock,
          active: d.active,
          featured: d.featured,
          categoryId: d.categoryId || null,
          images: { create: imgs.map((i) => ({ data: i.data, mime: i.mime, position: pos++ })) },
        },
      }),
    ]);
    const p = await prisma.product.findUnique({ where: { id }, include: productInclude });
    res.json(serializeProduct(p));
  })
);

r.delete(
  "/products/:id",
  wrap(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

/* ---------- Pedidos ---------- */
r.get(
  "/orders",
  wrap(async (_req, res) => {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { items: true } });
    res.json(
      orders.map((o) => ({
        id: o.id,
        number: o.number,
        customerName: o.customerName,
        phone: o.phone,
        notes: o.notes,
        total: Number(o.total),
        status: o.status,
        createdAt: o.createdAt,
        items: o.items.map((i) => ({ id: i.id, name: i.name, unitPrice: Number(i.unitPrice), quantity: i.quantity })),
      }))
    );
  })
);

r.patch(
  "/orders/:id/status",
  wrap(async (req, res) => {
    const { status } = z.object({ status: z.nativeEnum(OrderStatus) }).parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
    await prisma.$transaction(async (tx) => {
      if (status === "CANCELLED" && order.status !== "CANCELLED") {
        for (const i of order.items)
          if (i.productId)
            await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity } } });
      }
      if (order.status === "CANCELLED" && status !== "CANCELLED") {
        for (const i of order.items)
          if (i.productId)
            await tx.product.updateMany({
              where: { id: i.productId, stock: { gte: i.quantity } },
              data: { stock: { decrement: i.quantity } },
            });
      }
      await tx.order.update({ where: { id: order.id }, data: { status } });
    });
    res.json({ ok: true });
  })
);

/* ---------- Ajustes ---------- */
r.get("/settings", wrap(async (_req, res) => res.json(await getSettings())));

const socialUrl = z
  .string()
  .trim()
  .max(300)
  .default("")
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Los enlaces deben empezar con https://");

r.put(
  "/settings",
  wrap(async (req, res) => {
    const b = z
      .object({
        whatsappNumber: z.string().regex(/^\d{8,15}$/, "Usa solo dígitos, con código de país (8 a 15)"),
        instagram: socialUrl,
        tiktok: socialUrl,
        facebook: socialUrl,
        youtube: socialUrl,
      })
      .parse({ ...req.body, whatsappNumber: String(req.body?.whatsappNumber ?? "").replace(/\D/g, "") });
    await prisma.$transaction(
      Object.entries(b).map(([key, value]) =>
        prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
      )
    );
    res.json(await getSettings());
  })
);

export default r;
