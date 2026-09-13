import AuthHeading from "./AuthHeading";
import styles from "../../pages/SignUp.module.css";
const MfaChallengeForm = ({ onSubmit, onBack, error, loading }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget).get("code"));
  };
  return (
    <>
      <AuthHeading
        eyebrow="Verificación en dos pasos"
        title="Confirma que eres tú"
        description="Escribe el código de 6 dígitos de tu aplicación o uno de tus códigos de recuperación."
      />
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Código de autenticación
          <input
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            minLength="6"
            maxLength="20"
            required
            autoFocus
          />
        </label>
        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
        <button
          className={styles.submitButton}
          type="submit"
          disabled={loading}
        >
          {loading ? "Verificando…" : "Verificar y entrar"}
        </button>
        <button className={styles.backButton} type="button" onClick={onBack}>
          Volver al inicio de sesión
        </button>
      </form>
    </>
  );
};
export default MfaChallengeForm;
