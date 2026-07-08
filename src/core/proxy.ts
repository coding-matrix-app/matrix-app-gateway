import { loadConfig } from "./route.loader.js";
import type { Request, Response } from "express";
import { httpClient } from "./http.client.js";

const config = loadConfig();

/**
 * Busca la primera ruta configurada cuyo path coincida con el inicio de la URL
 * recibida. Esta estrategia permite agrupar endpoints por prefijo.
 */
function matchRoute(url: string) {
  return config.routes.find(r => url.startsWith(r.path));
}

/**
 * Reenvia la solicitud entrante al microservicio definido para la ruta.
 *
 * Se eliminan headers propios de la conexión original para que Axios calcule
 * correctamente la nueva petición hacia el servicio destino.
 */
export async function proxyHandler(req: Request, res: Response) {
  const route = matchRoute(req.originalUrl);

  if (!route) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const finalUrl = `${route.target}${req.originalUrl}`;
    const { host, connection, ["content-length"]: _cl, ...safeHeaders } = req.headers;

    const response = await httpClient({
      method: req.method as any,
      url: finalUrl,
      data: req.body,
      headers: safeHeaders
    });

    res.status(response.status).send(response.data);
  } catch (err: any) {
    res
      .status(err.response?.status || 500)
      .json({ error: err.message });
  }
}
