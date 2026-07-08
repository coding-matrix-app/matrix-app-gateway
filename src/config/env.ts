import dotenvFlow from "dotenv-flow";

dotenvFlow.config();

/**
 * Lee una variable de entorno obligatoria u opcional.
 *
 * Si no existe y se define un valor por defecto, retorna ese valor. En caso
 * contrario lanza un error temprano para evitar iniciar la aplicación con una
 * configuración incompleta.
 */
function getEnv(
    key: string,
    defaultValue?: string,
): string {

    const value = process.env[key];

    if (!value) {

        if (defaultValue !== undefined) {
            return defaultValue;
        }

        throw new Error(
            `Missing environment variable: ${key}`,
        );
    }

    return value;
}

export const env = {
    nodeEnv: getEnv(
        "NODE_ENV",
        "development",
    ),

    port: Number(
        getEnv("PORT", "3001"),
    ),

    corsOrigin: getEnv(
        "CORS_ORIGIN",
        "*",
    ),

    SEED_JWT: getEnv(
        "SEED_JWT",
        "",
    ),

    isDevelopment:
        getEnv("NODE_ENV", "development") === "development",

    isProduction:
        getEnv("NODE_ENV", "development") === "production",
};
