import { useEffect, useState } from "react";
import { sendFamilyContactMessage } from "../services/authApi";
import mexico from "../assets/family/mexicoam.webp";
import ambi from "../assets/family/ambi.webp";
import aliado1 from "../assets/about/hojita.webp";
import aliado2 from "../assets/about/hongito.webp";
import aliado3 from "../assets/contacto/hojadorada.webp";
import aliado4 from "../assets/contacto/solverde.webp";
import styles from "./Familia.module.css";
const aliados = [aliado1, aliado2, aliado3, aliado4];
const Familia = () => {
  const [activeAlly, setActiveAlly] = useState(0);
  const [sending, setSending] = useState(false);
  const [formStatus, setFormStatus] = useState({
    type: "",
    message: "",
  });
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveAlly((current) => (current + 1) % aliados.length);
    }, 2000);
    return () => window.clearInterval(interval);
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setFormStatus({
      type: "",
      message: "",
    });
    try {
      const response = await sendFamilyContactMessage(
        Object.fromEntries(new FormData(form).entries()),
      );
      form.reset();
      setFormStatus({
        type: "success",
        message: response.message,
      });
    } catch (error) {
      setFormStatus({
        type: "error",
        message:
          error.message ||
          "No fue posible enviar tus datos. Inténtalo nuevamente.",
      });
    } finally {
      setSending(false);
    }
  };
  return (
    <main className={styles.page}>
      <img
        decoding="async"
        className={styles.mexicoImage}
        src={mexico}
        alt="Mapa de la red ambiental de México"
      />

      <article className={styles.joinCard}>
        <h2>
          Únete a la revolución ambiental y ayúdanos a restaurar la naturaleza
        </h2>
        <p>
          Tu voz, tus ideas y tus acciones pueden formar parte de una comunidad
          que trabaja todos los días por un Chiapas más verde y sostenible.
          Comparte tus datos de contacto y déjanos un mensaje si deseas unirte a
          la familia MICE-LO.
        </p>

        <form className={styles.messageForm} onSubmit={handleSubmit}>
          <label className={styles.compactLabel} htmlFor="familia-nombre">
            Nombre
          </label>
          <input
            id="familia-nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            minLength="2"
            maxLength="100"
            required
          />
          <label className={styles.compactLabel} htmlFor="familia-correo">
            Correo electrónico
          </label>
          <input
            id="familia-correo"
            name="correo"
            type="email"
            autoComplete="email"
            maxLength="254"
            required
          />
          <label htmlFor="familia-mensaje">Mándanos un mensaje</label>
          <textarea
            id="familia-mensaje"
            name="mensaje"
            rows="4"
            placeholder="Escribe tu mensaje aquí..."
            minLength="10"
            maxLength="5000"
            required
          />
          <button type="submit" disabled={sending}>
            {sending ? "Enviando…" : "Enviar"}
          </button>
          <p
            className={`${styles.formStatus} ${formStatus.type ? styles[formStatus.type] : ""}`}
            role="status"
            aria-live="polite"
          >
            {formStatus.message}
          </p>
        </form>
      </article>

      <section className={styles.content} aria-labelledby="familia-title">
        <p className={styles.eyebrow}>Una red que crece</p>
        <h1 id="familia-title">
          <strong>Quieres ser parte</strong>
          <span>de nuestra red de aliados?</span>
        </h1>
        <p className={styles.description}>
          Conectamos personas, comunidades y organizaciones que comparten el
          compromiso de cuidar la naturaleza y construir un futuro sostenible.
        </p>

        <div className={styles.allies} aria-live="polite">
          <div className={styles.allyFrame}>
            <img
              decoding="async"
              key={activeAlly}
              src={aliados[activeAlly]}
              alt={`Aliado o proveedor ${activeAlly + 1}`}
            />
          </div>
          {/* Indicadores de imagen ocultos temporalmente.
         <div className={styles.allyDots} aria-hidden="true">
          {aliados.map((image, index) => (
            <span className={index === activeAlly ? styles.activeDot : ''} key={image} />
          ))}
         </div>
         */}
        </div>
      </section>

      <img
        decoding="async"
        className={styles.ambiImage}
        src={ambi}
        alt="Símbolo de comunidad ambiental"
      />
    </main>
  );
};
export default Familia;
