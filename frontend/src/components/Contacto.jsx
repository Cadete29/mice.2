import { useEffect, useRef, useState } from 'react'
import { sendContactMessage } from '../services/authApi'
import styles from './Contacto.module.css'
import hongis from '../assets/objects/hongis.jpg'
import hojagrande from '../assets/contacto/hojagrande.jpg'
import solverde from '../assets/contacto/solverde.jpg'
import polen from '../assets/contacto/polen.jpg'
import hojadorada from '../assets/contacto/hojadorada.jpg'
import hojadorada2 from '../assets/contacto/hojadorada2.jpg'

const Contacto = () => {
  const sectionRef = useRef(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!section || reduceMotion) return undefined

    let animationFrame

    const updateParallax = () => {
      const rect = section.getBoundingClientRect()
      const visibleProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      const progress = Math.max(0, Math.min(1, visibleProgress))
      const offset = (progress - 0.5) * 500

      section.style.setProperty('--contacto-parallax-hoja', `${offset * 0.55}px`)
      section.style.setProperty('--contacto-parallax-sol', `${offset * -0.48}px`)
      section.style.setProperty('--contacto-parallax-polen', `${offset * 0.7}px`)
      section.style.setProperty('--contacto-parallax-dorada', `${offset * 0.62}px`)
      section.style.setProperty('--contacto-parallax-dorada2', `${offset * -0.58}px`)
      section.style.setProperty('--contacto-parallax-hongis', `${offset * -0.42}px`)
      animationFrame = undefined
    }

    const handleScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateParallax)
    }

    updateParallax()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setSending(true)
    setStatus({ type: '', message: '' })
    try {
      const data = Object.fromEntries(new FormData(form).entries())
      const response = await sendContactMessage(data)
      form.reset()
      setStatus({ type: 'success', message: response.message })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'No fue posible enviar tu mensaje. Inténtalo nuevamente.',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <section ref={sectionRef} id="contacto" className={styles.contactoSection}>
      <img
        className={styles.contactoHojaGrande}
        src={hojagrande}
        alt=""
        aria-hidden="true"
      />

      <img
        className={styles.contactoSolVerde}
        src={solverde}
        alt=""
        aria-hidden="true"
      />

      <div className={styles.contactoContainer}>
        <div className={styles.contactoHeading}>
          <h2>Contacto</h2>
        </div>

        <div className={styles.contactoCard}>
          <img
            className={styles.contactoPolen}
            src={polen}
            alt=""
            aria-hidden="true"
          />
          <img
            className={styles.contactoHojaDorada}
            src={hojadorada}
            alt=""
            aria-hidden="true"
          />
          <img
            className={styles.contactoHojaDorada2}
            src={hojadorada2}
            alt=""
            aria-hidden="true"
          />

          <form className={styles.contactoForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="contacto-nombre">Nombre</label>
              <input
                id="contacto-nombre"
                name="nombre"
                type="text"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contacto-correo">Correo electrónico</label>
              <input
                id="contacto-correo"
                name="correo"
                type="email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contacto-asunto">Asunto</label>
              <input
                id="contacto-asunto"
                name="asunto"
                type="text"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contacto-mensaje">Mensaje</label>
              <textarea
                id="contacto-mensaje"
                name="mensaje"
                rows="5"
                required
                minLength="10"
                maxLength="5000"
              />
            </div>

            <button className={styles.submitButton} type="submit" disabled={sending}>
              {sending ? 'Enviando…' : 'Enviar mensaje'}
            </button>
            <p
              className={`${styles.formStatus} ${status.type ? styles[status.type] : ''}`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>
          </form>

          <img
            className={styles.contactoHongis}
            src={hongis}
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}

export default Contacto
