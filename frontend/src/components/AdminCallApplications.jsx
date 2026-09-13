import { useEffect, useState } from "react";
import * as api from "../services/authApi";
import styles from "./AdminCalls.module.css";
export default function AdminCallApplications() {
  const [apps, setApps] = useState([]),
    [message, setMessage] = useState("");
  useEffect(() => {
    api
      .listCallApplications()
      .then((r) => setApps(r.applications))
      .catch((e) => setMessage(e.message));
  }, []);
  const decide = async (item, status) => {
    try {
      await api.updateApplicationStatus(item.id, status);
      setApps((v) =>
        v.map((x) =>
          x.id === item.id
            ? {
                ...x,
                status,
              }
            : x,
        ),
      );
      setMessage("Estado actualizado.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const remove = async (item) => {
    if (
      !confirm(
        `¿Eliminar la postulación de ${item.applicant} a "${item.call.title}"?`,
      )
    )
      return;
    try {
      await api.deleteCallApplication(item.id);
      setApps((v) => v.filter((x) => x.id !== item.id));
      setMessage("Postulación eliminada.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  return (
    <section className={styles.wrapper}>
      <p>
        Las convocatorias externas no generan registros aquí. Esta lista
        contiene únicamente postulaciones internas y los contactos autorizados
        de cada cuenta.
      </p>
      {message && <p className={styles.message}>{message}</p>}
      <div className={styles.applications}>
        {apps.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.applicant}</strong>
              <span>
                {item.call.title} · {item.email}
              </span>
              <small>
                {[item.whatsapp, ...Object.values(item.social || {})]
                  .filter(Boolean)
                  .join(" · ") || "Sólo correo"}
              </small>
            </div>
            <div className={styles.applicationActions}>
              <select
                value={item.status}
                onChange={(e) => decide(item, e.target.value)}
              >
                <option value="pendiente" disabled>
                  Pendiente
                </option>
                <option value="aprobada">Aprobar</option>
                <option value="rechazada">Rechazar</option>
              </select>
              <button type="button" onClick={() => remove(item)}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
        {!apps.length && <p>No hay postulaciones internas.</p>}
      </div>
    </section>
  );
}
