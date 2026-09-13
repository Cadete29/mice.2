import AuthHeading from "./AuthHeading";
import styles from "../../pages/SignUp.module.css";
const RegisterForm = ({ onSubmit, error, loading }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get("password");
    if (password !== form.get("password-confirmation"))
      return onSubmit({
        validationError: "Las contraseñas no coinciden.",
      });
    onSubmit({
      nombre: form.get("nombre"),
      segundoNombre: form.get("segundo-nombre") || undefined,
      apellidoPaterno: form.get("apellido-paterno"),
      apellidoMaterno: form.get("apellido-materno") || undefined,
      correoElectronico: form.get("email"),
      password,
      aceptaTerminos: form.get("terms") === "on",
    });
  };
  return (
    <>
      <AuthHeading
        eyebrow="Forma parte de MICE-LO"
        title="Crea tu cuenta"
        description="Regístrate para conectar con proyectos, convocatorias y personas aliadas."
      />
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.fieldRow}>
          <label>
            Nombre
            <input
              name="nombre"
              type="text"
              autoComplete="given-name"
              required
            />
          </label>
          <label>
            Segundo nombre
            <input
              name="segundo-nombre"
              type="text"
              autoComplete="additional-name"
            />
          </label>
        </div>
        <div className={styles.fieldRow}>
          <label>
            Apellido paterno
            <input
              name="apellido-paterno"
              type="text"
              autoComplete="family-name"
              required
            />
          </label>
          <label>
            Apellido materno
            <input
              name="apellido-materno"
              type="text"
              autoComplete="family-name"
            />
          </label>
        </div>
        <label>
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Contraseña
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
        <label className={styles.checkField}>
          <input name="terms" type="checkbox" required />
          <span>
            Acepto el{" "}
            <a href="/aviso-de-privacidad" target="_blank" rel="noreferrer">
              aviso de privacidad
            </a>{" "}
            y los{" "}
            <a href="/terminos-de-uso" target="_blank" rel="noreferrer">
              términos de uso
            </a>
            .
          </span>
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
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
    </>
  );
};
export default RegisterForm;
