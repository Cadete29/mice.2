import AuthHeading from "./AuthHeading";
import styles from "../../pages/SignUp.module.css";
const ResetPasswordForm = ({ onSubmit, onBack, error, loading }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get("password");
    if (password !== form.get("password-confirmation"))
      return onSubmit({
        validationError: "Las contraseñas no coinciden.",
      });
    onSubmit({
      password,
    });
  };
  return (
    <>
      <AuthHeading
        eyebrow="Protege tu cuenta"
        title="Crea una nueva contraseña"
        description="Elige una contraseña nueva que no hayas utilizado anteriormente."
      />
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Nueva contraseña
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength="10"
            required
          />
        </label>
        <label>
          Confirmar contraseña
          <input
            name="password-confirmation"
            type="password"
            autoComplete="new-password"
            minLength="10"
            required
          />
        </label>
        <p className={styles.passwordHint}>
          Mínimo 10 caracteres, una mayúscula, una minúscula y un número.
        </p>
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
          {loading ? "Actualizando…" : "Actualizar contraseña"}
        </button>
      </form>
      <button className={styles.backButton} onClick={onBack} type="button">
        ← Volver a iniciar sesión
      </button>
    </>
  );
};
export default ResetPasswordForm;
