import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Define ADMIN_EMAIL y ADMIN_PASSWORD en el entorno.");
  if (password.length < 8) throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
  console.log(`Administrador listo: ${email}`);
}

main().finally(() => prisma.$disconnect());
