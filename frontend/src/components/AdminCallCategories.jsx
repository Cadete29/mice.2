import { useEffect, useState } from "react";
import * as api from "../services/authApi";
import styles from "./AdminCategories.module.css";
export default function AdminCallCategories() {
  const [items, setItems] = useState([]),
    [message, setMessage] = useState("");
  useEffect(() => {
    api
      .listCallCategories()
      .then((r) => setItems(r.categories))
      .catch((e) => setMessage(e.message));
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    const input = e.currentTarget.nombre;
    try {
      const r = await api.createCallCategory(input.value);
      setItems((v) =>
        [...v, r.category].sort((x, y) => x.name.localeCompare(y.name)),
      );
      input.value = "";
      setMessage("Categoría de convocatoria creada.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  const remove = async (item) => {
    if (!confirm(`¿Eliminar la categoría "${item.name}"?`)) return;
    try {
      await api.deleteCallCategory(item.id);
      setItems((v) => v.filter((x) => x.id !== item.id));
      setMessage("Categoría eliminada.");
    } catch (error) {
      setMessage(error.message);
    }
  };
  return (
    <section>
      <p>
        Estas categorías se usarán exclusivamente al publicar convocatorias.
      </p>
      {message && <p className={styles.message}>{message}</p>}
      <form className={styles.form} onSubmit={submit}>
        <input
          name="nombre"
          minLength="2"
          maxLength="60"
          placeholder="Ej. Voluntariado"
          required
        />
        <button>Crear categoría</button>
      </form>
      <div className={styles.list}>
        {items.map((item) => (
          <article key={item.id}>
            <strong>{item.name}</strong>
            <button onClick={() => remove(item)}>Eliminar</button>
          </article>
        ))}
      </div>
    </section>
  );
}
