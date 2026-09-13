# Frontend MICE-LO

Cliente web React 19 construido con Vite 8. Consume la API MICE-LO mediante `src/services/authApi.js` y mantiene estilos por componente con CSS Modules.

## Inicio

```bash
npm install
copy .env.example .env
npm run dev
```

Variable disponible:

```env
VITE_API_URL=https://xiuhcoatltech.com.mx/api
```

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # salida de producción en dist/
npm run preview   # vista previa de dist/
npm run lint      # ESLint
npm run test:e2e  # Playwright
```

## Organización del código

```text
src/
├── assets/       # fotografías y gráficos procesados por Vite
├── components/   # secciones, tarjetas, formularios y administración
├── pages/        # vistas asociadas a rutas
├── services/     # cliente HTTP y ciclo de sesión
├── utils/        # autenticación requerida y formato de texto
├── App.jsx       # resolución de rutas
├── index.css     # variables y base visual
└── main.jsx
```

## Navegación

No se usa React Router. `App.jsx` compara `window.location.pathname`. Las rutas de detalle aceptan UUID: `/proyectos/:uuid`, `/convocatorias/:uuid` y `/perfiles/:uuid`.

El hosting debe devolver `index.html` para rutas web desconocidas. `/administracion` y `/dashboard` verifican sesión y rol, y redirigen a `/sign-up` cuando no corresponde el acceso.

## Cliente HTTP y sesiones

`src/services/authApi.js` centraliza las solicitudes:

- Guarda access token y token CSRF en `sessionStorage`.
- Envía el refresh token sólo como cookie con `credentials: "include"`.
- Añade `Authorization: Bearer` a solicitudes autenticadas.
- Ante un `401`, intenta una renovación y repite la solicitud una vez.
- Comparte la promesa de renovación para evitar refresh simultáneos.
- Limpia la sesión local después de logout o revocación.
- Uniforma errores con `ApiError` (`message`, `code`, `status`).

## Áreas funcionales

### Sitio público

- Inicio con Hero, About, proyectos destacados y Contacto.
- Catálogo y detalle de proyectos desde la API.
- Catálogo y detalle de convocatorias activas.
- Perfiles públicos con descripción, misión, visión, objetivos, redes y proyectos.
- Páginas institucionales, legales, aliados y donativos.
- Contacto general y Familia conectados al servicio de correo.

### Cuenta de usuario

`SignUp.jsx` coordina registro, login, MFA, confirmación y recuperación. `UserDashboard.jsx` permite consultar y publicar proyectos, configurar redes, revisar postulaciones, editar el perfil, subir fotografía y gestionar MFA y sesiones.

Los proyectos admiten hasta seis imágenes JPEG, PNG o WebP de máximo 3 MB cada una. La fotografía de perfil admite esos formatos hasta 2 MB.

### Administración

`Administration.jsx` integra usuarios, roles, estado de cuentas, consentimientos, moderación de proyectos, convocatorias, postulaciones, categorías, participantes de playa y administración/analítica de jornadas.

### Jornadas de playa

`RegistroPlayas.jsx` comprueba que exista una jornada abierta. Solicita identidad, CURP, fecha de nacimiento, teléfono, transporte y tres consentimientos obligatorios.

`AdminBeachAnalytics.jsx` muestra total, transporte, edad media, grupos de edad, países telefónicos y registros de siete días. Actualmente descarga registros nominales y calcula métricas en cliente; debe migrarse a agregaciones del backend.

## SEO

Vite copia estos archivos de `public/` a la raíz de `dist/`:

- `sitemap.xml`: rutas públicas estables de `https://micelo.org`.
- `robots.txt`: referencia el sitemap y excluye `/administracion`, `/dashboard` y `/sign-up`.

`src/seo.js` define títulos, descripciones, canonical, Open Graph y tarjetas sociales. La portada incluye datos estructurados de la organización. `main.jsx` aplica los metadatos según la URL.

`npm run build` genera HTML con metadatos por ruta (`nosotros.html`, etc.), un fallback neutro `spa.html` y un sitemap sincronizado con las páginas públicas. El servidor debe resolver las rutas sin extensión a estos archivos; consulta [la guía de despliegue y Search Console](../docs/SEO_GOOGLE.md).

El contenido de las páginas sigue renderizándose con React. Las rutas con UUID tienen metadatos genéricos en cliente y todavía requieren metadatos específicos del contenido y generación dinámica del sitemap.

## Accesibilidad y responsive

Hay navegación móvil, cuadrículas adaptativas, etiquetas accesibles, imágenes decorativas ocultas cuando corresponde, soporte parcial de `prefers-reduced-motion` y diseño de impresión para participantes de playa. Se recomienda revisar 390, 768, 1024, 1440 y 1920 px y el recorrido por teclado.

## Pruebas E2E

`e2e/auth.spec.js` cubre login con MFA, registro cuando falla SMTP y limpieza del token de verificación de la URL. La CI instala Chromium antes de ejecutar Playwright.

## Pendientes

- Integrar Mercado Pago real.
- Generar sitemap para contenido dinámico.
- Sustituir contenido e imágenes provisionales y optimizar recursos pesados.
- Considerar un router si continúa creciendo el número de vistas.
- Ampliar pruebas E2E a proyectos, convocatorias y administración.
