# API Gateway

API Gateway desarrollado con Node.js, Express y TypeScript para centralizar el ingreso a los microservicios. El gateway valida autenticación JWT cuando la ruta lo requiere y reenvía cada solicitud al servicio configurado según el ambiente.

## Requisitos

- [Node.js](https://nodejs.org/en/) 22.x o superior
- [npm](https://www.npmjs.com/)
- Docker, solo si se desea ejecutar el servicio contenerizado

## Variables de entorno

Crear el archivo local a partir de la plantilla:

```bash
cp .env.example .env
```

Completar los valores requeridos:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=*
SEED_JWT=clave_secreta_para_firmar_tokens
```

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `NODE_ENV` | Ambiente usado para cargar rutas desde `src/config/routes.<ambiente>.json`. | `development` |
| `PORT` | Puerto donde se levanta el gateway. | `3001` |
| `CORS_ORIGIN` | Origen permitido para CORS. Puede ser `*` en desarrollo. | `*` |
| `SEED_JWT` | Secreto usado para validar tokens JWT. Debe coincidir con el servicio que emite los tokens. | `mi_clave_segura` |

## Instalación y ejecución local

Instalar dependencias:

```bash
npm install
```

Levantar el proyecto en modo desarrollo:

```bash
npm run dev
```

El gateway quedará disponible en el puerto definido por `PORT`.

## Scripts disponibles

```bash
npm run dev
```

Levanta el proyecto en modo desarrollo con recarga automática usando `tsx watch`.

```bash
npm run build
```

Compila TypeScript y genera la carpeta `dist`.

```bash
npm start
```

Ejecuta la versión compilada desde `dist/server.js`.

## Docker

Construir la imagen:

```bash
docker build -t api-gateway .
```

Ejecutar el contenedor usando las variables de entorno:

```bash
docker run --env-file .env -p 3001:3001 api-gateway
```

Si se usa `PORT=8080`, publicar el puerto correspondiente:

```bash
docker run --env-file .env -p 8080:8080 api-gateway
```

El `Dockerfile` usa una construcción multi-stage: primero instala dependencias y compila TypeScript, luego crea una imagen final con dependencias de producción y los archivos compilados.

## Arquitectura y patrón usado

El proyecto usa un patrón de API Gateway con proxy inverso. Express recibe todas las solicitudes, valida CORS y body, aplica autenticación cuando corresponde y delega el envío al microservicio configurado.

## Estructura del proyecto

```text
src/
  app.ts                    Configuración de middlewares de Express
  server.ts                 Punto de entrada del servidor
  config/
    env.ts                  Lectura y validación de variables de entorno
    routes.*.json           Rutas por ambiente
  core/
    auth.middleware.ts      Validación de autenticación por ruta
    http.client.ts          Cliente HTTP compartido
    proxy.ts                Reenvío de solicitudes al servicio destino
    route.loader.ts         Carga de rutas según NODE_ENV
  services/
    jwt.service.ts          Validación de tokens JWT
```

## Configuración de rutas

Las rutas se definen por ambiente en:

- `src/config/routes.development.json`
- `src/config/routes.production.json`

Cada ruta tiene esta estructura:

```json
{
  "path": "/api/qr",
  "target": "http://127.0.0.1:8080",
  "auth": true
}
```

- `path`: prefijo que el gateway usa para reconocer la solicitud.
- `target`: URL base del microservicio destino.
- `auth`: indica si la ruta requiere token JWT.

Para rutas protegidas, enviar el token en el header:

```http
Authorization: Bearer <token>
```

## Flujo de solicitud

1. El cliente llama al API Gateway.
2. Express aplica CORS y parsea el body.
3. `authMiddleware` busca la ruta configurada.
4. Si la ruta requiere autenticación, valida el JWT con `JwtService`.
5. `proxyHandler` reenvía la solicitud al `target` configurado.
6. El gateway responde al cliente con el status y body devueltos por el microservicio.

## Convenciones de código

- Lenguaje principal: TypeScript.
- Variables y funciones: `camelCase`, por ejemplo `loadConfig`, `proxyHandler`, `httpClient`.
- Clases y tipos: `PascalCase`, por ejemplo `JwtService`, `Route`, `Config`.
- Constantes de entorno: `UPPER_SNAKE_CASE`, por ejemplo `NODE_ENV`, `SEED_JWT`.
- Archivos: nombres descriptivos en minúsculas, separados por punto cuando expresan responsabilidad, por ejemplo `auth.middleware.ts` y `http.client.ts`.
- Comentarios: se documenta la intención de módulos, funciones y decisiones relevantes sin repetir operaciones evidentes del código.

## Buenas prácticas aplicadas

- Configuración separada por ambiente.
- Variables sensibles fuera del código fuente.
- Cliente HTTP centralizado con timeout.
- Middleware de autenticación separado de la lógica de proxy.
- Tipos TypeScript para documentar la estructura de rutas.
- Imagen Docker optimizada con multi-stage build.
