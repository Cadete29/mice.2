import logo from '../assets/logo2.png'
import styles from './Footer.module.css'

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.brand}>
        <a className={styles.logo} href="#hero" aria-label="Ir al inicio">
          <img src={logo} alt="MICE-LO" />
        </a>
        <p>
          Ciencia, naturaleza e innovación para regenerar ecosistemas y construir un futuro
          sostenible.
        </p>
      </div>

      <nav className={styles.column} aria-label="Navegación del pie de página">
        <h2>Explora</h2>
        <a href="#hero">Inicio</a>
        <a href="#about">Acerca de</a>
        <a href="#features">Proyectos</a>
        <a href="#contacto">Contacto</a>
      </nav>

      <div className={styles.column}>
        <h2>Contacto</h2>
        <a href="mailto:contacto@micelo.org">contacto@micelo.org</a>
        <span>Chiapas, México</span>
        <span>Lunes a viernes · 9:00–17:00</span>
      </div>

      <div className={styles.column}>
        <h2>Síguenos</h2>
        <div className={styles.socials} aria-label="Redes sociales">
          <a className={styles.social} href="https://www.instagram.com/micelo_ac?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" title="Instagram" aria-label="Visitar Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle className={styles.socialDot} cx="17.5" cy="6.5" r="1" />
            </svg>
          </a>
          <a className={styles.social} href="https://www.facebook.com/profile.php?id=61576672250042&locale=es_LA" target="_blank" rel="noreferrer" title="Facebook" aria-label="Visitar Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 21v-8h3l.5-3H14V8.2c0-.9.3-1.7 1.8-1.7H18V3.8c-.4-.1-1.7-.2-2.7-.2-2.7 0-4.5 1.6-4.5 4.7V10H8v3h2.8v8H14Z" />
            </svg>
          </a>
          <a className={styles.social} href="https://www.linkedin.com/" target="_blank" rel="noreferrer" title="LinkedIn" aria-label="Visitar LinkedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.5 8.5H3.3V21h3.2V8.5ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.8c0-3.8-2-5.6-4.7-5.6-2.2 0-3.1 1.2-3.7 2V8.5H9.4V21h3.2v-6.2c0-1.6.3-3.2 2.4-3.2s2.1 1.9 2.1 3.3V21H21v-7.2Z" />
            </svg>
          </a>
          <a className={styles.social} href="https://www.tiktok.com/@mice.lo.a.c?is_from_webapp=1&sender_device=pc" target="_blank" rel="noreferrer" title="TikTok" aria-label="Visitar TikTok">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.7 3c.3 2.4 1.7 3.9 4.3 4.1v3.1a8.5 8.5 0 0 1-4.3-1.3v6.3a5.9 5.9 0 1 1-5.1-5.8v3.2a2.8 2.8 0 1 0 1.9 2.6V3h3.2Z" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <div className={styles.bottom}>
      <p>© {new Date().getFullYear()} MICE-LO. Todos los derechos reservados.</p>
      <div>
        <a href="/aviso-de-privacidad">Aviso de privacidad</a>
        <a href="#contacto">Términos de uso</a>
      </div>
    </div>
  </footer>
)

export default Footer
