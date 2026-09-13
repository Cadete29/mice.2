import { useEffect, useState } from "react";
import * as api from "../services/authApi";
import { requireAuthentication } from "../utils/requireAuthentication";
import styles from "./ProjectCard.module.css";
const SocialIcon = ({ name }) => {
  const paths = {
    facebook:
      "M13.5 22v-8h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.7-1.6H17V4.3c-.8-.1-1.7-.3-2.6-.3-2.7 0-4.5 1.6-4.5 4.6v2.2H7V14h2.9v8h3.6Z",
    x: "M18.7 3H22l-7.2 8.2L23.3 21h-6.7l-5.2-6.8L5.5 21H2.2l7.7-8.8L1.7 3h6.8l4.7 6.2L18.7 3Zm-1.2 16h1.8L7.5 4.9h-2L17.5 19Z",
    tiktok:
      "M15.7 3c.3 2.4 1.7 3.9 4.3 4.1v3.1a8.5 8.5 0 0 1-4.3-1.3v6.3a5.9 5.9 0 1 1-5.1-5.8v3.2a2.8 2.8 0 1 0 1.9 2.6V3h3.2Z",
    youtube:
      "M22.5 7.1a2.8 2.8 0 0 0-2-2C18.7 4.6 12 4.6 12 4.6s-6.7 0-8.5.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.8.5 8.5.5 8.5.5s6.7 0 8.5-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-4.9ZM9.8 15.2V8.8l5.6 3.2-5.6 3.2Z",
    linkedin:
      "M6.5 8.5H3.3V21h3.2V8.5ZM4.9 3A1.9 1.9 0 1 0 5 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.8c0-3.8-2-5.6-4.7-5.6-2.2 0-3.1 1.2-3.7 2V8.5H9.4V21h3.2v-6.2c0-1.6.3-3.2 2.4-3.2s2.1 1.9 2.1 3.3V21H21v-7.2Z",
    whatsapp:
      "M12 2a9.8 9.8 0 0 0-8.5 14.7L2 22l5.4-1.4A10 10 0 1 0 12 2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 19.8Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.7.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.2-.4-.3-.9-.5Z",
  };
  if (name === "instagram")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="17.5" cy="6.5" r="1.2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
};
const networks = [
  ["facebook", (user) => `https://facebook.com/${user}`],
  ["instagram", (user) => `https://instagram.com/${user}`],
  ["x", (user) => `https://x.com/${user}`],
  ["tiktok", (user) => `https://tiktok.com/@${user}`],
  ["youtube", (user) => `https://youtube.com/@${user}`],
  ["linkedin", (user) => `https://linkedin.com/in/${user}`],
];
const socialUrl = (builder, value) =>
  /^https?:\/\//i.test(value) ? value : builder(value.replace(/^@/, ""));
export default function ProjectCard({ project: initialProject }) {
  const [project, setProject] = useState(initialProject),
    [editing, setEditing] = useState(false),
    [deleted, setDeleted] = useState(false),
    [categories, setCategories] = useState([]),
    [message, setMessage] = useState(""),
    [editImages, setEditImages] = useState([]),
    [editPrincipal, setEditPrincipal] = useState(0),
    isOwnerView = window.location.pathname === "/dashboard";
  useEffect(() => {
    if (editing && !categories.length)
      api
        .listCategories()
        .then((r) => setCategories(r.categories))
        .catch((e) => setMessage(e.message));
  }, [editing, categories.length]);
  useEffect(() => {
    if (!editing) return undefined;
    const close = (e) => {
      if (e.key === "Escape") setEditing(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [editing]);
  const openEditor = async () => {
    setMessage("");
    try {
      const result = await api.getProject(project.id),
        gallery = result.project.gallery?.length
          ? result.project.gallery
          : [
              {
                image: result.project.image,
                principal: true,
              },
            ];
      setEditImages(
        gallery.map((item) => ({
          dataUrl: item.image,
          preview: item.image,
        })),
      );
      setEditPrincipal(
        Math.max(
          gallery.findIndex((item) => item.principal),
          0,
        ),
      );
      setEditing(true);
    } catch (error) {
      setMessage(error.message);
    }
  };
  const remove = async () => {
    if (
      !window.confirm(
        `¿Eliminar "${project.title}"? Esta acción no se puede deshacer.`,
      )
    )
      return;
    try {
      await api.deleteOwnProject(project.id);
      setDeleted(true);
    } catch (error) {
      setMessage(error.message);
    }
  };
  const chooseEditImages = (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    if (files.some((file) => file.size > 3 * 1024 * 1024))
      return setMessage("Cada imagen debe pesar máximo 3 MB.");
    const existing = new Set(
        editImages
          .filter((item) => item.file)
          .map(({ file }) => `${file.name}-${file.size}-${file.lastModified}`),
      ),
      fresh = files.filter(
        (file) =>
          !existing.has(`${file.name}-${file.size}-${file.lastModified}`),
      );
    if (editImages.length + fresh.length > 6)
      return setMessage("Puedes subir máximo 6 imágenes en total.");
    setEditImages((current) => [
      ...current,
      ...fresh.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    setMessage("");
  };
  const removeEditImage = (index) => {
    setEditImages((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    setEditPrincipal((current) =>
      current === index ? 0 : current > index ? current - 1 : current,
    );
  };
  const save = async (e) => {
    e.preventDefault();
    if (!editImages.length)
      return setMessage("El proyecto debe conservar al menos una imagen.");
    const form = e.currentTarget;
    try {
      const payload = {
          titulo: form.titulo.value,
          descripcion: form.descripcion.value,
          categoria: form.categoria.value,
        },
        serialized = await Promise.all(
          editImages.map(
            (item) =>
              item.dataUrl ||
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(item.file);
              }),
          ),
        );
      payload.imagen = serialized[editPrincipal];
      payload.imagenes = serialized;
      payload.imagenPrincipal = editPrincipal;
      const r = await api.updateProject(project.id, payload);
      setProject(r.project);
      setEditing(false);
      setEditImages([]);
      setMessage("Proyecto actualizado.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  if (deleted) return null;
  return (
    <>
      <article className={styles.card}>
        <img
          loading="lazy"
          decoding="async"
          className={styles.thumbnail}
          src={project.image}
          alt=""
        />
        <div className={styles.content}>
          <h3>{project.title}</h3>
          <p className={styles.description}>{project.description}</p>
          <a className={styles.readMore} href={`/proyectos/${project.id}`}>
            Ver más
          </a>
          <p className={styles.author}>
            <span>Creado por:</span>{" "}
            <a href={`/perfiles/${project.authorId}`}>{project.author}</a>
          </p>
          <p className={styles.joinProject}>Únete a mi proyecto:</p>
          <div className={styles.contactLinks}>
            <a href={`mailto:${project.email}`}>Correo</a>
            {project.whatsapp && (
              <a
                href={`https://wa.me/${project.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                onClick={requireAuthentication}
                aria-label={`Contactar a ${project.author} por WhatsApp`}
              >
                <SocialIcon name="whatsapp" />
              </a>
            )}
          </div>
          <div
            className={styles.socialLinks}
            aria-label={`Redes sociales de ${project.author}`}
          >
            {networks.map(
              ([name, url]) =>
                project.social?.[name] && (
                  <a
                    key={name}
                    href={socialUrl(url, project.social[name])}
                    target="_blank"
                    rel="noreferrer"
                    onClick={requireAuthentication}
                    aria-label={name}
                  >
                    <SocialIcon name={name} />
                  </a>
                ),
            )}
          </div>
          {isOwnerView && (
            <div className={styles.ownerActions}>
              <button type="button" onClick={openEditor}>
                Editar
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={remove}
              >
                Eliminar
              </button>
            </div>
          )}
          {message && (
            <p className={styles.message} role="status">
              {message}
            </p>
          )}
        </div>
      </article>
      {editing && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditing(false);
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-project-${project.id}`}
          >
            <div className={styles.modalHeading}>
              <div>
                <p>Editar proyecto</p>
                <h2 id={`edit-project-${project.id}`}>{project.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Cerrar edición"
              >
                ×
              </button>
            </div>
            <p>
              Edita las fotografías existentes, agrega nuevas y elige la imagen
              principal.
            </p>
            <form className={styles.editForm} onSubmit={save}>
              <label>
                Título
                <input
                  name="titulo"
                  defaultValue={project.title}
                  minLength="3"
                  maxLength="140"
                  required
                />
              </label>
              <label>
                Categoría
                <select
                  name="categoria"
                  defaultValue={project.category}
                  required
                >
                  {categories.map((category) => (
                    <option value={category.name} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.fullField}>
                Descripción
                <textarea
                  name="descripcion"
                  defaultValue={project.description}
                  minLength="20"
                  maxLength="2000"
                  rows="7"
                  required
                />
              </label>
              <label className={styles.fullField}>
                Agregar imágenes (máximo 6 en total)
                <input
                  name="imagenes"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={chooseEditImages}
                />
              </label>
              {editImages.length > 0 && (
                <div className={`${styles.fullField} ${styles.editGallery}`}>
                  {editImages.map((item, index) => (
                    <div
                      className={`${styles.editImageItem} ${editPrincipal === index ? styles.chosenImage : ""}`}
                      key={item.preview}
                    >
                      <img
                        loading="lazy"
                        decoding="async"
                        src={item.preview}
                        alt={`Vista previa ${index + 1}`}
                      />
                      <label>
                        <input
                          type="radio"
                          name="editPrincipal"
                          checked={editPrincipal === index}
                          onChange={() => setEditPrincipal(index)}
                        />{" "}
                        Imagen principal
                      </label>
                      <button
                        type="button"
                        onClick={() => removeEditImage(index)}
                      >
                        Eliminar foto
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setEditing(false)}>
                  Cancelar
                </button>
                <button type="submit">Guardar cambios</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
