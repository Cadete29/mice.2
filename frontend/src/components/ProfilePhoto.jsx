import { useRef, useState } from "react";
import * as api from "../services/authApi";
import styles from "./ProfilePhoto.module.css";
import { serializeImageFile } from "../utils/images";
export default function ProfilePhoto({ user, onChange }) {
  const input = useRef(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    initials =
      `${user.nombre?.[0] || ""}${user.apellidoPaterno?.[0] || ""}`.toUpperCase();
  const select = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return setMessage("Selecciona una imagen JPEG, PNG o WebP.");
    if (file.size > 2 * 1024 * 1024)
      return setMessage("La fotografía debe pesar máximo 2 MB.");
    setBusy(true);
    setMessage("");
    try {
      const photo = await serializeImageFile(file, {
          maxWidth: 512,
          maxHeight: 512,
          quality: 0.8,
        }),
        r = await api.saveProfilePhoto(photo);
      onChange(r.user);
      setMessage("Fotografía actualizada.");
    } catch (error) {
      setMessage(error.message || "No fue posible leer la fotografía.");
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    setMessage("");
    try {
      const r = await api.deleteProfilePhoto();
      onChange(r.user);
      setMessage("Fotografía eliminada.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <div className={styles.profile}>
        <button
          type="button"
          className={styles.avatar}
          onClick={() => input.current.click()}
          disabled={busy}
          aria-label="Seleccionar fotografía de perfil"
        >
          {user.fotoPerfil ? (
            <img
              decoding="async"
              src={user.fotoPerfil}
              alt={`Fotografía de ${user.nombre}`}
            />
          ) : (
            initials
          )}
        </button>
        <div>
          <strong>Fotografía de presentación</strong>
          <p>JPEG, PNG o WebP; máximo 2 MB.</p>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => input.current.click()}
            disabled={busy}
          >
            {busy ? "Guardando…" : "Elegir fotografía"}
          </button>
          {user.fotoPerfil && (
            <button
              type="button"
              className={`${styles.secondary} ${styles.removePhoto}`}
              onClick={remove}
              disabled={busy}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
      <input
        ref={input}
        className={styles.hidden}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={select}
      />
      {message && (
        <p className={styles.profileMessage} role="status">
          {message}
        </p>
      )}
    </div>
  );
}
