import AuthHeading from "./AuthHeading";
import styles from "../../pages/SignUp.module.css";
const LoginForm = ({ onSubmit, onForgotPassword, error, loading }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      correoElectronico: form.get("email"),
      password: form.get("password"),
    });
  };
  return (
    <>
      <AuthHeading
        eyebrow="Qué bueno verte de nuevo"
        title="Inicia sesión"
        description="Accede a tu cuenta y continúa formando parte de nuestra comunidad."
      />
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
        <button
          className={styles.textButton}
          onClick={onForgotPassword}
          type="button"
        >
          ¿Olvidaste tu contraseña?
        </button>
        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Iniciando…" : "Iniciar sesión"}
        </button>
      </form>
    </>
  );
};
export default LoginForm;
