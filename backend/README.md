# Backend MICE-LO

API REST en Express 5 con PostgreSQL. Implementa autenticación, perfiles, proyectos, convocatorias, administración, contacto y jornadas de limpieza de playas.

## Capas

```text
src/
├── config/       # entorno y PostgreSQL
├── controllers/  # entrada/salida HTTP
├── middlewares/  # cookies, autenticación, roles, validación y errores
├── models/       # SQL parametrizado, esquemas Zod y mapeo
├── routes/       # contrato HTTP
├── scripts/      # migración, smoke, correo, promoción y limpieza
├── services/     # autenticación, MFA, correo, administración y tokens
├── utils/        # errores, imágenes y tokens de desarrollo
├── app.js
└── server.js
```

## Instalación

```bash
npm install
copy .env.example .env
npm run db:migrate
npm run dev
```

La API escucha normalmente en `http://localhost:3000`; su raíz documental es `/api` y salud es `GET /api/health`.

## Configuración

Grupos principales de variables:

- Servidor: `NODE_ENV`, `PORT`, `FRONTEND_URL`, `TRUST_PROXY`.
- PostgreSQL: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`.
- Tokens: `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `REFRESH_TOKEN_DAYS`.
- MFA/legal: `MFA_ENCRYPTION_KEY`, `CONSENT_HASH_KEY`, versiones y hashes documentales.
- Cookies: `COOKIE_SECURE`, `COOKIE_SAME_SITE`.
- Limpieza: intervalo y retención de sesiones/tokens usados.
- SMTP: habilitación, proveedor, usuario, contraseña, remitente, administrador y timeouts.

La validación ocurre al arrancar. Producción exige correo habilitado, cookies seguras, claves independientes suficientemente largas y hashes SHA-256 de términos y privacidad.

## Contrato HTTP

### Autenticación `/api/auth`

| Método y ruta | Acceso | Función |
|---|---|---|
| `POST /register` | Público limitado | Alta y envío de confirmación |
| `POST /login` | Público limitado | Login o desafío MFA |
| `POST /mfa/verify` | Público limitado | Completar segundo factor |
| `POST /refresh` | Cookie + CSRF | Rotar sesión |
| `POST /logout` | Sesión | Revocar sesión actual |
| `POST /forgot-password` | Público limitado | Solicitar recuperación |
| `POST /reset-password` | Público limitado | Cambiar contraseña |
| `POST /resend-verification` | Público limitado | Reenviar confirmación |
| `POST /verify-email` | Público limitado | Confirmar correo |
| `GET /me` | Usuario | Cuenta actual |
| `PUT/DELETE /profile/photo` | Usuario | Fotografía |
| `PUT /profile/details` | Usuario | Descripción, misión, visión y objetivos |
| `GET /sessions` | Usuario | Sesiones activas |
| `DELETE /sessions/:sessionId` | Usuario | Revocar sesión |
| `POST /logout-all` | Usuario | Revocar todas |
| `GET /mfa/status` | Usuario | Estado MFA |
| `POST /mfa/setup` | Usuario | Preparar TOTP |
| `POST /mfa/enable` | Usuario | Confirmar activación |
| `POST /mfa/disable` | Usuario | Desactivar MFA |

El access token se entrega en JSON. El refresh token nunca se expone allí: viaja en cookie `HttpOnly`. El navegador debe usar `credentials: "include"` y enviar `X-CSRF-Token` para rotación/cierre cuando corresponda.

### Proyectos `/api/projects`

| Método y ruta | Acceso | Función |
|---|---|---|
| `GET /` | Público | Catálogo |
| `GET /:projectId` | Público | Detalle |
| `GET /profiles/:userId` | Público | Perfil y proyectos |
| `GET /mine` | Usuario | Proyectos propios |
| `POST /` | Usuario | Crear |
| `PUT /:projectId` | Propietario | Editar |
| `DELETE /:projectId` | Propietario | Eliminar |
| `GET/PUT /profile/social` | Usuario | Redes y visibilidad |

Las galerías aceptan JPEG, PNG o WebP, máximo seis imágenes y 12 MB totales serializados en la solicitud.

### Convocatorias `/api/calls`

- Público: listado y detalle de convocatorias activas.
- Usuario: postulación a convocatoria interna y listado propio.
- Administrador: crear/eliminar; listar, obtener, editar y cambiar visibilidad; listar, decidir o eliminar postulaciones.
- Las convocatorias externas exigen `enlaceExterno`; no generan postulación interna.

### Administración `/api/admin`

Todo el grupo exige rol `administrador`:

- Usuarios paginados, consentimientos, cambio de rol y estado.
- Listado y eliminación administrativa de proyectos.

### Categorías

- `/api/categories`: lectura pública; alta/baja administrativa para proyectos.
- `/api/call-categories`: lectura pública; alta/baja administrativa para convocatorias.
- No se elimina una categoría mientras esté en uso.

### Contacto `/api/contact`

- `POST /`: mensaje general.
- `POST /family`: solicitud de incorporación a la red.
- Ambos tienen validación estricta y límite de cinco envíos cada 15 minutos.

### Playa `/api/beach-registrations`

| Método y ruta | Acceso | Función |
|---|---|---|
| `POST /` | Público limitado | Registrar en jornada abierta |
| `GET /active` | Público | Jornada abierta actual |
| `GET /admin?eventId=` | Administrador | Registros nominales |
| `GET /admin/events` | Administrador | Jornadas y totales |
| `POST /admin/events` | Administrador | Cerrar la actual y crear otra |
| `PATCH /admin/events/:id/status` | Administrador | Abrir/cerrar |

Sólo puede existir una jornada abierta por el índice parcial de PostgreSQL.

## Seguridad de autenticación

- Contraseñas: Argon2id.
- Access token: JWT configurable, 15 minutos por defecto.
- Refresh: token opaco aleatorio, hash SHA-256 en base y familia rotatoria.
- CSRF: token asociado a la sesión y comparación segura.
- Reutilización: revoca toda la familia.
- MFA: TOTP cifrado, contador consumido y códigos de recuperación hasheados.
- Verificación/recuperación: tokens de un solo uso almacenados como SHA-256.
- RBAC: middleware y comprobación del usuario activo/rol actual.
- Encabezados: Helmet, CORS con origen único y autenticación sin caché.
- Entrada: esquemas Zod y consultas parametrizadas.

## Correo

Selecciona Gmail o Namecheap sin cambiar código:

```env
EMAIL_ENABLED=true
EMAIL_PROVIDER=gmail
EMAIL_USER=cuenta@gmail.com
EMAIL_PASSWORD=contraseña-de-aplicacion
EMAIL_FROM_NAME=MICE-LO
EMAIL_FROM_ADDRESS=cuenta@gmail.com
ADMIN_EMAIL=administracion@ejemplo.com
```

Para Namecheap usa `EMAIL_PROVIDER=namecheap`; por defecto se conecta a `mail.privateemail.com:465` con TLS. Se puede sobrescribir host, puerto y modo seguro.

```bash
npm run email:verify
```

En desarrollo con correo desactivado pueden exponerse tokens para pruebas. Nunca se exponen en `test` ni producción, y producción no inicia con correo desactivado.

## Migraciones

```bash
npm run db:migrate
```

El migrador guarda nombre y SHA-256 en `schema_migrations`. No edites un SQL aplicado. Aunque existen dos archivos con prefijo `015`, sus nombres completos son distintos y el migrador los ordena lexicográficamente; nuevos cambios deben usar el siguiente número disponible.

## Mantenimiento

La limpieza elimina en lotes tokens caducados/usados y conserva sesiones para auditoría según las variables de retención. Usa un advisory lock para evitar ejecuciones simultáneas.

```bash
npm run db:cleanup
npm run auth:smoke
npm run admin:promote
```

## Pruebas

```bash
npm test
npm run test:integration
npm run test:all
```

La integración necesita una base migrada cuyo nombre contenga `test` o `testing` como segmento y:

```env
DB_NAME=mice_lo_test
ALLOW_DATABASE_RESET_FOR_TESTS=mice_lo_test
```

Cubre evidencia legal, verificación, sesión/cookies, CSRF, rotación y reutilización, revocación, RBAC y MFA. Las pruebas unitarias cubren validación, autorización, imágenes, sesiones, MFA y comportamiento de tokens de desarrollo.

## Pendientes técnicos

- Endpoint agregado de analítica de playa y separación de datos nominales.
- Política y automatización de retención para CURP, IP y datos de participantes.
- Métricas/observabilidad, alertas y estrategia documentada de backups/restauración.
- Integración de Mercado Pago y webhooks si se habilitan pagos.
- Pruebas de integración para proyectos, convocatorias, contacto y jornadas.
