import type { Request, Response } from "express";
import { httpClient } from "./http.client.js";
import { loadConfig } from "./route.loader.js";

const PING_PATH = "/api/ping";

/**
  Obtener los host de los archivos de rutas y apuntar a api/ping en cada uno
 */
function buildPingTargets(): string[] {
  const { routes } = loadConfig();
  const uniqueTargets = [...new Set(routes.map((r) => r.target))];
  return uniqueTargets.map((base) => `${base}${PING_PATH}`);
}

/**
 Hace ping en paralelo a todos los microservicios registrados en la configuración de rutas
 */
export async function pingHandler(_req: Request, res: Response): Promise<void> {
  const targets = buildPingTargets();

  const results = await Promise.allSettled(
    targets.map(async (url) => {
      const start = Date.now();
      const response = await httpClient.get(url, { timeout: 60000 });
      return {
        url,
        status: "ok" as const,
        httpStatus: response.status,
        latencyMs: Date.now() - start
      };
    }),
  );

  const services = results.map((result, i) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    const err = result.reason;
    return {
      url: targets[i],
      status: "error" as const,
      httpStatus: err.response?.status ?? null,
      latencyMs: null,
      error: err.message,
    };
  });

  const allOk = services.every((s) => s.status === "ok");

  res.status(allOk ? 200 : 207).json({
    gateway: "ok",
    services,
  });
}
