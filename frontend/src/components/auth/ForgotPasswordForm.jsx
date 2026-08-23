import AuthHeading from './AuthHeading'
import styles from '../../pages/SignUp.module.css'

const ForgotPasswordForm = ({ onSubmit, onBack, error, loading }) => {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(new FormData(event.currentTarget).get('email'))
  }
  return <>
    <AuthHeading eyebrow="Recupera tu acceso" title="Olvidé mi contraseña" description="Escribe tu correo para generar instrucciones de recuperación." />
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <button className={styles.submitButton} type="submit" disabled={loading}>{loading ? 'Enviando…' : 'Enviar instrucciones'}</button>
    </form>
    <button className={styles.backButton} onClick={onBack} type="button">← Volver a iniciar sesión</button>
  </>
}
export default ForgotPasswordForm
