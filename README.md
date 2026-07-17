# MICE-LO

Plataforma web socioambiental enfocada en conectar personas, comunidades y organizaciones para impulsar proyectos sostenibles, convocatorias y acciones de restauración en Chiapas.

El sitio combina una identidad visual inspirada en la naturaleza con catálogos de proyectos, mapas, formularios, carruseles, perfiles institucionales y un flujo visual de donativos.

## Características

- Página principal con composiciones botánicas y efectos parallax.
- Catálogo de proyectos de **Chiapas por el Clima**.
- Catálogo de convocatorias comunitarias.
- Página institucional con misión, visión y equipo directivo.
- Sección de objetivos estratégicos.
- Red de aliados y proveedores con carrusel automático.
- Inicio de sesión, registro y recuperación de contraseña.
- Registro para jornadas de limpieza de playas.
- Carrusel fotográfico con transición de desvanecido.
- Flujo de donativos por destino y cantidad.
- Acceso a Mercado Pago.
- Mapa interactivo de proyectos con Leaflet.
- Diseño responsive para escritorio, tablet y móvil.
- Navegación accesible y compatibilidad con reducción de movimiento.

## Tecnologías

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- JavaScript y JSX
- CSS Modules
- [Leaflet](https://leafletjs.com/)
- ESLint

## Requisitos

- Node.js compatible con Vite 8.
- npm.

## Instalación

Clona el repositorio y entra al frontend:

```bash
git clone URL_DEL_REPOSITORIO
cd mice.2/frontend
```

Instala las dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará la dirección local, normalmente:

```text
http://localhost:5173
```

## Scripts

Desde la carpeta `frontend/`:

```bash
npm run dev      # inicia el entorno de desarrollo
npm run build    # genera la compilación de producción
npm run lint     # ejecuta ESLint
npm run preview  # muestra una vista previa del build
```

La compilación se genera en `frontend/dist/`. Esta carpeta no se incluye en Git.

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Página principal |
| `/chiapas-por-el-clima` | Catálogo de proyectos comunitarios |
| `/convocatorias` | Catálogo de convocatorias |
| `/nosotros` | Misión, visión y equipo directivo |
| `/nuestros-objetivos` | Objetivos institucionales |
| `/familia` | Aliados, proveedores y contacto |
| `/sign-up` | Login, registro y recuperación de contraseña |
| `/registro-limpieza-playas` | Registro para jornadas de limpieza |
| `/donativos` | Selección de destino y cantidad del donativo |

> El proyecto selecciona las vistas mediante `window.location.pathname`. En producción, el servidor debe redirigir las rutas desconocidas hacia `index.html`.

## Estructura

```text
mice.2/
├── README.md
├── DOCUMENTACION_PROYECTO.md
├── .gitignore
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/       # imágenes y recursos gráficos
    │   ├── components/   # Header, Footer y secciones de inicio
    │   ├── pages/        # páginas independientes
    │   ├── App.jsx       # selección de rutas y layout global
    │   ├── index.css     # variables y estilos globales
    │   └── main.jsx      # entrada de React
    ├── package.json
    └── vite.config.js
```

## Sistema visual

Los colores principales se encuentran en `frontend/src/index.css`:

```css
:root {
  --bg: #fff6e7;
  --green-bg: #39501f;
  --green-bg-letters: #39501f;
  --green-bg-letters2: #3d5021;
}
```

La interfaz utiliza:

- Fondo crema.
- Gradientes verdes.
- Fotografías naturales.
- Tarjetas redondeadas.
- Sombras y acabados skeuomórficos.
- Efectos parallax y transiciones de desvanecido.

## Donativos y Mercado Pago

La página de donativos permite:

1. Seleccionar el destino.
2. Escribir una cantidad en MXN.
3. Elegir una cantidad sugerida.
4. Continuar hacia Mercado Pago.

Actualmente el botón dirige a la página general de Mercado Pago. Para procesar pagos reales es necesario integrar Checkout Pro o configurar enlaces de pago específicos mediante un backend seguro.

## Estado de los formularios

Los formularios están implementados visualmente y cuentan con validaciones HTML básicas, pero todavía no envían ni almacenan información.

Antes de publicar en producción será necesario conectar:

- Formulario de contacto.
- Registro e inicio de sesión.
- Recuperación de contraseña.
- Mensajes de la página Familia.
- Registro de limpieza de playas.
- Flujo real de Mercado Pago.

## Recursos provisionales

Algunos nombres, correos, números de WhatsApp, usuarios sociales, proyectos, convocatorias, fotografías y logotipos son datos de demostración. Deben sustituirse por información definitiva antes del lanzamiento.

## Documentación

Consulta [DOCUMENTACION_PROYECTO.md](DOCUMENTACION_PROYECTO.md) para conocer la arquitectura, componentes, personalización, recursos, comportamiento responsive y recomendaciones técnicas.

## Build verificado

El proyecto se verifica con:

```bash
npm run build
```

## Licencia

La licencia del proyecto todavía no ha sido definida.
