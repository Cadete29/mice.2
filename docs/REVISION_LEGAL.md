# Revisión jurídica y protección de datos previa a producción

**Estado al 22 de agosto de 2026:** los textos públicos son borradores técnicos. La aplicación ya registra aceptación y evidencia, pero esto no sustituye el dictamen de una persona profesional.

## Documentos publicados pendientes de aprobación

| Documento | Ruta | Versión técnica actual |
|---|---|---|
| Términos de uso | `/terminos-de-uso` | `2026-08-08` |
| Aviso de privacidad | `/aviso-de-privacidad` | `2026-07-17` |
| Aviso de uso de imagen | `/aviso-uso-de-imagen` | `2026-07-17` |
| Deslinde de responsabilidad | `/deslinde-de-responsabilidad` | `2026-07-17` |

Los textos se encuentran actualmente en `frontend/src/pages/LegalPage.jsx`.

## Tratamientos implementados que deben revisarse

### Cuentas y perfiles

- Nombre, apellidos, correo, hash de contraseña, IP, fechas de acceso y dispositivo.
- Fotografía, descripción, misión, visión, objetivos y redes opcionales.
- Sesiones, factores MFA y registros de seguridad.

### Proyectos y convocatorias

- Contenido, imágenes y autoría de proyectos.
- Datos de contacto que el usuario decide hacer visibles.
- Postulaciones internas y copia de contactos autorizados al postularse.

### Jornadas de playa

- Nombre completo, fecha de nacimiento, CURP, país/lada/teléfono, correo y transporte.
- IP y dispositivo.
- Consentimiento de privacidad, uso de imagen y deslinde.

CURP, nacimiento, teléfono e IP requieren especial atención en minimización, justificación, acceso, conservación y eliminación. El panel nominal está restringido a administradores, pero aún debe definirse una política operativa y auditable.

### Contacto y correo

- Datos enviados en los formularios Contacto y Familia.
- Correos transaccionales a usuarios y avisos al equipo administrador.
- Proveedores SMTP que pueden actuar como encargados del tratamiento.

## Evidencia técnica existente

La base `consentimientos_legales` conserva versión de términos/privacidad, hashes documentales, hash del correo, IP, dispositivo, fecha y firma/evidencia HMAC. El registro de playa guarda sus tres aceptaciones y versión de privacidad.

El backend exige `CONSENT_HASH_KEY`; en producción también exige `TERMS_DOCUMENT_SHA256` y `PRIVACY_DOCUMENT_SHA256`. Una modificación sustantiva necesita nueva versión y flujo de reconsentimiento antes de reemplazar el documento publicado.

## Decisiones que debe confirmar la organización

- Denominación o razón social y régimen jurídico.
- Domicilio y medios oficiales del responsable.
- Base jurídica y finalidades primarias/secundarias por formulario.
- Necesidad y proporcionalidad de solicitar CURP e IP.
- Tratamiento de menores y mecanismo válido de autorización de tutor.
- Encargados, transferencias nacionales/internacionales y contratos aplicables.
- Plazos de conservación por tipo de dato y método de eliminación.
- Procedimiento y plazo para derechos ARCO, revocación y limitación.
- Gestión de incidentes, contacto de privacidad y notificación.
- Alcance/revocación de autorización para fotografía, video y voz.
- Reglas de actividades presenciales, transporte, emergencias y seguros.
- Propiedad intelectual de proyectos, perfiles, imágenes y convocatorias.
- Jurisdicción y legislación aplicable.
- Requisitos fiscales y contractuales antes de recibir donativos.

## Controles pendientes antes de producción

1. Dictamen profesional de los cuatro documentos.
2. Reemplazar textos técnicos con las versiones aprobadas.
3. Calcular SHA-256 exactos y configurar las variables de producción.
4. Definir retención y eliminación de cuentas, sesiones, postulaciones y participantes.
5. Implementar el flujo de reconsentimiento por cambio de versión.
6. Documentar y probar solicitudes ARCO y eliminación de cuenta.
7. Restringir exportación/impresión de datos de playa y registrar accesos si el análisis de riesgo lo exige.
8. Formalizar encargados de hosting, base de datos y correo.
9. Elaborar protocolo de incidentes y copias de seguridad.
10. Evaluar el tratamiento de menores antes de aceptar registros por fecha de nacimiento.

## Registro de aprobación

| Campo | Valor |
|---|---|
| Profesional responsable | Pendiente |
| Cédula/colegio/acreditación | Pendiente |
| Fecha del dictamen | Pendiente |
| Versión aprobada de términos | Pendiente |
| SHA-256 de términos | Pendiente |
| Versión aprobada de privacidad | Pendiente |
| SHA-256 de privacidad | Pendiente |
| Aviso de imagen aprobado | Pendiente |
| Deslinde aprobado | Pendiente |
| Política de retención | Pendiente |
| Procedimiento ARCO | Pendiente |
| Jurisdicción y observaciones | Pendiente |

## Activación

Después del dictamen:

1. Publicar textos aprobados y actualizar las versiones del frontend/backend.
2. Calcular los hashes sobre el contenido canónico acordado.
3. Configurar secretos y hashes mediante el gestor seguro del entorno, nunca en Git.
4. Ejecutar migraciones y pruebas completas.
5. Verificar que las evidencias nuevas registren versiones/hashes correctos.
6. Conservar el dictamen y una copia inmutable de cada versión aprobada.

Este archivo es una lista de control técnica y no constituye asesoría jurídica.
