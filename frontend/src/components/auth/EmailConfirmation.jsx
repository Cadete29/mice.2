import AuthHeading from "./AuthHeading";
import styles from "../../pages/SignUp.module.css";
const EmailConfirmation = ({
  email,
  type,
  onBack,
  onResend,
  resendSent,
  deliveryFailed,
  error,
  loading,
}) => {
  const isRegistration = type === "register";
  const isReset = type === "reset";
  const isVerified = type === "verified";
  return (
    <div className={styles.confirmation}>
      <div className={styles.confirmationIcon} aria-hidden="true">
        ✓
      </div>
      <AuthHeading
        eyebrow={
          isReset
            ? "Acceso recuperado"
            : isVerified
              ? "Cuenta confirmada"
              : "Revisa tu bandeja de entrada"
        }
        title={
          isReset
            ? "Contraseña actualizada"
            : isVerified
              ? "Correo confirmado"
              : isRegistration
                ? "Confirma tu correo"
                : "Solicitud enviada"
        }
        description={
          isReset
            ? "Ya puedes iniciar sesión con tu nueva contraseña."
            : isVerified
              ? "Tu dirección de correo fue confirmada correctamente."
              : isRegistration
                ? "Te enviamos un enlace para activar tu cuenta."
                : "Te enviamos las instrucciones para restablecer tu contraseña."
        }
      />
      {email && <p className={styles.confirmationEmail}>{email}</p>}
      {!isReset && !isVerified && (
        <p className={styles.confirmationHint}>
          Si no encuentras el mensaje, revisa la carpeta de correo no deseado.
        </p>
      )}
      {deliveryFailed && (
        <p className={styles.formError} role="alert">
          La cuenta fue creada, pero el correo no pudo enviarse. Usa el botón
          para reintentarlo.
        </p>
      )}
      {resendSent && (
        <p className={styles.confirmationSuccess} role="status">
          Enviamos un nuevo enlace de confirmación.
        </p>
      )}
      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
      {onResend && (
        <button
          className={styles.resendButton}
          onClick={onResend}
          type="button"
          disabled={loading}
        >
          {loading ? "Enviando…" : "Reenviar correo de confirmación"}
        </button>
      )}
      <button className={styles.submitButton} onClick={onBack} type="button">
        Volver a iniciar sesión
      </button>
    </div>
  );
};
export default EmailConfirmation;
