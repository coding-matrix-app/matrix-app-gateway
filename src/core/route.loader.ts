import fs from "fs";
import { env } from "../config/env.js";
import path from "path";
import { fileURLToPath } from "url";

export type Route = {
    path: string;
    target: string;
    auth: boolean;
};

export type Config = {
    routes: Route[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Carga las rutas del gateway según el ambiente actual.
 */
export function loadConfig(): Config {
    const environment = env.nodeEnv || "development";
    const fileName = `routes.${environment}.json`;
    const filePath = path.join(__dirname, "../config", fileName);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Config file not found: ${fileName}`);
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}
