import { useEffect, useState } from 'react'
import mexico from '../assets/family/mexicoam.jpg'
import ambi from '../assets/family/ambi.jpg'
import aliado1 from '../assets/about/hojita.jpg'
import aliado2 from '../assets/about/hongito.jpg'
import aliado3 from '../assets/contacto/hojadorada.jpg'
import aliado4 from '../assets/contacto/solverde.jpg'
import styles from './Familia.module.css'

const aliados = [aliado1, aliado2, aliado3, aliado4]

const Familia = () => {
  const [activeAlly, setActiveAlly] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveAlly((current) => (current + 1) % aliados.length)
    }, 2000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <main className={styles.page}>
    <img
      className={styles.mexicoImage}
      src={mexico}
      alt="Mapa de la red ambiental de México"
    />

    <article className={styles.joinCard}>
      <h2>Únete a la revolución ambiental y ayúdanos a restaurar la naturaleza</h2>
      <p>
        Tu voz, tus ideas y tus acciones pueden formar parte de una comunidad que trabaja
        todos los días por un Chiapas más verde y sostenible.
      </p>

      <form className={styles.messageForm} onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="familia-mensaje">Mándanos un mensaje</label>
        <textarea
          id="familia-mensaje"
          name="mensaje"
          rows="4"
          placeholder="Escribe tu mensaje aquí..."
        />
        <button type="submit">Enviar</button>
      </form>
    </article>

    <section className={styles.content} aria-labelledby="familia-title">
      <p className={styles.eyebrow}>Una red que crece</p>
      <h1 id="familia-title">
        <strong>Quieres ser parte</strong>
        <span>de nuestra red de aliados?</span>
      </h1>
      <p className={styles.description}>
        Conectamos personas, comunidades y organizaciones que comparten el compromiso de
        cuidar la naturaleza y construir un futuro sostenible.
      </p>

      <div className={styles.allies} aria-live="polite">
        <div className={styles.allyFrame}>
          <img
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

    <img className={styles.ambiImage} src={ambi} alt="Símbolo de comunidad ambiental" />
    </main>
  )
}

export default Familia
