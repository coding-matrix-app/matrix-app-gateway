import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.port || 8080;

/**
 * Punto de entrada de la aplicación.
 * Inicializa el servidor HTTP usando el puerto definido en las variables de
 * entorno o el fallback configurado para ejecución local.
 */
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
