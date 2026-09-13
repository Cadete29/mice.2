import { useEffect, useState } from "react";
import * as api from "../services/authApi";
import { requireAuthentication } from "../utils/requireAuthentication";
import styles from "./ProjectDetail.module.css";
const labels = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
};
function Gallery({ project }) {
  const images = project.gallery?.length
      ? project.gallery
      : [
          {
            image: project.image,
          },
        ],
    [selected, setSelected] = useState(
      images.find((item) => item.principal)?.image || images[0].image,
    );
  return (
    <div className={styles.gallery}>
      <img
        decoding="async"
        className={styles.mainImage}
        src={selected}
        alt={`Imagen del proyecto ${project.title}`}
      />
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((item, index) => (
            <button
              type="button"
              className={selected === item.image ? styles.selected : ""}
              onClick={() => setSelected(item.image)}
              key={item.id || index}
            >
              <img
                decoding="async"
                src={item.image}
                alt={`Ver imagen ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default function ProjectDetail({ projectId }) {
  const [project, setProject] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api
      .getProject(projectId)
      .then((r) => setProject(r.project))
      .catch((e) => setError(e.message));
  }, [projectId]);
  if (error)
    return (
      <main className={styles.page}>
        <section className={styles.error}>
          <h1>Proyecto no disponible</h1>
          <p>{error}</p>
          <a href="/chiapas-por-el-clima">Volver a proyectos</a>
        </section>
      </main>
    );
  if (!project)
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Cargando proyecto…</p>
      </main>
    );
  return (
    <main className={styles.page}>
      <article className={styles.project}>
        <a className={styles.back} href="/chiapas-por-el-clima">
          ← Volver a proyectos
        </a>
        <div className={styles.layout}>
          <Gallery project={project} />
          <div className={styles.content}>
            <p className={styles.category}>{project.category}</p>
            <h1>{project.title}</h1>
            <p className={styles.author}>
              Creado por <strong>{project.author}</strong>
            </p>
            <div className={styles.description}>{project.description}</div>
            <div className={styles.contacts}>
              <a href={`mailto:${project.email}`}>Correo</a>
              {project.whatsapp && (
                <a
                  href={`https://wa.me/${project.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={requireAuthentication}
                >
                  WhatsApp
                </a>
              )}
              {Object.entries(project.social || {})
                .filter(([, url]) => url)
                .map(([name, url]) => (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={requireAuthentication}
                    key={name}
                  >
                    {labels[name] || name}
                  </a>
                ))}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
