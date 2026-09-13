import { useEffect, useState } from "react";
import { listParticipantEmails, sendParticipantEmails } from "../services/authApi";
import styles from "./AdminBeachAnalytics.module.css";

export default function ParticipantEmails({ eventId, eventName, participants, selectedIds }) {
  const [mode, setMode] = useState("selected");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [review, setReview] = useState(null);
  const [sending, setSending] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [batches, setBatches] = useState([]);
  const recipients = mode === "all" ? participants : participants.filter(item => selectedIds.includes(item.id));
  const uniqueEmails = [...new Set(recipients.map(item => item.email.trim().toLowerCase()))];

  useEffect(() => {
    let cancelled = false;
    const refresh = () => listParticipantEmails(eventId).then(({ batches: next }) => {
      if (!cancelled) setBatches(next);
    }).catch(() => { if (!cancelled) setError("No se pudo actualizar el historial de correos."); });
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [eventId]);

  const prepare = (event) => {
    event.preventDefault();
    if (!recipients.length) return;
    setError("");
    setNotice("");
    setReview({ requestId: crypto.randomUUID(), participantIds: recipients.map(item => item.id), emails: uniqueEmails, subject: subject.trim(), message: message.trim() });
  };
  const send = async () => {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const content = { requestId: review.requestId, participantIds: review.participantIds, subject: review.subject, message: review.message };
      await sendParticipantEmails(eventId, content);
      setNotice("Envío en cola. Puedes consultar su progreso en el historial.");
      setReview(null);
      setUncertain(false);
      setSubject("");
      setMessage("");
      const response = await listParticipantEmails(eventId).catch(() => null);
      if (response) setBatches(response.batches);
    } catch (e) {
      const ambiguous = !e.status || (e.status >= 500 && e.code !== "EMAIL_DISABLED");
      setUncertain(ambiguous);
      setError(ambiguous ? "No se pudo confirmar la solicitud. Puedes reintentar este mismo envío sin duplicarlo." : e.message);
    } finally { setSending(false); }
  };

  return <section className={`${styles.emailComposer} ${styles.noPrint}`} aria-label="Correos a participantes">
    <h3>Enviar correo a participantes</h3>
    <p>{eventName} · {selectedIds.length} participantes seleccionados</p>
    <p>Cada correo incluirá automáticamente el nombre de sus destinatarios en el saludo.</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {!review ? <form onSubmit={prepare} className={styles.createEventForm}>
      <label>Destinatarios
        <select aria-label="Destinatarios" value={mode} onChange={event => setMode(event.target.value)}>
          <option value="selected">Participantes seleccionados</option>
          <option value="all">Todos los participantes del evento</option>
        </select>
      </label>
      <p>{recipients.length} participantes · {uniqueEmails.length} direcciones únicas. Los filtros y la página actual no limitan “Todos”.</p>
      <label>Asunto<input required maxLength={160} value={subject} onChange={event => setSubject(event.target.value)} /></label>
      <label>Mensaje<textarea required rows={6} maxLength={10000} value={message} onChange={event => setMessage(event.target.value)} /></label>
      <button disabled={!recipients.length || !subject.trim() || !message.trim()}>Revisar envío</button>
    </form> : <div>
      <h4>Revisar correo</h4>
      <p>Se enviará individualmente a {review.emails.length} direcciones.</p>
      <details><summary>Ver destinatarios</summary><ul>{review.emails.map(address => <li key={address}>{address}</li>)}</ul></details>
      <strong>{review.subject}</strong>
      <p className={styles.emailPreview}>{review.message}</p>
      <button type="button" disabled={sending} onClick={send}>{sending ? "Registrando envío…" : uncertain ? "Reintentar mismo envío" : `Confirmar envío a ${review.emails.length} direcciones`}</button>
      <button type="button" disabled={sending || uncertain} onClick={() => setReview(null)}>Volver a editar</button>
    </div>}
    <h4>Últimos envíos</h4>
    <p>“Aceptados” indica que el servidor de correo recibió el mensaje; no confirma su lectura. Los envíos sin confirmación no se reintentan automáticamente.</p>
    {!batches.length && <p>Todavía no hay envíos.</p>}
    {batches.map(batch => <p key={batch.id}><strong>{batch.subject}</strong> · {new Date(batch.created_at).toLocaleString("es-MX")}<br />
      {batch.sent} aceptados · {batch.pending} pendientes · {batch.failed} fallidos · {batch.unknown} sin confirmación · {batch.total} destinatarios
    </p>)}
  </section>;
}
