import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import { proxyHandler } from "./core/proxy.js";
import { authMiddleware } from "./core/auth.middleware.js";
import { pingHandler } from "./core/ping.js";
import { env } from "./config/env.js";


const app = express();

dotenv.config();

/**
 * Configuración principal de Express.
 *
 * El gateway aplica CORS, parseo de body y autenticación antes de delegar todas
 * las rutas al proxy. La ruta comodin final permite centralizar el
 * enrutamiento en los archivos `routes.<environment>.json`.
 */
app.use(
    cors({
    origin: env.corsOrigin,
    }),
);
app.use(express.json());
app.use( express.urlencoded({ extended: true }));
app.use(authMiddleware);
app.get("/api/ping", pingHandler);
app.use(/.*/, proxyHandler);

export default app;
