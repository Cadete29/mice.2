import { useEffect, useState } from "react";
import logo1 from "../assets/logo1.webp";
import styles from "./Header.module.css";
import { getCurrentUser, hasAccessToken, logout } from "../services/authApi";
const cx = (...classNames) => classNames.filter(Boolean).join(" ");
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const isAuthenticated = Boolean(currentUser || hasAccessToken());
  useEffect(() => {
    let active = true;
    const syncSession = () => {
      if (!hasAccessToken()) setCurrentUser(null);
    };
    if (hasAccessToken()) {
      getCurrentUser()
        .then((user) => {
          if (active) setCurrentUser(user || null);
        })
        .catch(() => {
          if (active) setCurrentUser(null);
        });
    }
    window.addEventListener("storage", syncSession);
    window.addEventListener("micelo-auth-change", syncSession);
    return () => {
      active = false;
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("micelo-auth-change", syncSession);
    };
  }, []);
  const handleSession = async () => {
    setIsMenuOpen(false);
    if (!isAuthenticated) {
      window.location.href = "/sign-up";
      return;
    }
    await logout().catch(() => {});
    window.location.href = "/";
  };
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logo}>
          <a href="/" aria-label="EcoKid inicio">
            <img decoding="async" src={logo1} alt="EcoKid" />
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
            <li>
              <a
                href="/chiapas-por-el-clima"
                onClick={() => setIsMenuOpen(false)}
              >
                Chiapas por el clima
              </a>
            </li>
            <li>
              <a href="/convocatorias" onClick={() => setIsMenuOpen(false)}>
                Convocatorias
              </a>
            </li>
            <li>
              <a href="/nosotros" onClick={() => setIsMenuOpen(false)}>
                Nosotros
              </a>
            </li>
            <li>
              <a href="/familia" onClick={() => setIsMenuOpen(false)}>
                Familia
              </a>
            </li>
            {isAuthenticated && (
              <li>
                <a
                  href={
                    currentUser?.tipo === "administrador"
                      ? "/administracion"
                      : "/dashboard"
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </a>
              </li>
            )}
            <li>
              <button
                className={`${styles.sessionButton} ${isAuthenticated ? styles.logoutButton : ""}`}
                onClick={handleSession}
                type="button"
                aria-label={isAuthenticated ? "Logout" : "Login"}
              >
                <span className={styles.sessionIcon} aria-hidden="true">
                  <svg viewBox="0 0 512 512">
                    <path d="M377.9 105.9 500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9-18.7 0-33.9-15.2-33.9-33.9V320H192c-17.7 0-32-14.3-32-32v-64c0-17.7 14.3-32 32-32h128v-62.1c0-18.7 15.2-33.9 33.9-33.9 9 0 17.6 3.6 24 9.9ZM160 96H96c-17.7 0-32 14.3-32 32v256c0 17.7 14.3 32 32 32h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-53 0-96-43-96-96V128C0 75 43 32 96 32h64c17.7 0 32 14.3 32 32s-14.3 32-32 32Z" />
                  </svg>
                </span>
                <span className={styles.sessionText}>
                  {isAuthenticated ? "Logout" : "Login"}
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
export default Header;
