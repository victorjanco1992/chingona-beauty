import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { ZodError } from "zod";
import publicRoutes from "./routes/public";
import adminRoutes from "./routes/admin";

const app = express();
const origins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json({ limit: "4mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues.map((i) => i.message).join(". ") || "Datos inválidos" });
  }
  const message = err instanceof Error ? err.message : "Error interno";
  const known = /imagen|JWT_SECRET/.test(message);
  console.error(err);
  res.status(known ? 400 : 500).json({ error: known ? message : "Error interno del servidor" });
});

export default app;
