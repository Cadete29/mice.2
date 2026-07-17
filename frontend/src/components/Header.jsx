import { useState } from 'react'
import logo1 from '../assets/logo1.png'
import styles from './Header.module.css'

const cx = (...classNames) => classNames.filter(Boolean).join(' ')

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <a href="/" aria-label="EcoKid inicio">
            <img src={logo1} alt="EcoKid" />
          </a>
        </div>
        
        <button 
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburger}></span>
        </button>

        <nav className={cx(styles.navMenu, isMenuOpen && styles.open)}>
          <ul>
            <li><a href="/chiapas-por-el-clima" onClick={() => setIsMenuOpen(false)}>Chiapas por el clima</a></li>
            <li><a href="/convocatorias" onClick={() => setIsMenuOpen(false)}>Convocatorias</a></li>
            <li><a href="/nosotros" onClick={() => setIsMenuOpen(false)}>Nosotros</a></li>
            <li><a href="/familia" onClick={() => setIsMenuOpen(false)}>Familia</a></li>
            {/* <li><a href="/#objetivos" onClick={() => setIsMenuOpen(false)}>Objetivos</a></li> */}
            <li><a href="/sign-up" onClick={() => setIsMenuOpen(false)}>Sign-up</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
