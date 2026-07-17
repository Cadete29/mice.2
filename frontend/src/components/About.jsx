import { useEffect, useRef } from 'react'
import hongito from '../assets/about/hongito.jpg'
import hojita from '../assets/about/hojita.jpg'
import styles from './About.module.css'

const About = () => {
  const aboutRef = useRef(null)

  useEffect(() => {
    const about = aboutRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!about || prefersReducedMotion) return undefined

    let frame = 0

    const updateParallax = () => {
      frame = 0
      const rect = about.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const progress = Math.min(
        Math.max((viewportHeight - rect.top) / (viewportHeight + rect.height), 0),
        1,
      )
      const offset = (progress - 0.5) * 500

      about.style.setProperty('--about-parallax-card-x', `${offset * -0.22}px`)
      about.style.setProperty('--about-parallax-card-y', `${offset * 0.38}px`)
      about.style.setProperty('--about-parallax-hongito-x', `${offset * 0.52}px`)
      about.style.setProperty('--about-parallax-hongito-y', `${offset * -0.72}px`)
      about.style.setProperty('--about-parallax-hojita-x', `${offset * -0.65}px`)
      about.style.setProperty('--about-parallax-hojita-y', `${offset * 0.82}px`)
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateParallax)
    }

    updateParallax()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="about" className={styles.aboutSection} ref={aboutRef}>
      <article className={styles.aboutGradientCard}>
        <div className={styles.aboutCardContent}>
          <h3>En MICE-LO</h3>
          <h4>Creamos:</h4>
          <ul>
            <li>Soluciones innovadoras inspiradas en la naturaleza para la regeneración de ecosistemas.</li>
            <li>Proyectos ambientales y sociales enfocados en sostenibilidad y restauración ecológica.</li>
            <li>Programas educativos, pláticas y talleres ambientales para escuelas, comunidades y público en general.</li>
            <li>Estrategias y proyectos de responsabilidad ambiental y social para empresas e instituciones.</li>
            <li>Iniciativas de investigación, desarrollo e innovación orientadas a soluciones sostenibles.</li>
          </ul>
          <h4>Trabajamos:</h4>
          <p>
            Integrando ciencia, conocimiento ecológico y colaboración con comunidades,
            organizaciones y empresas para impulsar proyectos que promuevan la regeneración
            de los ecosistemas y el desarrollo sostenible.
          </p>
        </div>
      </article>
      <img src={hongito} className={styles.aboutHongito} alt="" />
      <img src={hojita} className={styles.aboutHojita} alt="" />
      <div className={styles.aboutContainer}>
        <div className={styles.aboutContent}>
          <h2>
            Acerca de
            <span>MICE-LO</span>
          </h2>
          <p>
            MICE-LO es un centro de investigación e innovación que desarrolla soluciones inspiradas
            en la naturaleza para enfrentar desafíos ambientales y sociales.
          </p>
        </div>
      </div>
    </section>
  )
}

export default About
