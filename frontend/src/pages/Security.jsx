import { useEffect, useState } from "react";
import * as authApi from "../services/authApi";
import styles from "./Security.module.css";
const Security = () => {
  const [status, setStatus] = useState(null);
  const [setup, setSetup] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    Promise.all([authApi.getMfaStatus(), authApi.getSessions()])
      .then(([mfaStatus, sessionResult]) => {
        setStatus(mfaStatus);
        setSessions(
          Array.isArray(sessionResult.sessions) ? sessionResult.sessions : [],
        );
      })
      .catch((requestError) => {
        if (requestError.status === 401) window.location.href = "/sign-up";
        else setError(requestError.message);
      })
      .finally(() => setLoading(false));
  }, []);
  const run = async (action) => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await action();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };
  const beginSetup = () =>
    run(async () => {
      setSetup(await authApi.beginMfaSetup());
      setRecoveryCodes(null);
    });
  const enable = (event) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get("code");
    return run(async () => {
      const result = await authApi.enableMfa(code);
      setRecoveryCodes(result.recoveryCodes);
      setSetup(null);
      setStatus({
        enabled: true,
        setupPending: false,
      });
      setMessage("La verificación en dos pasos quedó habilitada.");
    });
  };
  const disable = (event) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get("code");
    return run(async () => {
      await authApi.disableMfa(code);
      setStatus({
        enabled: false,
        setupPending: false,
      });
      setRecoveryCodes(null);
      setMessage("La verificación en dos pasos fue desactivada.");
      event.currentTarget.reset();
    });
  };
  const revokeDevice = (session) =>
    run(async () => {
      await authApi.revokeSession(session.id, session.current);
      if (session.current) window.location.href = "/sign-up";
      else
        setSessions((current) =>
          current.map((item) =>
            item.id === session.id
              ? {
                  ...item,
                  active: false,
                  revokedAt: new Date().toISOString(),
                  revocationReason: "user_revoked",
                }
              : item,
          ),
        );
    });
  const closeAllSessions = () =>
    run(async () => {
      await authApi.logoutAllSessions();
      window.location.href = "/sign-up";
    });
  const deviceName = (userAgent) => {
    if (!userAgent) return "Dispositivo desconocido";
    const browser = userAgent.includes("Edg/")
      ? "Edge"
      : userAgent.includes("Firefox/")
        ? "Firefox"
        : userAgent.includes("Chrome/")
          ? "Chrome"
          : userAgent.includes("Safari/")
            ? "Safari"
            : "Navegador";
    const system = userAgent.includes("Windows")
      ? "Windows"
      : userAgent.includes("Android")
        ? "Android"
        : /iPhone|iPad/.test(userAgent)
          ? "iOS"
          : userAgent.includes("Mac OS")
            ? "macOS"
            : "dispositivo";
    return `${browser} en ${system}`;
  };
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Seguridad de la cuenta</p>
        <h1>Verificación en dos pasos</h1>
        <p>
          Protege tu cuenta con códigos temporales de una aplicación de
          autenticación.
        </p>

        {loading && !status && <p role="status">Consultando configuración…</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className={styles.success} role="status">
            {message}
          </p>
        )}

        {status && !status.enabled && !setup && (
          <button
            className={styles.primary}
            type="button"
            onClick={beginSetup}
            disabled={loading}
          >
            Configurar MFA
          </button>
        )}

        {setup && (
          <div className={styles.setup}>
            <h2>1. Agrega la cuenta a tu aplicación</h2>
            <p>
              En Google Authenticator, Authy o una aplicación compatible, elige
              introducir una clave manualmente.
            </p>
            <code>{setup.secret}</code>
            <details>
              <summary>URI de configuración avanzada</summary>
              <code className={styles.uri}>{setup.provisioningUri}</code>
            </details>
            <h2>2. Confirma el código</h2>
            <form onSubmit={enable} className={styles.form}>
              <input
                name="code"
                aria-label="Código de seis dígitos"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength="6"
                required
              />
              <button className={styles.primary} disabled={loading}>
                Activar MFA
              </button>
            </form>
          </div>
        )}

        {recoveryCodes && (
          <div className={styles.recovery}>
            <h2>Guarda tus códigos de recuperación</h2>
            <p>
              Cada código funciona una sola vez, expira en 30 días y no volverá
              a mostrarse.
            </p>
            <div>
              {recoveryCodes.map((code) => (
                <code key={code}>{code}</code>
              ))}
            </div>
          </div>
        )}

        {status?.enabled && !recoveryCodes && (
          <div className={styles.enabled}>
            <strong>MFA está habilitado</strong>
            <p>
              Para desactivarlo, introduce un código temporal o de recuperación.
            </p>
            <form onSubmit={disable} className={styles.form}>
              <input
                name="code"
                aria-label="Código de autenticación"
                autoComplete="one-time-code"
                minLength="6"
                maxLength="20"
                required
              />
              <button className={styles.danger} disabled={loading}>
                Desactivar MFA
              </button>
            </form>
          </div>
        )}

        {status && (
          <section className={styles.sessions}>
            <div className={styles.sessionsHeading}>
              <div>
                <h2>Sesiones y dispositivos</h2>
                <p>
                  Revisa dónde está abierta tu cuenta y cierra cualquier acceso
                  que no reconozcas.
                </p>
              </div>
              <button
                className={styles.danger}
                type="button"
                onClick={closeAllSessions}
                disabled={loading}
              >
                Cerrar todas
              </button>
            </div>
            <div className={styles.sessionList}>
              {sessions.map((session) => (
                <article
                  className={`${styles.session} ${!session.active ? styles.revoked : ""}`}
                  key={session.id}
                >
                  <div>
                    <strong>
                      {deviceName(session.device)}{" "}
                      {session.current && <span>Este dispositivo</span>}
                    </strong>
                    <p>
                      {session.ip || "IP desconocida"} · Inició{" "}
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                    <small>
                      {session.active
                        ? `Expira ${new Date(session.expiresAt).toLocaleString()}`
                        : `Cerrada${session.revocationReason ? ` · ${session.revocationReason}` : ""}`}
                    </small>
                  </div>
                  {session.active && (
                    <button
                      type="button"
                      onClick={() => revokeDevice(session)}
                      disabled={loading}
                    >
                      Cerrar sesión
                    </button>
                  )}
                </article>
              ))}
              {sessions.length === 0 && <p>No hay sesiones registradas.</p>}
            </div>
          </section>
        )}
      </section>
    </main>
  );
};
export default Security;
