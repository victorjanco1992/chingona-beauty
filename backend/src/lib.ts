import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export const wrap =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

export function slugify(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Falta la variable JWT_SECRET");
  return s;
}

export const signToken = (adminId: string) => jwt.sign({ sub: adminId }, secret(), { expiresIn: "7d" });

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  try {
    jwt.verify(token, secret());
    next();
  } catch {
    res.status(401).json({ error: "No autorizado" });
  }
}

export const productInclude = {
  category: true,
  images: { select: { id: true, position: true }, orderBy: { position: "asc" as const } },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    offerPrice: p.offerPrice == null ? null : Number(p.offerPrice),
    stock: p.stock,
    active: p.active,
    featured: p.featured,
    categoryId: p.categoryId,
    category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
    images: (p.images as { id: string }[]).map((i) => ({ id: i.id, url: `/api/images/${i.id}` })),
    createdAt: p.createdAt,
  };
}
export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    whatsappNumber: (map.whatsappNumber ?? process.env.WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
    instagram: map.instagram ?? "",
    tiktok: map.tiktok ?? "",
    facebook: map.facebook ?? "",
    youtube: map.youtube ?? "",
  };
}

export function parseDataUrl(dataUrl: string) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new Error("Formato de imagen no válido");
  const data = Buffer.from(m[2], "base64");
  if (data.length > 1_500_000) throw new Error("La imagen supera 1.5 MB");
  return { mime: m[1], data };
}
