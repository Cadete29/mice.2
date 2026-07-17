import styles from './ChiapasPorElClima.module.css'
import bosque from '../assets/about/hojita.jpg'
import hongos from '../assets/about/hongito.jpg'
import hoja from '../assets/contacto/hojadorada.jpg'
import sol from '../assets/contacto/solverde.jpg'

const convocatorias = [
  {
    image: bosque,
    title: 'Jóvenes por la restauración',
    description: 'Convocatoria para jóvenes que quieran participar en acciones comunitarias de reforestación.',
    author: 'Colectivo Semilla',
    email: 'semilla@example.com',
    whatsapp: '529611111111',
    social: 'colectivosemilla',
  },
  {
    image: hongos,
    title: 'Laboratorio de suelo vivo',
    description: 'Programa de acompañamiento para proyectos de investigación sobre hongos y regeneración del suelo.',
    author: 'Red Micelio',
    email: 'micelio@example.com',
    whatsapp: '529612222222',
    social: 'redmicelio',
  },
  {
    image: hoja,
    title: 'Fondo para iniciativas verdes',
    description: 'Apoyo para iniciativas ciudadanas enfocadas en biodiversidad, agua y adaptación climática.',
    author: 'Alianza Verde Chiapas',
    email: 'alianzaverde@example.com',
    whatsapp: '529613333333',
    social: 'alianzaverdechiapas',
  },
  {
    image: sol,
    title: 'Reto de innovación climática',
    description: 'Buscamos soluciones creativas y replicables para responder a los retos climáticos de la región.',
    author: 'MICE-LO',
    email: 'contacto@micelo.org',
    whatsapp: '529614444444',
    social: 'micelo',
  },
]

const icons = {
  facebook: 'M13.5 22v-8h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.7-1.6H17V4.3c-.8-.1-1.7-.3-2.6-.3-2.7 0-4.5 1.6-4.5 4.6v2.2H7V14h2.9v8h3.6Z',
  x: 'M18.7 3H22l-7.2 8.2L23.3 21h-6.7l-5.2-6.8L5.5 21H2.2l7.7-8.8L1.7 3h6.8l4.7 6.2L18.7 3Zm-1.2 16h1.8L7.5 4.9h-2L17.5 19Z',
  tiktok: 'M15.7 3c.3 2.4 1.7 3.9 4.3 4.1v3.1a8.5 8.5 0 0 1-4.3-1.3v6.3a5.9 5.9 0 1 1-5.1-5.8v3.2a2.8 2.8 0 1 0 1.9 2.6V3h3.2Z',
  youtube: 'M22.5 7.1a2.8 2.8 0 0 0-2-2C18.7 4.6 12 4.6 12 4.6s-6.7 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-4.9ZM9.8 15.2V8.8l5.6 3.2-5.6 3.2Z',
  linkedin: 'M6.5 8.5H3.3V21h3.2V8.5ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.8c0-3.8-2-5.6-4.7-5.6-2.2 0-3.1 1.2-3.7 2V8.5H9.4V21h3.2v-6.2c0-1.6.3-3.2 2.4-3.2s2.1 1.9 2.1 3.3V21H21v-7.2Z',
  whatsapp: 'M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.4-1.4A10 10 0 1 0 12 2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 19.8Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.7.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.4-.3-.9-.5Z',
}

const Icon = ({ name }) => name === 'instagram' ? (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1.2" /></svg>
) : <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icons[name]} /></svg>

const Convocatorias = () => (
  <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="convocatorias-title">
      <div className={styles.content}>
        <p className={styles.eyebrow}>Participa · Conecta · Transforma</p>
        <h1 id="convocatorias-title">Convocatorias</h1>
        <p className={styles.intro}>Descubre oportunidades para impulsar ideas, sumar capacidades y transformar el futuro ambiental de Chiapas.</p>
      </div>
    </section>
    <section className={styles.catalog} aria-labelledby="catalogo-convocatorias">
      <div className={styles.catalogContainer}>
        <div className={styles.catalogHeading}>
          <p className={styles.eyebrow}>Oportunidades abiertas</p>
          <h2 id="catalogo-convocatorias">Convocatorias</h2>
          <p>Encuentra una iniciativa, contacta a sus organizadores y forma parte del cambio.</p>
        </div>
        <div className={styles.grid}>
          {convocatorias.map((item) => (
            <article className={styles.card} key={item.title}>
              <img className={styles.thumbnail} src={item.image} alt="" />
              <div className={styles.cardContent}>
                <h3>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
                <p className={styles.author}><span>Convoca:</span> {item.author}</p>
                <p className={styles.joinProject}>Únete a la convocatoria:</p>
                <div className={styles.contactLinks}>
                  <a href={`mailto:${item.email}`}>Correo</a>
                  <a href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noreferrer" aria-label={`Contactar a ${item.author} por WhatsApp`}><Icon name="whatsapp" /></a>
                </div>
                <div className={styles.socialLinks} aria-label={`Redes sociales de ${item.author}`}>
                  <a href={`https://instagram.com/${item.social}`} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" /></a>
                  <a href={`https://facebook.com/${item.social}`} target="_blank" rel="noreferrer" aria-label="Facebook"><Icon name="facebook" /></a>
                  <a href={`https://x.com/${item.social}`} target="_blank" rel="noreferrer" aria-label="X"><Icon name="x" /></a>
                  <a href={`https://tiktok.com/@${item.social}`} target="_blank" rel="noreferrer" aria-label="TikTok"><Icon name="tiktok" /></a>
                  <a href={`https://youtube.com/@${item.social}`} target="_blank" rel="noreferrer" aria-label="YouTube"><Icon name="youtube" /></a>
                  <a href={`https://linkedin.com/in/${item.social}`} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Icon name="linkedin" /></a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  </main>
)

export default Convocatorias
