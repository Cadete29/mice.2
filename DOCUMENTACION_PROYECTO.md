# Documentación técnica y funcional de MICE-LO

**Corte de documentación:** 22 de agosto de 2026.

## 1. Propósito y alcance

MICE-LO es una plataforma socioambiental para publicar proyectos, conectar participantes, difundir convocatorias y operar actividades ambientales. Combina un sitio institucional con cuentas, perfiles públicos, paneles de gestión y una API persistente.

La arquitectura anterior, limitada a contenido JSX y formularios simulados, fue reemplazada por una solución full stack. PostgreSQL es ahora la fuente de verdad para usuarios, sesiones, proyectos, convocatorias, postulaciones, consentimientos y jornadas de playa.

## 2. Arquitectura actual

```text
React/Vite
  ├─ páginas públicas
  ├─ dashboard de usuario
  ├─ administración
  └─ authApi.js
          │ JSON + Bearer + cookies
          ▼
Express
  ├─ routes       contrato HTTP
  ├─ controllers  adaptación HTTP
  ├─ services     seguridad y reglas de negocio
  ├─ models       SQL y mapeo de entidades
  └─ middlewares  auth, roles, validación y errores
          │
          ├─ PostgreSQL
          └─ SMTP (Namecheap Private Email)
```

El frontend es una SPA sin React Router. El backend expone `/api`, aplica Helmet, CORS restringido, JSON de hasta 18 MB, cookies, errores uniformes y desactiva `x-powered-by`.

## 3. Módulos implementados

### Identidad y acceso

- Registro con nombres, correo normalizado, contraseña Argon2id y aceptación legal obligatoria.
- Confirmación de correo mediante token aleatorio de un solo uso almacenado como SHA-256.
- Login bloqueado hasta confirmar el correo.
- Protección contra intentos fallidos y bloqueo temporal.
- Access token JWT corto y refresh token opaco rotatorio.
- Refresh token en cookie `HttpOnly`; token CSRF asociado a la sesión.
- Detección de reutilización que revoca la familia completa de sesiones.
- Consulta, revocación individual y cierre de todas las sesiones.
- Recuperación de contraseña con token de un solo uso y expiración de 30 minutos.
- MFA TOTP, prevención de reutilización de ventana y códigos de recuperación.
- Roles `usuario` y `administrador`, validados nuevamente contra PostgreSQL.

### Perfiles y proyectos

- Perfil con fotografía, descripción, misión, visión y objetivos.
- Redes sociales configurables y controles de visibilidad independientes.
- Perfil público por UUID con proyectos publicados.
- CRUD de proyectos propios.
- Galería de una a seis imágenes con selección de principal.
- Categorías administrables; no se permite eliminar una categoría en uso.
- Moderación administrativa y eliminación de proyectos.

### Convocatorias

- Convocatorias internas y externas.
- Galerías de hasta seis imágenes y categoría independiente de proyectos.
- Publicación, edición, visibilidad y eliminación desde administración.
- Las externas enlazan al sitio de postulación.
- Las internas registran una sola postulación por usuario y conservan los contactos autorizados en ese momento.
- Estados de postulación: pendiente, aprobada o rechazada.

### Comunicación

- Formulario general de contacto.
- Formulario para integrarse a la red Familia.
- Correos de verificación, recuperación, confirmación de registro de playa y avisos administrativos.
- Plantillas HTML y texto plano.
- SMTP configurado para Namecheap Private Email, con timeouts configurables.

### Limpieza de playas

- Jornadas numeradas con estado abierto/cerrado; sólo puede haber una abierta.
- El Hero y el formulario consultan la jornada activa.
- Registro con nombre, nacimiento, CURP, país/lada/teléfono, correo y necesidad de transporte.
- Consentimientos obligatorios de privacidad, uso de imagen y deslinde.
- Panel nominal restringido a administradores.
- Selección de jornadas históricas, apertura, cierre y creación de la siguiente jornada.
- Analítica inicial: participantes, transporte, edad promedio, distribución etaria, país telefónico y tendencia de siete días.
- Vista imprimible de operación.

La analítica todavía se calcula en React a partir del conjunto nominal. Por privacidad y escalabilidad debe convertirse en un endpoint SQL agregado.

### Administración

- Resumen operativo.
- Listado paginado y búsqueda de usuarios.
- Cambio de rol y estado, con restricciones para impedir acciones administrativas peligrosas sobre la propia cuenta.
- Evidencia de consentimientos por usuario.
- Proyectos, categorías, convocatorias, postulaciones y jornadas de playa.

## 4. Rutas del frontend

| Ruta | Acceso | Vista |
|---|---|---|
| `/` | Público | Inicio |
| `/chiapas-por-el-clima` | Público | Proyectos |
| `/proyectos/:uuid` | Público | Detalle de proyecto |
| `/convocatorias` | Público | Convocatorias activas |
| `/convocatorias/:uuid` | Público | Detalle/postulación |
| `/perfiles/:uuid` | Público | Perfil comunitario |
| `/nosotros` | Público | Organización y equipo |
| `/nuestros-objetivos` | Público | Objetivos institucionales; sin Footer |
| `/familia` | Público | Aliados y contacto |
| `/donativos` | Público | Flujo visual de donación |
| `/registro-limpieza-playas` | Público condicionado | Registro de jornada activa |
| `/sign-up` | Público | Acceso, alta, verificación y recuperación |
| `/dashboard` | Usuario | Gestión personal |
| `/administracion` | Administrador | Gestión global |
| `/seguridad` | Público | Información de seguridad |
| rutas legales | Público | Términos y avisos |

Las rutas desconocidas terminan mostrando el inicio porque `App.jsx` usa una cadena condicional. El hosting debe resolver la SPA y conviene añadir posteriormente una vista 404 explícita.

## 5. Datos y migraciones

Las migraciones viven en `backend/sql/`, se ejecutan por nombre y se registran con SHA-256 en `schema_migrations`. Una migración aplicada no debe editarse; cualquier cambio requiere un archivo nuevo.

| Migraciones | Alcance |
|---|---|
| `001`–`007` | usuarios, sesiones, MFA, recuperación, verificación, CSRF y evidencia legal |
| `008` | perfiles sociales y proyectos |
| `009` | convocatorias y postulaciones |
| `010`–`014` | categorías, fotografía/detalles del perfil y redes adicionales |
| `015_project_gallery` | galería de proyectos |
| `015_call_facebook`–`016` | Facebook, tipos, categorías y galería de convocatorias |
| `017`–`018` | registros y jornadas de limpieza de playas |

Entidades principales: `usuarios`, `sesiones`, `codigos_recuperacion_mfa`, `tokens_recuperacion_password`, `tokens_verificacion_correo`, `consentimientos_legales`, `perfiles_sociales`, `proyectos`, `proyecto_imagenes`, `categorias`, `convocatorias`, `convocatoria_imagenes`, `categorias_convocatorias`, `postulaciones_convocatoria`, `registros_limpieza_playas` y `jornadas_limpieza_playas`.

## 6. Seguridad y privacidad

- Validación estricta con Zod y rechazo de campos inesperados en entradas sensibles.
- Consultas parametrizadas mediante `pg`.
- Argon2id para contraseñas.
- Tokens de verificación/recuperación almacenados sólo como hash.
- Secreto MFA cifrado; la clave debe ser distinta del secreto JWT en producción.
- Cookies seguras y HTTPS obligatorios en producción.
- Rate limiting en autenticación, contacto y registros de playa.
- `Cache-Control: no-store` en autenticación.
- Registro de versión, hashes documentales, IP, dispositivo y evidencia HMAC de consentimiento.
- Limpieza periódica coordinada con advisory lock de PostgreSQL.

Los datos de CURP, teléfono, nacimiento e IP requieren acceso mínimo, retención definida y revisión jurídica antes de producción.

## 7. Calidad

### Backend

Las pruebas unitarias cubren esquemas de autenticación, proyectos, convocatorias, contacto y playa; autorización; fotos; sesiones; MFA y exposición segura de tokens de desarrollo.

La integración usa PostgreSQL real y comprueba registro legal, confirmación, cookies, CSRF, rotación/reutilización, revocación inmediata, RBAC y MFA. Sólo permite limpieza cuando la base contiene `test`/`testing` como segmento y `ALLOW_DATABASE_RESET_FOR_TESTS` coincide con `DB_NAME`.

### Frontend

Playwright cubre login MFA, error SMTP durante registro y limpieza del token de verificación de la URL. ESLint y el build forman parte del control automático.

### Integración continua

`.github/workflows/quality.yml` ejecuta en push y pull request:

- PostgreSQL 17, migraciones, pruebas backend y auditoría de dependencias.
- Lint, build, Chromium, E2E y auditoría frontend.

## 8. SEO y despliegue

`frontend/public/sitemap.xml` enumera rutas públicas estáticas del dominio `https://www.micelo.org`. `robots.txt` enlaza el mapa y excluye cuenta/administración.

Pendiente:

- Metadata y canonical específicos por página.
- Sitemap dinámico para proyectos, convocatorias y perfiles.
- Enviar el mapa a Google Search Console tras desplegarlo.
- Verificar que `www.micelo.org` sea el dominio canónico definitivo y redirigir cualquier variante.

## 9. Avances desde la documentación anterior

La última documentación describía una maqueta frontend. Desde entonces se incorporaron:

1. API Express y PostgreSQL con migraciones verificables.
2. Autenticación completa, correo, sesiones rotatorias, CSRF, MFA y RBAC.
3. Consentimientos legales versionados y evidencia auditable.
4. Dashboard de usuario, perfil público, fotografía y redes.
5. Proyectos persistentes, galerías, categorías y moderación.
6. Convocatorias persistentes, tipos interno/externo, galerías, categorías y postulaciones.
7. Administración de usuarios, contenido y consentimientos.
8. Formularios de Contacto y Familia conectados a correo.
9. Registro persistente de playa y administración de jornadas históricas.
10. Analítica operativa e impresión de participantes.
11. Suites unitarias, integración, E2E y pipeline de CI.
12. `sitemap.xml` y `robots.txt` para el inicio del trabajo SEO.
13. Renovación visual responsive de páginas, navegación y componentes administrativos.

## 10. Trabajo pendiente priorizado

### Antes de producción

1. Dictamen y cierre de documentos legales; configurar hashes definitivos.
2. Infraestructura HTTPS, secretos, cookies seguras, proxy y copias de seguridad.
3. Activar y verificar SMTP real.
4. Sustituir datos, imágenes, cuentas y enlaces provisionales.
5. Integrar pagos reales si se habilitarán donativos.
6. Ejecutar CI completa y pruebas manuales responsive/accesibilidad.

### Siguiente evolución técnica

1. Endpoint agregado para analítica de playa sin exponer datos nominales.
2. Modelo de resultados por jornada: asistencia, residuos, ubicación, horas e impacto.
3. Metadata SEO por vista y sitemap dinámico.
4. Políticas de retención, exportación y eliminación de datos personales.
5. Pruebas de proyectos, convocatorias y panel administrativo.
6. Optimización de imágenes y eventual adopción de router.

## 11. Convenciones de mantenimiento

- Mantener controladores delgados y reglas reutilizables en servicios/modelos.
- Validar todo dato externo antes de llegar a SQL.
- No editar migraciones aplicadas.
- Añadir pruebas para cambios de seguridad y contratos HTTP.
- Actualizar este archivo, los README específicos y el expediente legal en el mismo cambio funcional.
- No registrar `.env`, credenciales, tokens ni datos personales reales.
