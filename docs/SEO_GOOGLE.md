# SEO de MICE-LO y alta en Google

## Implementado

- Dominio preferido: `https://micelo.org`.
- Títulos y descripciones propios para las 13 páginas públicas estables.
- Canonical sin parámetros de consulta, Open Graph y tarjetas sociales.
- Datos estructurados `Organization` en la portada, con el nombre y logo existentes.
- HTML con metadatos por ruta y sitemap generados por `npm run build`.
- `noindex, follow` para administración, dashboard, registro de cuenta y rutas desconocidas.

Los metadatos no prerenderizan el contenido: Google todavía debe ejecutar React para ver el cuerpo de las páginas. Los detalles de proyectos, convocatorias y perfiles mantienen metadatos genéricos en cliente y no se incluyen en el sitemap estático.

## Despliegue requerido

Configuración completa adaptada al servidor proporcionado: [nginx-micelo.example.conf](nginx-micelo.example.conf). Sustituir los bloques existentes del sitio, sin duplicarlos. Publicar primero el nuevo `dist`, comprobar que el certificado cubra también `www.micelo.org` y ejecutar `sudo nginx -t && sudo systemctl reload nginx`. La configuración no se ha aplicado ni validado con Nginx en el servidor desde este entorno.

1. Ejecutar `npm run build` en `frontend` y publicar todo `frontend/dist`.
2. Configurar el servidor para servir los HTML por ruta sin cambiar la URL del navegador. En Nginx, integrar las siguientes ubicaciones en el servidor HTTPS existente de `micelo.org`, conservando el proxy de `/api/`, los certificados y el resto de su configuración:

```nginx
location = / {
    try_files /index.html =404;
}

location / {
    try_files $uri $uri.html $uri/ /spa.html;
}
```

`/nosotros` debe devolver `nosotros.html`; las rutas dinámicas deben devolver `spa.html`. No mantener `/index.html` como fallback global: contiene la canonical de la portada. No enlazar los archivos `.html` directamente, pues las rutas de React usan URLs sin extensión. Normalizar en el servidor las variantes con extensión o barra final a la ruta pública correspondiente mediante redirecciones.

3. Redirigir HTTP y `www.micelo.org` hacia `https://micelo.org` con una redirección permanente, conservando ruta y parámetros. El certificado debe cubrir los hosts HTTPS que se redirijan.
4. Comprobar el código fuente de `/`, `/nosotros` y `/convocatorias`: cada respuesta debe incluir su título y una única canonical propia, antes de ejecutar JavaScript.
5. Comprobar `/sitemap.xml` y `/robots.txt` públicamente.

`robots.txt` conserva los bloqueos existentes de las rutas privadas. Google no puede leer `noindex` en una URL bloqueada. Si se necesita retirar una de esas URLs del índice, permitir su rastreo para que Google lea `noindex`; mantener siempre la autenticación y los permisos del backend como protección de los datos.

## Google Search Console

1. Abrir https://search.google.com/search-console con la cuenta que administrará el sitio.
2. Añadir una propiedad de tipo **Dominio**: `micelo.org`.
3. Copiar el registro TXT que Google proporciona y añadirlo al DNS del dominio. El valor debe ser el real de esa cuenta; no se genera en este repositorio.
4. Volver a Search Console y seleccionar **Verificar**. Mantener el TXT después de verificar.
5. En **Sitemaps**, enviar `https://micelo.org/sitemap.xml`.
6. En **Inspección de URLs**, probar la URL publicada de la portada y solicitar su indexación. Revisar también algunas páginas interiores.
7. Revisar posteriormente los informes de indexación y rendimiento para identificar errores, consultas y clics.

Si se elige una propiedad de prefijo de URL y verificación por archivo HTML, colocar el archivo exacto proporcionado por Google en `frontend/public/` y volver a compilar y desplegar.

La publicación, verificación DNS y envío a Search Console no se han realizado con estos cambios. La indexación y el posicionamiento dependen de Google y no son inmediatos ni están garantizados.

## Referencias oficiales

- [Guía SEO de Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=es)
- [SEO para JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=es)
- [Verificación de propiedad](https://support.google.com/webmasters/answer/9008080?hl=es)
- [Crear y enviar sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=es)
