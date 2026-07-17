import styles from './ChiapasPorElClima.module.css'
import bosque from '../assets/objects/arbusto.jpg'
import hongos from '../assets/objects/hongis.jpg'
import hojas from '../assets/objects/hoja1.jpg'
import polen from '../assets/contacto/polen.jpg'

const projects = [
  {
    image: bosque,
    title: 'Restauración de bosques comunitarios',
    description:
      'Recuperación de áreas degradadas mediante especies nativas y participación de las comunidades locales.',
    author: 'María López',
    email: 'maria@example.com',
    whatsapp: '529611234567',
    social: 'marialopez',
  },
  {
    image: hongos,
    title: 'Red de micelio y suelo vivo',
    description:
      'Investigación y talleres para mejorar la salud del suelo utilizando hongos benéficos de la región.',
    author: 'Carlos Gómez',
    email: 'carlos@example.com',
    whatsapp: '529612345678',
    social: 'carlosgomez',
  },
  {
    image: hojas,
    title: 'Viveros de plantas nativas',
    description:
      'Producción comunitaria de árboles y plantas locales para restaurar corredores de biodiversidad.',
    author: 'Ana Hernández',
    email: 'ana@example.com',
    whatsapp: '529613456789',
    social: 'anahernandez',
  },
  {
    image: polen,
    title: 'Guardianes de polinizadores',
    description:
      'Creación de jardines y rutas educativas para proteger abejas, mariposas y otros polinizadores.',
    author: 'Luis Pérez',
    email: 'luis@example.com',
    whatsapp: '529614567890',
    social: 'luisperez',
  },
]

const SocialIcon = ({ name }) => {
  const paths = {
    facebook: 'M13.5 22v-8h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.7-1.6H17V4.3c-.8-.1-1.7-.3-2.6-.3-2.7 0-4.5 1.6-4.5 4.6v2.2H7V14h2.9v8h3.6Z',
    x: 'M18.7 3H22l-7.2 8.2L23.3 21h-6.7l-5.2-6.8L5.5 21H2.2l7.7-8.8L1.7 3h6.8l4.7 6.2L18.7 3Zm-1.2 16h1.8L7.5 4.9h-2L17.5 19Z',
    tiktok: 'M15.7 3c.3 2.4 1.7 3.9 4.3 4.1v3.1a8.5 8.5 0 0 1-4.3-1.3v6.3a5.9 5.9 0 1 1-5.1-5.8v3.2a2.8 2.8 0 1 0 1.9 2.6V3h3.2Z',
    youtube: 'M22.5 7.1a2.8 2.8 0 0 0-2-2C18.7 4.6 12 4.6 12 4.6s-6.7 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-4.9ZM9.8 15.2V8.8l5.6 3.2-5.6 3.2Z',
    linkedin: 'M6.5 8.5H3.3V21h3.2V8.5ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.8c0-3.8-2-5.6-4.7-5.6-2.2 0-3.1 1.2-3.7 2V8.5H9.4V21h3.2v-6.2c0-1.6.3-3.2 2.4-3.2s2.1 1.9 2.1 3.3V21H21v-7.2Z',
    whatsapp: 'M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.4-1.4A10 10 0 1 0 12 2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 19.8Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.7.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.4-.3-.9-.5Z',
  }

  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.2" />
      </svg>
    )
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>
}

const ChiapasPorElClima = () => (
  <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="chiapas-clima-title">
      <div className={styles.content}>
        <p className={styles.eyebrow}>Acción local · Impacto global</p>
        <h1 id="chiapas-clima-title">Chiapas por el Clima</h1>
        <p className={styles.intro}>
          Un espacio para conocer, conectar e impulsar iniciativas que protegen la
          biodiversidad y fortalecen la resiliencia climática de Chiapas.
        </p>
      </div>
    </section>

    <section className={styles.catalog} aria-labelledby="catalog-title">
      <div className={styles.catalogContainer}>
        <div className={styles.catalogHeading}>
          <p className={styles.eyebrow}>Iniciativas de la comunidad</p>
          <h2 id="catalog-title">Proyectos</h2>
          <p>Conoce a las personas que están creando soluciones para el clima en Chiapas.</p>
        </div>

        <div className={styles.grid}>
          {projects.map((project) => (
            <article className={styles.card} key={project.title}>
              <img className={styles.thumbnail} src={project.image} alt="" />
              <div className={styles.cardContent}>
                <h3>{project.title}</h3>
                <p className={styles.description}>{project.description}</p>
                <p className={styles.author}>
                  <span>Creado por:</span> {project.author}
                </p>
                <p className={styles.joinProject}>Únete a mi proyecto:</p>
                <div className={styles.contactLinks}>
                  <a href={`mailto:${project.email}`}>Correo</a>
                  <a
                    href={`https://wa.me/${project.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Contactar a ${project.author} por WhatsApp`}
                  >
                    <SocialIcon name="whatsapp" />
                  </a>
                </div>
                <div className={styles.socialLinks} aria-label={`Redes sociales de ${project.author}`}>
                  <a href={`https://instagram.com/${project.social}`} target="_blank" rel="noreferrer" aria-label="Instagram"><SocialIcon name="instagram" /></a>
                  <a href={`https://facebook.com/${project.social}`} target="_blank" rel="noreferrer" aria-label="Facebook"><SocialIcon name="facebook" /></a>
                  <a href={`https://x.com/${project.social}`} target="_blank" rel="noreferrer" aria-label="X"><SocialIcon name="x" /></a>
                  <a href={`https://tiktok.com/@${project.social}`} target="_blank" rel="noreferrer" aria-label="TikTok"><SocialIcon name="tiktok" /></a>
                  <a href={`https://youtube.com/@${project.social}`} target="_blank" rel="noreferrer" aria-label="YouTube"><SocialIcon name="youtube" /></a>
                  <a href={`https://linkedin.com/in/${project.social}`} target="_blank" rel="noreferrer" aria-label="LinkedIn"><SocialIcon name="linkedin" /></a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  </main>
)

export default ChiapasPorElClima
