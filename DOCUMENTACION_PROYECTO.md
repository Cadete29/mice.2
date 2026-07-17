# Documentación del proyecto MICE-LO

## 1. Descripción general

MICE-LO es un sitio web institucional y ambiental enfocado en proyectos, convocatorias, organización interna y objetivos socioambientales en Chiapas. La interfaz utiliza una identidad visual orgánica basada en tonos verdes, fondo crema, fotografías de naturaleza, tarjetas y efectos de profundidad.

El proyecto está construido como una aplicación frontend con React y Vite. No utiliza backend ni base de datos actualmente; la información se encuentra definida directamente en los componentes JSX.

## 2. Tecnologías

- React 19.
- React DOM 19.
- Vite 8.
- CSS Modules para estilos encapsulados.
- CSS global para variables y estilos base.
- Leaflet para el mapa de proyectos.
- ESLint para análisis estático.
- JavaScript con JSX.

## 3. Ubicación y estructura

El frontend está ubicado en `frontend/`.

```text
mice.2/
├── DOCUMENTACION_PROYECTO.md
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   │   ├── about/
    │   │   ├── contacto/
    │   │   ├── hero/
    │   │   ├── objects/
    │   │   └── objets/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

> Nota: existen dos carpetas de recursos llamadas `objects` y `objets`. La imagen panorámica `pie.jpg` se encuentra en `assets/objets/`.

## 4. Instalación y ejecución

Requisitos:

- Node.js compatible con Vite 8.
- npm.

Desde la carpeta `frontend/`:

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

Comandos disponibles:

```bash
npm run dev      # servidor de desarrollo
npm run build    # compilación para producción
npm run lint     # revisión con ESLint
npm run preview  # vista previa del build
```

La compilación se genera en `frontend/dist/`.

## 5. Entrada y navegación

`src/main.jsx` monta `<App />` en el elemento `#root`.

`src/App.jsx` mantiene el Header en todas las vistas y decide qué página mostrar mediante `window.location.pathname`. El proyecto no usa React Router.

| Ruta | Vista | Footer |
|---|---|---|
| `/` | Inicio: Hero, About, Objetivos y Contacto | Sí |
| `/chiapas-por-el-clima` | Catálogo comunitario de proyectos | Sí |
| `/convocatorias` | Catálogo de convocatorias | Sí |
| `/nosotros` | Misión, visión y equipo directivo | Sí |
| `/nuestros-objetivos` | Seis objetivos institucionales | No |
| `/familia` | Red de aliados, proveedores y formulario de contacto | Sí |
| `/sign-up` | Inicio de sesión, registro y recuperación de contraseña | Sí |
| `/registro-limpieza-playas` | Formulario de participación en limpieza de playas | Sí |
| `/donativos` | Selección de destino, monto y acceso a Mercado Pago | Sí |

Para producción, el servidor debe redirigir las rutas desconocidas hacia `index.html`, ya que la selección de vistas ocurre en el navegador.

## 6. Componentes compartidos

### Header

Archivos:

- `src/components/Header.jsx`
- `src/components/Header.module.css`

Características:

- Posición fija en la parte superior.
- Logo con enlace al inicio.
- Menú en forma de cápsula verde.
- Menú hamburguesa en pantallas pequeñas.
- Enlaces a páginas y secciones internas.

Al ser fijo, las páginas deben reservar espacio superior suficiente para evitar que el contenido quede detrás del Header.

### Footer

Archivos:

- `src/components/Footer.jsx`
- `src/components/Footer.module.css`

Incluye identidad de MICE-LO, navegación, datos de contacto, redes sociales y enlaces legales. Se renderiza globalmente excepto en `/nuestros-objetivos`.

### Hero

Archivos:

- `src/components/Hero.jsx`
- `src/components/Hero.module.css`

Sección principal de inicio con titular, botones e imágenes superpuestas. Usa JavaScript y variables CSS para crear parallax durante el scroll. Respeta `prefers-reduced-motion`.

### About

Archivos:

- `src/components/About.jsx`
- `src/components/About.module.css`

Presenta la organización, sus actividades y su forma de trabajo. Incluye imágenes decorativas y parallax.

### Objetivos del inicio

Archivos:

- `src/components/Objetivos.jsx`
- `src/components/Objetivos.css`

Contiene proyectos activos y un mapa Leaflet de Chiapas. Los proyectos están definidos en el arreglo `proyectosActivos`, con nombre, ubicación, coordenadas y descripción.

### Contacto

Archivos:

- `src/components/Contacto.jsx`
- `src/components/Contacto.module.css`

Incluye formulario, elementos botánicos y animaciones parallax. Actualmente `handleSubmit` evita la recarga, pero no envía información a un servidor.

## 7. Páginas

### Chiapas por el Clima

Archivos:

- `src/pages/ChiapasPorElClima.jsx`
- `src/pages/ChiapasPorElClima.module.css`

Muestra un catálogo de proyectos de diferentes personas. Cada tarjeta contiene:

- Miniatura.
- Título.
- Descripción breve.
- Creador.
- Invitación para unirse.
- Correo.
- WhatsApp con SVG.
- Instagram, Facebook, X, TikTok, YouTube y LinkedIn con SVG.

Los datos se editan en el arreglo `projects`. Los números de WhatsApp deben incluir código de país sin `+`, espacios ni guiones.

Ejemplo:

```js
{
  image: bosque,
  title: 'Nombre del proyecto',
  description: 'Descripción breve.',
  author: 'Nombre de la persona',
  email: 'correo@ejemplo.com',
  whatsapp: '529611234567',
  social: 'nombredeusuario',
}
```

En escritorio se muestran cuatro tarjetas por fila. La cuadrícula se adapta a tres, dos o una columna según el ancho disponible.

### Convocatorias

Archivo:

- `src/pages/Convocatorias.jsx`

Reutiliza los estilos del catálogo de Chiapas por el Clima. Sus registros se encuentran en el arreglo `convocatorias`. Cada tarjeta incluye imagen, descripción, organización convocante, correo, WhatsApp y redes sociales.

### Nosotros

Archivos:

- `src/pages/Nosotros.jsx`
- `src/pages/Nosotros.module.css`

Incluye:

- Presentación institucional.
- Botón hacia `/nuestros-objetivos`.
- Misión.
- Visión.
- Equipo de dirección.

El equipo se configura mediante el arreglo `team`. Está organizado en una sola línea con el CEO en el centro:

1. Dirección de Logística.
2. Dirección de Tecnología.
3. Dirección de Administración.
4. CEO.
5. Dirección de Tesorería.
6. Dirección de Acercamiento Social.
7. Dirección de Alianzas.

Las fotografías usan formato vertical `3:4`. En móviles, la fila permite desplazamiento horizontal.

Para sustituir una fotografía:

1. Copiar la imagen a una carpeta dentro de `src/assets/`.
2. Importarla en `Nosotros.jsx`.
3. Asignarla a la propiedad `photo` del perfil correspondiente.
4. Cambiar `name` por el nombre real.

### Nuestros Objetivos

Archivos:

- `src/pages/NuestrosObjetivos.jsx`
- `src/pages/NuestrosObjetivos.module.css`

La vista presenta seis objetivos en una cuadrícula compacta de tres columnas por dos filas en escritorio. Todas las tarjetas tienen altura uniforme y fondo blanco sólido.

Los objetivos se editan en el arreglo `objectives`:

```js
{
  number: '01',
  title: 'Título del objetivo',
  description: 'Descripción del objetivo.',
}
```

La imagen `src/assets/objets/pie.jpg` aparece en la parte inferior, ocupa más que el ancho del viewport y sube detrás de la segunda fila aproximadamente una cuarta parte de la altura de una tarjeta. Las tarjetas permanecen por encima mediante `z-index`.

Esta es la única página que no muestra Footer.

### Familia

Archivos:

- `src/pages/Familia.jsx`
- `src/pages/Familia.module.css`

La página `/familia` presenta la red de aliados de MICE-LO. Su composición incluye:

- `mexicoam.jpg` en el lado izquierdo, conservando su proporción original.
- Tarjeta con gradiente verde superpuesta sobre la imagen.
- Formulario visual para enviar un mensaje.
- Título “Quieres ser parte de nuestra red de aliados?”.
- `ambi.jpg` anclada en la esquina inferior derecha.
- Carrusel de aliados y proveedores.

El carrusel cambia automáticamente cada dos segundos y aplica una transición de desvanecido de entrada y salida. El visor es cuadrado, no tiene fondo y utiliza `object-fit: contain`, por lo que está preparado para logotipos PNG y SVG con transparencia.

Las imágenes provisionales del carrusel se configuran en el arreglo `aliados` de `Familia.jsx`. Los indicadores de posición se encuentran comentados temporalmente en JSX.

El formulario de mensaje evita la recarga de la página, pero todavía no envía información a un servidor.

### Sign-up

Archivos:

- `src/pages/SignUp.jsx`
- `src/pages/SignUp.module.css`

La ruta `/sign-up` reúne tres estados de autenticación dentro de una misma interfaz:

- Inicio de sesión.
- Registro de usuario.
- Recuperación de contraseña.

El estado local `view` determina qué formulario se muestra. La interfaz incluye validaciones HTML básicas, campos de contraseña, confirmación, aceptación de términos y navegación entre estados.

Actualmente no existe un servicio de autenticación. Los formularios son visuales y deben conectarse posteriormente a un backend o proveedor de identidad.

### Registro de Limpieza de Playas

Archivos:

- `src/pages/RegistroPlayas.jsx`
- `src/pages/RegistroPlayas.module.css`

La página `/registro-limpieza-playas` se abre desde el botón correspondiente del Hero. Está distribuida en dos columnas:

- Carrusel fotográfico en el lado izquierdo.
- Información, recomendaciones y formulario en el lado derecho.

El carrusel utiliza estas imágenes de `src/assets/limpieza de playas/`:

- `playalim.jpeg`.
- `playalim2.jpeg`.
- `playalim3.jpeg`.
- `playalim4.jpeg`.

Las fotografías cambian cada dos segundos con desvanecido y un ligero efecto de escala. En escritorio, el panel permanece visible mediante `position: sticky`; en pantallas pequeñas se coloca encima del formulario.

El formulario solicita nombre, apellidos, correo, WhatsApp, municipio, edad, jornada, organización, comentarios y aceptación del aviso de privacidad. Todavía no almacena ni envía datos.

### Donativos

Archivos:

- `src/pages/Donativos.jsx`
- `src/pages/Donativos.module.css`

La ruta `/donativos` se abre desde el botón “Donativos” del Hero. Utiliza el fondo crema global y una composición dividida entre el título y el flujo de donación.

El primer paso muestra cuatro destinos en una cuadrícula 2 × 2:

- Restauración de ecosistemas.
- Limpieza de playas.
- Educación ambiental.
- Proyectos comunitarios.

Las tarjetas usan el gradiente `linear-gradient(135deg, #3d5121, #7f9544)` y un acabado skeuomórfico con iluminación direccional, reflejo, textura sutil, sombras exteriores y profundidad interior.

Al seleccionar una tarjeta:

1. Desaparece la cuadrícula.
2. Se muestra el destino elegido.
3. Aparece el campo para introducir la cantidad en MXN.
4. Se ofrecen cantidades rápidas de $100, $250, $500 y $1,000.
5. El usuario puede volver y cambiar el destino.
6. El botón “Donar” dirige a Mercado Pago.

El estado `selectedDestination` controla el paso visible y `amount` almacena temporalmente la cantidad. La imagen decorativa `src/assets/donativo/donar1.jpg` se muestra como una esfera en la zona inferior izquierda.

La URL actual dirige a la página general de Mercado Pago. Para procesar pagos reales, conservar el monto y relacionar la transacción con el destino seleccionado es necesario integrar Mercado Pago Checkout Pro o utilizar enlaces de pago específicos.

## 8. Sistema visual

Las variables globales se encuentran en `src/index.css`:

```css
:root {
  --bg: #fff6e7;
  --green-bg: #39501f;
  --green-bg-letters: #39501f;
  --green-bg-letters2: #3d5021;
}
```

Principios visuales actuales:

- Fondo principal crema.
- Verdes oscuros para encabezados y navegación.
- Gradientes verdes para llamadas a la acción.
- Bordes redondeados amplios.
- Sombras suaves.
- Fotografías naturales como contenido y decoración.
- Diseño responsive con puntos de quiebre definidos en cada módulo CSS.

## 9. Recursos gráficos

Las imágenes importadas desde `src/assets/` pasan por el procesamiento de Vite. Los principales grupos son:

- `hero/`: composiciones de portada.
- `about/`: elementos de la sección institucional.
- `contacto/`: hojas, polen y composiciones de contacto.
- `objects/`: recursos naturales usados en proyectos, mapas y perfiles temporales.
- `objets/`: panorama inferior de objetivos y recursos adicionales.

Los perfiles y proyectos utilizan actualmente imágenes ambientales como contenido provisional. Deben sustituirse por fotografías definitivas antes de publicar.

## 10. Responsive y accesibilidad

El proyecto contempla:

- Navegación móvil con botón hamburguesa.
- Cuadrículas que reducen columnas progresivamente.
- Equipo directivo con scroll horizontal en móvil.
- Imágenes decorativas con `alt=""` o `aria-hidden`.
- Etiquetas `aria-label` para enlaces con íconos.
- Respeto a `prefers-reduced-motion` en las secciones animadas.
- SVG con `currentColor` para mantener contraste durante hover.

Se recomienda verificar manualmente las vistas en 390 px, 768 px, 1024 px, 1440 px y 1920 px.

## 11. Contenido pendiente de producción

Antes de publicar se deben reemplazar:

- Nombres provisionales del equipo.
- Fotografías del equipo.
- Correos de ejemplo.
- Números de WhatsApp de ejemplo.
- Usuarios de redes sociales de ejemplo.
- Proyectos y convocatorias de demostración.
- Enlaces legales del Footer.
- Logotipos definitivos de aliados y proveedores.
- Configuración real del sistema de autenticación.
- Procesamiento y almacenamiento del registro de limpieza de playas.
- Credenciales, backend y flujo real de Mercado Pago.

También se debe conectar el formulario de contacto a un backend, servicio de correo o plataforma de formularios.

## 12. Recomendaciones técnicas

- Incorporar React Router si aumentará el número de páginas.
- Extraer los íconos SVG y la tarjeta social a componentes compartidos para evitar duplicación.
- Mover proyectos, convocatorias y equipo a archivos de datos, CMS o API.
- Optimizar las imágenes grandes a WebP o AVIF para reducir el peso del build.
- Unificar `assets/objects` y `assets/objets` para evitar confusiones.
- Configurar fallback hacia `index.html` en el hosting.
- Conectar y validar el formulario de contacto.
- Integrar los formularios de Familia y limpieza de playas con un backend.
- Integrar Mercado Pago mediante Checkout Pro y validar notificaciones de pago.
- Implementar autenticación segura para inicio de sesión y registro.
- Añadir pruebas de componentes y navegación.

## 13. Flujo recomendado para agregar una página

1. Crear el componente en `src/pages/NombrePagina.jsx`.
2. Crear su módulo `src/pages/NombrePagina.module.css`.
3. Importar la página en `src/App.jsx`.
4. Detectar su `window.location.pathname`.
5. Añadirla a la cadena condicional de renderizado.
6. Actualizar el enlace correspondiente en `Header.jsx`.
7. Decidir si requiere Footer.
8. Ejecutar `npm run build`.
9. Probar escritorio, tablet y móvil.

## 14. Estado actual

El proyecto compila correctamente con `npm run build`. Se encuentran integrados el sitio principal, los catálogos, la navegación, el equipo directivo, los objetivos, las redes sociales con SVG, el mapa, la página Familia, el carrusel de aliados, la interfaz de autenticación, el registro de limpieza de playas con carrusel y el flujo visual de donativos con acceso a Mercado Pago.
