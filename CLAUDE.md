# CLAUDE.md

Guia operativa del backend **Rekko-API** para otro agente o para integracion con frontend.

Este documento resume el comportamiento real del proyecto segun el codigo actual, con foco en autenticacion, registro de usuarios, OAuth, verificacion de email, cambio de password y consultas de usuarios.

## Resumen del proyecto

- Backend en **Node.js + Express + TypeScript**.
- ORM: **Prisma 6.12** con **PostgreSQL**.
- Validacion de entrada: **Zod**.
- Auth: **JWT** para access tokens y tokens de accion puntual; refresh tokens persistidos en BD.
- Hash de password: **bcrypt**.
- Emails: **nodemailer** a traves de una capa `EmailHandler`.
- OAuth: **Firebase Admin** para Google y flujo OAuth de Discord.
- Logging: `morgan`.

Punto de entrada:
- `src/server.ts` arranca el servidor.
- `src/app.ts` monta middleware y rutas.

## Como arrancarlo

Scripts definidos en `package.json`:

- `npm run dev`: arranque en desarrollo con `tsx` y `nodemon`.
- `npm run build`: compila TypeScript.
- `npm start`: ejecuta `dist/server.js`.
- `npm run format`: formatea con Prettier.
- `npm run format:check`: comprueba formato.

## Variables de entorno observadas

Archivo de ejemplo: `.env.example`

Variables vistas en el codigo:

- `SERVER_PORT`: puerto del servidor. Por defecto `5000`.
- `DATABASE_URL`: cadena de conexion a PostgreSQL.
- `DATABASE_PASSWORD`: presente en `.env.example`.
- `JWT_SECRET`: firma de access tokens y tokens temporales de 10 minutos.
- `REFRESH_TOKEN_SECRET`: usado para encodar el refresh token.
- `CLIENT_URL_DEV`: dominio frontend para redirecciones en desarrollo.
- `CLIENT_URL_PROD`: dominio frontend para redirecciones en produccion.
- `NODE_ENV`: determina si se usan URLs de desarrollo o produccion.

Notas:
- Los callbacks de email/password redirigen al frontend con `status` en query string.
- El repo ya avisa en `README.md` que, al pasar a produccion, hay que cambiar las URLs del `.env` al dominio real.

## Capas y convenciones importantes

### Respuesta HTTP

Hay dos formatos principales:

- Exito con mensaje:
  ```json
  {
    "success": true,
    "message": "...",
    "data": {}
  }
  ```

- Creacion:
  ```json
  {
    "success": true,
    "data": {}
  }
  ```

- Error:
  ```json
  {
    "error": {
      "message": "...",
      "details": "...",
      "stack": "..."
    }
  }
  ```

En desarrollo se incluye `stack`.

### Error handling

- Errores Zod devuelven `400` con `message: "Validation error"` y `details` concatenado.
- `HttpError` y `AuthError` se serializan con su `status`, `message` y `details`.
- Errores no controlados devuelven `500`.

### Auth y seguridad

- `Authorization: Bearer <accessToken>` es obligatorio para endpoints protegidos.
- La idea es guardar una cookie en el frontend que estrictamente solo se mande a peticiones en el dominio del backend que cargue con el token de acceso o refresco
- `authMiddleware` valida el access token y añade `req.user = { userId }`.
- Access token: expira en **15 minutos**.
- Refresh token: se genera para **7 dias**, persiste en BD y se vincula a `userAgent` + `ip`.
- Tokens de email/password: JWT de **10 minutos** con un campo `purpose`.

## Estructura de la base de datos real

La BD real se define en `prisma/schema.prisma`. Provider: `postgresql`.

### Tablas y modelos relevantes para auth y usuarios

#### `user`

Campos principales:

- `user_id` int, PK autoincrement.
- `email` string, unico.
- `password` string.
- `username` string, unico.
- `biography` string nullable.
- `reputation` int, default `0`.
- `profile_image` string.
- `banner_image` string nullable.
- `background_image` string nullable.
- `role` enum `USER | MODERATOR | ADMIN`, default `USER`.
- `email_verified` boolean, default `false`.
- `created_at` datetime, default `now()`.

Relaciones:

- `refreshTokens`
- `oauthAccounts`
- `comments`
- `posts`
- `userLikePost`
- `userLikeAnime`
- `userRateAnime`
- `userWatchAnime`
- `userSocialAccount`
- `emailRequest`
- `passwordRequest`
- `verificationRequest`

#### `refresh_token`

Campos:

- `refresh_token_id` PK.
- `user_id` FK a `user` con `onDelete: Cascade`.
- `token` string.
- `created_at` datetime.
- `expires_at` datetime.
- `revoked_at` datetime nullable.
- `user_agent` string.
- `ip` string.

Uso:

- Guarda refresh tokens activos e historicos.
- Se usa para revocar una sesion concreta.

#### `oauth_account`

Campos:

- `oauth_account_id` PK.
- `user_id` FK a `user` con `onDelete: Cascade`.
- `provider_user_id` string.
- `provider` string.

Restriccion:

- Unico compuesto: `[provider, provider_user_id]`.

#### `email_change_request`

Campos:

- `email_change_request_id` PK.
- `user_id` unico.
- `new_email` unico.
- `token` unico.
- `expires_at` datetime.
- `confirmed` boolean default `false`.
- `updated_at` datetime con `@updatedAt`.
- `created_at` datetime default `now()`.

#### `password_change_request`

Campos:

- `password_change_request_id` PK.
- `user_id` unico.
- `token` unico.
- `expires_at` datetime.
- `confirmed` boolean default `false`.
- `updated_at` datetime con `@updatedAt`.
- `created_at` datetime default `now()`.

#### `email_verification_request`

Campos:

- `email_verification_request_id` PK.
- `user_id` unico.
- `token` unico.
- `expires_at` datetime.
- `confirmed` boolean default `false`.
- `updated_at` datetime con `@updatedAt`.
- `created_at` datetime default `now()`.

#### `social_account`

- Tabla catalogo con `social_account_id` y `name` unico.
- Se relaciona con `user_social_account`.

#### `user_social_account`

- Relacion entre usuario y red social.
- Campos: `user_id`, `social_account_id`, `social_url`.

### Otros modelos existentes

Aunque el foco actual sea auth/usuario, la BD tambien contiene:

- `post`
- `comment`
- `anime`
- `broadcast`
- `challenge`
- `type`
- `day`
- `user_like_post`
- `anime_post`
- `user_like_anime`
- `user_rate_anime`
- `user_watch_anime`

## Reglas de auth y acceso por router

### Montaje general

Las rutas se montan en `src/infraestructure/router/routes.ts`:

- `/auth` -> router de auth.
- `/oauth` -> router de OAuth.
- `/user` -> router de usuarios.
- `/post`, `/comment`, `/anime`, `/challenge`, `/mal` -> otras areas ya existentes.

### Middleware por grupo

#### `/auth`

Protegido por `authAuthMiddleware`, que permite sin bearer solo:

- `POST /auth/login`
- `POST /auth/refresh`

El resto pide `Authorization: Bearer ...`.

#### `/user`

Protegido por `userAuthMiddleware`, que deja publicos algunos casos concretos:

- `GET /user/`
- `GET /user/:username` -- Este puede servir tambien para devolver perfiles de usuarios
- `GET /user/:id`
- `GET /user/:username/verify-email/confirm`
- `GET /user/:username/change-email/confirm`
- `POST /user/`
- `POST /user/:username/forgot-password`
- `POST /user/:username/reset-password`

Todo lo demas en `/user` necesita bearer token.

Importante: por la implementacion actual, `POST /user/:username/verify-email` y `POST /user/:username/change-email` requieren bearer token.

## Formato de consulta de usuarios

El middleware `parseQueryOptions` transforma query strings en opciones de Prisma.

### Query params soportados

- `fields`: lista separada por comas.
- `page`: numero de pagina, coercionado.
- `limit`: numero de elementos por pagina, coercionado.
- `sortField`: campo de ordenacion.
- `sortOrder`: `asc` o `desc`.

### Reglas

- `page` minimo `1`, default `1`.
- `limit` minimo `1`, maximo `20`, default `10`.
- `sortOrder` por defecto `asc`.
- Si no hay `sortField`, el orden por defecto es `userId asc`.

### Campos permitidos en `fields`

El backend valida estos campos:

- `userId`
- `email`
- `username`
- `reputation`
- `profileImage`
- `bannerImage`
- `backgroundImage`
- `role`
- `emailVerified`
- `createdAt`
- `biography`
- `socialAccounts`
- `posts`
- `oauthAccounts`

### Mapeo especial

- `socialAccounts` se traduce internamente a `userSocialAccount` con `include: { socialAccount: true }`.
- `posts` y `oauthAccounts` usan config directa de Prisma.

### Ejemplo de lista

```http
GET /user?fields=username,email,reputation,socialAccounts&page=1&limit=10&sortField=createdAt&sortOrder=desc
```

## Contrato de endpoints

### Auth

#### `POST /auth/login`

Publico.

Body:

```json
{
  "email": "user@mail.com",
  "password": "Password123"
}
```

Validacion:

- `email` obligatorio y valido.
- `password` minimo 8 caracteres.

Proceso:

1. Busca usuario por email.
2. Comprueba password con bcrypt.
3. Genera access token y refresh token.
4. Persiste la sesion en `refresh_token`.

Respuesta `200`:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "userId": 1,
      "email": "user@mail.com",
      "username": "usuario"
    }
  }
}
```

#### `POST /auth/logout`

Requiere bearer token y body con refresh token.

Body:

```json
{
  "refreshToken": "..."
}
```

Proceso:

1. Valida el refresh token enviado.
2. Busca la sesion activa por token y tiempo actual.
3. Marca `revokedAt`.

Respuesta `200`:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### `POST /auth/refresh`

Publico a nivel de middleware, pero requiere body con refresh token.

Body:

```json
{
  "refreshToken": "..."
}
```

Proceso:

1. Busca la sesion por token.
2. Comprueba que no este revocada.
3. Comprueba expiracion.
4. Genera un nuevo access token.

Respuesta `200`:

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "..."
  }
}
```

#### `GET /auth/sessions`

Implementacion pendiente.

Respuesta actual:

```json
{
  "message": "Not implemented",
  "details": "GET Sessions"
}
```

Status: `501`.

#### `DELETE /auth/sessions/:id`

Implementacion pendiente.

Respuesta actual:

```json
{
  "message": "Not implemented",
  "details": "Revoke Session"
}
```

Status: `501`.

### OAuth

#### `POST /oauth/google`

Publico.

Body:

```json
{
  "tokenId": "firebase-id-token"
}
```

Proceso:

1. Verifica el token Firebase.
2. Extrae `uid` y `email`.
3. Crea usuario si no existe.
4. Vincula cuenta OAuth.
5. Genera access + refresh token.

Respuesta `200`:

```json
{
  "success": true,
  "message": "Google OAuth account created succesfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### `POST /oauth/discord`

Publico.

Body:

```json
{
  "code": "oauth-code-from-discord"
}
```

Proceso:

1. Intercambia `code` por access token de Discord.
2. Obtiene datos del usuario de Discord.
3. Crea usuario si no existe.
4. Vincula cuenta OAuth.
5. Genera access + refresh token.

Respuesta `200`:

```json
{
  "success": true,
  "message": "Discord OAuth account created succesfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### User

#### `POST /user/`

Publico.

Body:

```json
{
  "email": "user@mail.com",
  "password": "Password123",
  "passwordRepeat": "Password123",
  "username": "usuario",
  "profileImage": "https://...",
  "bannerImage": "https://...",
  "backgroundImage": "https://...",
  "biography": "Texto opcional"
}
```

Validacion:

- `email` valido.
- `password` y `passwordRepeat` min 8, una mayuscula, una minuscula y un numero.
- `password` y `passwordRepeat` deben coincidir.
- `username` obligatorio.
- El resto es opcional.
- El objeto se valida como `strict`, asi que campos extra fallan.

Proceso:

1. Crea el usuario en BD.
2. Dispara una solicitud de verificacion de email.
3. Responde creado.

Respuesta `201`:

```json
{
  "success": true,
  "data": "User created succesfully. Check your email and verify"
}
```

#### `GET /user/`

Publico.

Query:

- `fields`
- `page`
- `limit`
- `sortField`
- `sortOrder`

Respuesta `200`:

```json
{
  "success": true,
  "message": "Users found.",
  "data": {
    "data": [
      {}
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

Errores esperables:

- `404` si no hay usuarios.
- `404` si la pagina solicitada no existe.

#### `GET /user/:id`

Publico.

Params:

- `id`: numero.

Respuesta `200`:

```json
{
  "success": true,
  "message": "User found",
  "data": {}
}
```

#### `GET /user/:username`

Publico.

Query igual que `GET /user/`.

Devuelve los datos del usuario por username con el select pedido.

#### `PATCH /user/:username`

Requiere bearer token por middleware de `/user`.

Body:

```json
{
  "profileImage": "https://...",
  "bannerImage": "https://...",
  "backgroundImage": "https://...",
  "biography": "Texto opcional"
}
```

#### `DELETE /user/:username`

Requiere bearer token.

Elimina el usuario por `username`.

#### `PATCH /user/:username/change-username`

Requiere bearer token.

Body:

```json
{
  "email": "user@mail.com",
  "username": "nuevoNombre"
}
```

Nota: el esquema pide `email` y `username`; el backend actual usa solo `username` para actualizar, pero valida ambos campos.

#### `PATCH /user/:username/social-accounts`

Requiere bearer token.

Body:

```json
{
  "accounts": [
    {
      "name": "twitter",
      "url": "https://x.com/usuario"
    }
  ]
}
```

Reglas:

- `name` obligatorio, se transforma a minusculas.
- `url` debe ser valida.
- Se hace upsert de `SocialAccount` y se crea o actualiza `UserSocialAccount`.

#### `PATCH /user/:username/reputation`

Requiere bearer token.

Body:

```json
{
  "reason": "good_post"
}
```

Razones disponibles:

- `good_post` -> `+10`
- `helpful_comment` -> `+5`
- `spam` -> `-15`
- `bad_behavior` -> `-20`
- `misinformation` -> `-10`

#### `POST /user/:username/change-email`

Requiere bearer token.

Body:

```json
{
  "newEmail": "nuevo@mail.com"
}
```

Proceso:

1. Genera token de cambio de email de 10 minutos.
2. Guarda o actualiza `email_change_request`.
3. Envía email de confirmacion al correo anterior.

#### `GET /user/:username/change-email/confirm?token=...`

Publico.

- Verifica token de tipo `change-email`.
- Si va bien, redirige al frontend a `/email-changed?status=success`.
- Si falla con `AuthError`, redirige con `status` igual a `expired`, `invalid`, `user_not_found`, `token_used`, `email_taken`, etc. segun la excepcion.

#### `POST /user/:username/verify-email`

Requiere bearer token por middleware actual.

No lleva body.

Proceso:

1. Genera token de verificacion de 10 minutos.
2. Persiste `email_verification_request`.
3. Envia email de verificacion.

#### `GET /user/:username/verify-email/confirm?token=...`

Publico.

- Verifica token de tipo `verify-email`.
- Si va bien, redirige al frontend a `/email-verified?status=success`.
- Si falla con `AuthError`, redirige al frontend con el `status` del error.

#### `POST /user/:username/forgot-password`

Publico.

No lleva body.

Proceso:

1. Genera token de cambio de password de 10 minutos.
2. Persiste `password_change_request`.
3. Envía email de recuperacion.
4. Redirige al frontend a `/password-forgot?status=success` o con status de error.

#### `POST /user/:username/reset-password`

Publico.

Body:

```json
{
  "password": "Password123",
  "passwordRepeat": "Password123"
}
```

Query:

- `token`: obligatorio.

Proceso:

1. Verifica token de tipo `change-password`.
2. Comprueba que el usuario existe.
3. Hashea la nueva password.
4. Actualiza `password_change_request` y el password del usuario.
5. Redirige al frontend a `/password-changed?status=success` o con status de error.

## Estados de redireccion usados por auth

Valores observados en el proyecto:

- `success`
- `expired`
- `invalid`
- `user_not_found`
- `token_used`
- `email_taken`

Tambien existe `validation_error` en la capa de errores, aunque no se lista en el README.

## Puntos finos para frontend

- Los endpoint de confirmacion por email y password **no devuelven JSON** cuando tienen exito; devuelven `302` hacia el frontend.
- Para consumir refresh tokens de forma segura, conserva `accessToken` en memoria y `refreshToken` segun la estrategia del frontend.
- El backend usa el `user-agent` e IP para asociar la sesion del refresh token, asi que cambiar de dispositivo puede afectar a la revocacion por dispositivo.
- `GET /user/:username` y `GET /user/:id` son publicos segun el middleware actual.
- `POST /user/:username/verify-email` requiere bearer token aunque la llamada nace justo despues del registro; si el frontend lo va a usar, debe tener presente esa condicion.
- `GET /auth/sessions` y `DELETE /auth/sessions/:id` aun no estan implementados.

## Ejemplos de integracion frontend

### Login

```ts
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const json = await response.json();
```

### Refresh

```ts
const response = await fetch(`${API_URL}/auth/refresh`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
```

### Listado de usuarios

```ts
const params = new URLSearchParams({
  fields: 'username,email,reputation',
  page: '1',
  limit: '10',
  sortField: 'createdAt',
  sortOrder: 'desc'
});

const response = await fetch(`${API_URL}/user?${params.toString()}`);
```

### Cambio de password

```ts
const response = await fetch(
  `${API_URL}/user/${username}/reset-password?token=${token}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password,
      passwordRepeat
    })
  }
);
```

## Observaciones de mantenimiento

- La documentacion oficial de esta API aun no esta formalizada en OpenAPI/Swagger; este archivo debe servir como referencia rapida para otro agente.
- Si cambia la logica de auth, los puntos criticos a revisar son:
  - `src/middlewares/auth.middleware.ts`
  - `src/controllers/user/*.ts`
  - `src/services/user/*.ts`
  - `src/domain/schemas/user.schemas.ts`
  - `prisma/schema.prisma`
- Si se añaden nuevos campos de usuario consultables, hay que actualizar `userSelectableField`, `userDefaultSelect` y `buildPrismaSelect`.

## Mini mapa de dependencias

- Controladores -> servicios -> repositorios Prisma.
- Los repositorios traducen entidades de dominio a Prisma y gestionan errores de base de datos.
- La capa de dominio tiene entidades con constructores privados y factories `fromPersistence` / `fromInput`.

## Recomendacion para el siguiente paso

Lo mas util para frontend seria generar despues un contrato mas formal en alguno de estos formatos:

- OpenAPI 3.0
- colección Postman / Insomnia
- SDK TypeScript con tipos de request/response

