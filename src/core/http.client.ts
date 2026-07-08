import axios from "axios";

/**
 * Cliente HTTP compartido por el gateway para reenviar las solicitudes a los
 * microservicios configurados. El timeout evita que una dependencia externa
 * deje la petición abierta indefinidamente.
 */
export const httpClient = axios.create({
  timeout: 30000
});
