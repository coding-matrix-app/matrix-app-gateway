import type { NextFunction, Request, Response } from "express";
import { loadConfig } from "./route.loader.js";
import { JwtService } from "../services/jwt.service.js";

const config = loadConfig();

/**
 * Obtiene la configuración de ruta que corresponde a la URL solicitada.
 * La coincidencia por prefijo mantiene simple el enrutamiento del gateway.
 */
function matchRoute(url: string) {
    return config.routes.find(r => url.startsWith(r.path));
}

/**
 * Middleware de autenticación del gateway.
 *
 * Si la ruta tiene `auth: false`, la solicitud continúa sin token. Para rutas
 * protegidas se espera un JWT en el header `Authorization: Bearer <token>`.
 */
export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const route = matchRoute(req.originalUrl);

    if (!route) {
        if(req.originalUrl == "/api/ping") {
            return next();
        } else {
            return res.status(404).json({ error: "Route not found" });
        }
    }

    if (!route.auth) {
        return next();
    }

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Missing token" });
    }

    try {

        const payload = await JwtService.validateToken(token)

        if (!payload) return res.status(401).json({ error: 'Invalid token' })

        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
}
