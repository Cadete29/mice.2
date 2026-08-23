# MICE-LO

Plataforma web socioambiental para conectar personas, comunidades y organizaciones mediante proyectos sostenibles, convocatorias y jornadas ambientales en Chiapas.

## Estado del proyecto

La solución ya es una aplicación full stack. El cliente React consume una API Express y la información persistente se almacena en PostgreSQL. El estado documentado corresponde al **22 de agosto de 2026**.

Funcionalidades implementadas:

- Sitio institucional responsive con páginas de objetivos, equipo, aliados, donativos y contacto.
- Registro, verificación de correo, inicio de sesión, recuperación de contraseña y cierre de sesión.
- Sesiones con JWT de corta duración, refresh token rotatorio en cookie `HttpOnly` y protección CSRF.
- MFA mediante TOTP y códigos de recuperación.
- Perfil público, fotografía, misión, visión, objetivos y redes sociales configurables.
- Publicación de proyectos con categorías y galerías de hasta seis imágenes.
- Convocatorias internas y externas, categorías, galerías y seguimiento de postulaciones.
- Panel de usuario y panel administrativo con control de roles y estado de cuentas.
- Formularios de contacto y de red de aliados conectados al servicio de correo.
- Jornadas de limpieza de playas, registro de participantes y analítica administrativa inicial.
- Evidencia versionada de consentimientos legales.
- Pruebas unitarias, integración con PostgreSQL, E2E con Playwright y CI en GitHub Actions.
- SEO técnico inicial mediante `sitemap.xml` y `robots.txt`.

Limitaciones conocidas:

- Donativos todavía redirige a la página general de Mercado Pago; no existe Checkout Pro ni conciliación de pagos.
- Las métricas de playa se calculan actualmente en el navegador con datos nominales; deben migrarse a consultas agregadas del backend.
- El sitemap contiene rutas estáticas. Los proyectos, convocatorias y perfiles con UUID necesitan generación dinámica.
- Los documentos legales son borradores pendientes de dictamen profesional.

## Arquitectura

```text
Navegador
  └─ frontend/ · React 19 + Vite 8
       └─ HTTPS/JSON y cookie HttpOnly
            └─ backend/ · Express 5
                 ├─ PostgreSQL · datos, sesiones y consentimientos
                 └─ SMTP · Gmail o Namecheap
```

## Tecnologías

| Área | Tecnología |
|---|---|
| Cliente | React 19, Vite 8, CSS Modules, Leaflet |
| API | Node.js 22, Express 5, Zod |
| Datos | PostgreSQL, migraciones SQL versionadas |
| Seguridad | Argon2id, JWT, refresh tokens opacos, TOTP, Helmet, CORS, rate limiting |
| Correo | Nodemailer con Gmail o Namecheap |
| Calidad | Node Test Runner, Playwright, ESLint, GitHub Actions |

## Estructura

```text
mice.2/
├── .github/workflows/quality.yml
├── backend/
│   ├── integration/
│   ├── sql/
│   ├── src/
│   ├── test/
│   └── README.md
├── docs/REVISION_LEGAL.md
├── frontend/
│   ├── e2e/
│   ├── public/
│   ├── src/
│   └── README.md
├── DOCUMENTACION_PROYECTO.md
└── README.md
```

## Requisitos

- Node.js 22.
- npm.
- PostgreSQL 17 o una versión compatible.
- Cuenta SMTP para los flujos reales de correo.

## Ejecución local

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run db:migrate
npm run dev
```

Configura primero las credenciales PostgreSQL y los secretos de `.env`. La API queda normalmente en `http://localhost:3000`.

### Frontend

En otra terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

El cliente queda normalmente en `http://localhost:5173` y usa `VITE_API_URL=http://localhost:3000/api`.

## Comandos principales

```bash
# backend
npm run dev
npm run db:migrate
npm test
npm run test:integration
npm run test:all
npm run auth:smoke
npm run email:verify
npm run admin:promote
npm run db:cleanup

# frontend
npm run dev
npm run lint
npm run build
npm run test:e2e
npm run preview
```

## Rutas web

| Tipo | Rutas |
|---|---|
| Públicas estáticas | `/`, `/chiapas-por-el-clima`, `/convocatorias`, `/nosotros`, `/nuestros-objetivos`, `/familia`, `/donativos`, `/seguridad` |
| Participación | `/registro-limpieza-playas` cuando existe una jornada abierta |
| Cuenta | `/sign-up`, `/dashboard` |
| Administración | `/administracion` |
| Públicas dinámicas | `/proyectos/:uuid`, `/convocatorias/:uuid`, `/perfiles/:uuid` |
| Legales | `/terminos-de-uso`, `/aviso-de-privacidad`, `/aviso-uso-de-imagen`, `/deslinde-de-responsabilidad` |

El cliente selecciona vistas con `window.location.pathname`; el hosting debe aplicar fallback de rutas hacia `index.html`.

## Producción

- Servir frontend y API exclusivamente mediante HTTPS.
- Configurar `FRONTEND_URL`, `VITE_API_URL`, `COOKIE_SECURE=true`, secretos únicos y `TRUST_PROXY` cuando corresponda.
- Activar SMTP y comprobarlo con `npm run email:verify`.
- Ejecutar todas las migraciones antes de iniciar la API.
- Completar el expediente de [revisión legal](docs/REVISION_LEGAL.md).
- Publicar `https://www.micelo.org/sitemap.xml` en Google Search Console.
- Configurar el servidor para que las rutas SPA devuelvan `index.html`, sin convertir errores reales de API o archivos en la SPA.

## Documentación

- [Arquitectura, módulos e historial](DOCUMENTACION_PROYECTO.md)
- [Backend y contrato del API](backend/README.md)
- [Frontend y componentes](frontend/README.md)
- [Revisión jurídica pendiente](docs/REVISION_LEGAL.md)

## Licencia

La licencia del proyecto aún no está definida.
