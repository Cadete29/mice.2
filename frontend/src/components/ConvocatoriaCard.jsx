import baseStyles from "./ConvocatoriaCard.module.css";
import extraStyles from "./ConvocatoriaEnhancements.module.css";
import { plainDescription } from "../utils/descriptionFormat";
import { requireAuthentication } from "../utils/requireAuthentication";
const styles = {
  ...baseStyles,
  ...extraStyles,
};
const iconPaths = {
  facebook:
    "M13.5 22v-8h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.7-1.6H17V4.3c-.8-.1-1.7-.3-2.6-.3-2.7 0-4.5 1.6-4.5 4.6v2.2H7V14h2.9v8h3.6Z",
  x: "M18.7 3H22l-7.2 8.2L23.3 21h-6.7l-5.2-6.8L5.5 21H2.2l7.7-8.8L1.7 3h6.8l4.7 6.2L18.7 3Zm-1.2 16h1.8L7.5 4.9h-2L17.5 19Z",
  tiktok:
    "M15.7 3c.3 2.4 1.7 3.9 4.3 4.1v3.1a8.5 8.5 0 0 1-4.3-1.3v6.3a5.9 5.9 0 1 1-5.1-5.8v3.2a2.8 2.8 0 1 0 1.9 2.6V3h3.2Z",
  youtube:
    "M22.5 7.1a2.8 2.8 0 0 0-2-2C18.7 4.6 12 4.6 12 4.6s-6.7 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-4.9ZM9.8 15.2V8.8l5.6 3.2-5.6 3.2Z",
  linkedin:
    "M6.5 8.5H3.3V21h3.2V8.5ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.8c0-3.8-2-5.6-4.7-5.6-2.2 0-3.1 1.2-3.7 2V8.5H9.4V21h3.2v-6.2c0-1.6.3-3.2 2.4-3.2s2.1 1.9 2.1 3.3V21H21v-7.2Z",
  whatsapp:
    "M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.4-1.4A10 10 0 1 0 12 2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 19.8Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.7.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.4-.3-.9-.5Z",
};
const Icon = ({ name }) =>
  name === "instagram" ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="17.5" cy="6.5" r="1.2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  );
const socialNetworks = [
  ["instagram", (user) => `https://instagram.com/${user}`],
  ["facebook", (user) => `https://facebook.com/${user}`],
  ["x", (user) => `https://x.com/${user}`],
  ["tiktok", (user) => `https://tiktok.com/@${user}`],
  ["youtube", (user) => `https://youtube.com/@${user}`],
  ["linkedin", (user) => `https://linkedin.com/in/${user}`],
];
const socialUrl = (builder, value) =>
  /^https?:\/\//i.test(value) ? value : builder(value.replace(/^@/, ""));
export default function ConvocatoriaCard({
  convocatoria,
  onApply,
  applying,
  applied,
}) {
  const showContact = false;
  return (
    <article className={styles.card}>
      <img
        loading="lazy"
        decoding="async"
        className={styles.thumbnail}
        src={convocatoria.image}
        alt=""
      />
      <div className={styles.content}>
        <h3>{convocatoria.title}</h3>
        <p className={styles.description}>
          {plainDescription(convocatoria.description)}
        </p>
        <a
          className={styles.readMore}
          href={`/convocatorias/${convocatoria.id}`}
        >
          Ver más
        </a>
        <p className={styles.organizer}>
          <span>Convoca:</span> {convocatoria.author}
        </p>
        {showContact && (
          <>
            <p className={styles.callToAction}>Contacto:</p>
            <div className={styles.contactLinks}>
              {convocatoria.email && (
                <a href={`mailto:${convocatoria.email}`}>Correo</a>
              )}
              {convocatoria.whatsapp && (
                <a
                  href={`https://wa.me/${convocatoria.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Contactar a ${convocatoria.author} por WhatsApp`}
                >
                  <Icon name="whatsapp" />
                </a>
              )}
            </div>
            <div
              className={styles.socialLinks}
              aria-label={`Redes sociales de ${convocatoria.author}`}
            >
              {socialNetworks.map(
                ([name, getUrl]) =>
                  convocatoria.social?.[name] && (
                    <a
                      key={name}
                      href={socialUrl(getUrl, convocatoria.social[name])}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={name}
                    >
                      <Icon name={name} />
                    </a>
                  ),
              )}
            </div>
          </>
        )}
        {convocatoria.type === "externa" && convocatoria.externalUrl ? (
          <a
            className={styles.apply}
            href={convocatoria.externalUrl}
            target="_blank"
            rel="noreferrer"
            onClick={requireAuthentication}
          >
            Ir a la convocatoria externa
          </a>
        ) : (
          onApply && (
            <button
              className={styles.apply}
              type="button"
              disabled={applying || applied}
              onClick={() => onApply(convocatoria)}
            >
              {applied
                ? "Postulación enviada"
                : applying
                  ? "Enviando…"
                  : "Postularme"}
            </button>
          )
        )}
      </div>
    </article>
  );
}
