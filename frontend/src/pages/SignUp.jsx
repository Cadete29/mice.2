import { useState } from 'react'
import logo from '../assets/logo1.png'
import styles from './SignUp.module.css'

const content = {
  login: ['Qué bueno verte de nuevo', 'Inicia sesión', 'Accede a tu cuenta y continúa formando parte de nuestra comunidad.'],
  register: ['Forma parte de MICE-LO', 'Crea tu cuenta', 'Regístrate para conectar con proyectos, convocatorias y personas aliadas.'],
  forgot: ['Recupera tu acceso', 'Olvidé mi contraseña', 'Escribe tu correo y te enviaremos instrucciones para recuperar tu cuenta.'],
}

const SignUp = () => {
  const [view, setView] = useState('login')
  const [eyebrow, title, description] = content[view]

  return (
    <main className={styles.page}>
      <section className={styles.authCard} aria-labelledby="auth-title">
        <div className={styles.introPanel}>
          <img src={logo} alt="MICE-LO" />
          <div>
            <p>Una comunidad que transforma</p>
            <h1>Conecta tus ideas con un futuro sostenible.</h1>
            <span>Participa en proyectos, conoce convocatorias y colabora con nuestra red ambiental.</span>
          </div>
        </div>

        <div className={styles.formPanel}>
          {view !== 'forgot' && (
            <div className={styles.tabs} role="tablist" aria-label="Acceso a la cuenta">
              <button className={view === 'login' ? styles.activeTab : ''} onClick={() => setView('login')} role="tab" aria-selected={view === 'login'} type="button">Iniciar sesión</button>
              <button className={view === 'register' ? styles.activeTab : ''} onClick={() => setView('register')} role="tab" aria-selected={view === 'register'} type="button">Registro</button>
            </div>
          )}

          <div className={styles.heading}>
            <p>{eyebrow}</p>
            <h2 id="auth-title">{title}</h2>
            <span>{description}</span>
          </div>

          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            {view === 'register' && (
              <div className={styles.fieldRow}>
                <label>Nombre<input name="nombre" type="text" autoComplete="given-name" required /></label>
                <label>Apellidos<input name="apellidos" type="text" autoComplete="family-name" required /></label>
              </div>
            )}
            <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
            {view !== 'forgot' && (
              <label>Contraseña<input name="password" type="password" autoComplete={view === 'login' ? 'current-password' : 'new-password'} minLength="8" required /></label>
            )}
            {view === 'register' && (
              <label>Confirmar contraseña<input name="password-confirmation" type="password" autoComplete="new-password" minLength="8" required /></label>
            )}
            {view === 'login' && <button className={styles.textButton} onClick={() => setView('forgot')} type="button">¿Olvidaste tu contraseña?</button>}
            {view === 'register' && (
              <label className={styles.checkField}><input name="terms" type="checkbox" required /><span>Acepto el aviso de privacidad y los términos de uso.</span></label>
            )}
            <button className={styles.submitButton} type="submit">
              {view === 'login' && 'Iniciar sesión'}
              {view === 'register' && 'Crear cuenta'}
              {view === 'forgot' && 'Enviar instrucciones'}
            </button>
          </form>
          {view === 'forgot' && <button className={styles.backButton} onClick={() => setView('login')} type="button">← Volver a iniciar sesión</button>}
        </div>
      </section>
    </main>
  )
}

export default SignUp
