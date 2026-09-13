import { useEffect, useState } from "react";
import * as api from "../services/authApi";
import styles from "./AdminBeachRegistrations.module.css";
const transport = {
  "necesita-transporte": "Necesita transporte",
  "cuenta-con-vehiculo": "Cuenta con vehículo",
};
export default function AdminBeachRegistrations() {
  const [items, setItems] = useState([]),
    [message, setMessage] = useState("");
  useEffect(() => {
    api
      .listBeachRegistrations()
      .then((r) => setItems(r.registrations))
      .catch((e) => setMessage(e.message));
  }, []);
  return (
    <section>
      {message && <p className={styles.message}>{message}</p>}
      <p className={styles.notice}>
        Esta sección contiene datos personales sensibles. Úsalos únicamente para
        coordinar la evento.
      </p>
      <div className={styles.list}>
        {items.map((item) => (
          <article key={item.id}>
            <div className={styles.heading}>
              <div>
                <strong>
                  {[
                    item.firstName,
                    item.middleName,
                    item.lastName,
                    item.secondLastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </strong>
                <span>{new Date(item.createdAt).toLocaleString("es-MX")}</span>
              </div>
              <b>{transport[item.transport]}</b>
            </div>
            <dl>
              <div>
                <dt>Correo</dt>
                <dd>
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                </dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>
                  <a href={`tel:${item.callingCode}${item.phone}`}>
                    {item.callingCode} {item.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Fecha de nacimiento</dt>
                <dd>
                  {new Date(item.birthDate).toLocaleDateString("es-MX", {
                    timeZone: "UTC",
                  })}
                </dd>
              </div>
              <div>
                <dt>CURP</dt>
                <dd>{item.curp}</dd>
              </div>
              <div>
                <dt>País telefónico</dt>
                <dd>{item.phoneCountry}</dd>
              </div>
            </dl>
            <p className={styles.consents}>
              ✓ Uso de imagen · ✓ Privacidad · ✓ Deslinde de responsabilidad
            </p>
          </article>
        ))}
        {!items.length && !message && (
          <p>No hay registros de eventos.</p>
        )}
      </div>
    </section>
  );
}
