import { useEffect, useState } from 'react'
import styles from './RegistroPlayas.module.css'
import playaLimpia from '../assets/limpieza de playas/playalim.jpeg'
import playaLimpia2 from '../assets/limpieza de playas/playalim2.jpeg'
import playaLimpia3 from '../assets/limpieza de playas/playalim3.jpeg'
import playaLimpia4 from '../assets/limpieza de playas/playalim4.jpeg'

const beachImages = [playaLimpia, playaLimpia2, playaLimpia3, playaLimpia4]

const RegistroPlayas = () => {
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % beachImages.length)
    }, 2000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="playas-title">
      <div>
        <p>Acción comunitaria</p>
        <h1 id="playas-title">Registro de Limpieza de Playas</h1>
        <span>
          Súmate a una jornada de limpieza y ayúdanos a recuperar las playas de Chiapas.
          Registra tus datos para coordinar tu participación.
        </span>
      </div>
    </section>

    <section className={styles.formSection} aria-labelledby="registro-title">
      <div className={styles.imagePanel} aria-live="polite">
        <img
          key={activeImage}
          src={beachImages[activeImage]}
          alt={`Jornada de limpieza de playa ${activeImage + 1}`}
        />
      </div>

      <div className={styles.registrationContent}>
        <div className={styles.formIntro}>
        <p>Participa con nosotros</p>
        <h2 id="registro-title">Datos de registro</h2>
        <span>
          Completa el formulario. El equipo organizador se pondrá en contacto contigo para
          compartir el punto de encuentro, horario y recomendaciones de la jornada.
        </span>
        <ul>
          <li>Lleva ropa cómoda y protección solar.</li>
          <li>Usa calzado cerrado y lleva agua reutilizable.</li>
          <li>Menores de edad deben asistir con una persona adulta.</li>
        </ul>
        </div>

        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
        <div className={styles.fieldRow}>
          <label>
            Nombre
            <input name="nombre" type="text" autoComplete="given-name" required />
          </label>
          <label>
            Apellidos
            <input name="apellidos" type="text" autoComplete="family-name" required />
          </label>
        </div>

        <div className={styles.fieldRow}>
          <label>
            Correo electrónico
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            WhatsApp
            <input name="telefono" type="tel" autoComplete="tel" required />
          </label>
        </div>

        <div className={styles.fieldRow}>
          <label>
            Municipio
            <input name="municipio" type="text" required />
          </label>
          <label>
            Edad
            <input name="edad" type="number" min="12" max="99" required />
          </label>
        </div>

        <label>
          Playa o jornada en la que deseas participar
          <select name="jornada" defaultValue="" required>
            <option value="" disabled>Selecciona una opción</option>
            <option value="puerto-arista">Puerto Arista</option>
            <option value="boca-del-cielo">Boca del Cielo</option>
            <option value="barra-san-simon">Barra San Simón</option>
            <option value="otra">Otra comunidad costera</option>
          </select>
        </label>

        <label>
          ¿Participas con alguna organización o colectivo? <small>(opcional)</small>
          <input name="organizacion" type="text" />
        </label>

        <label>
          Comentarios o necesidades especiales <small>(opcional)</small>
          <textarea name="comentarios" rows="4" />
        </label>

        <label className={styles.checkField}>
          <input name="privacidad" type="checkbox" required />
          <span>Acepto el aviso de privacidad y el uso de mis datos para coordinar la actividad.</span>
        </label>

        <button type="submit">Enviar registro</button>
        </form>
      </div>
    </section>
    </main>
  )
}

export default RegistroPlayas
