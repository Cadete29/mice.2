import { useEffect, useMemo, useState } from 'react'
import * as authApi from '../services/authApi'
import ProjectCard from '../components/ProjectCard'
import styles from './ChiapasPorElClima.module.css'

const ChiapasPorElClima = () => {
  const [projects, setProjects] = useState([])
  const [category, setCategory] = useState('Todas')
  const [error, setError] = useState('')
  useEffect(() => { authApi.listProjects().then((r) => setProjects(r.projects)).catch((e) => setError(e.message)) }, [])
  const categories = ['Todas', ...new Set(projects.map((p) => p.category))]
  const visible = useMemo(() => category === 'Todas' ? projects : projects.filter((p) => p.category === category), [projects, category])
  return <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="chiapas-clima-title"><div className={styles.content}>
      <p className={styles.eyebrow}>Acción local · Impacto global</p><h1 id="chiapas-clima-title">Chiapas por el Clima</h1>
      <p className={styles.intro}>Un espacio para conocer, conectar e impulsar iniciativas que protegen la biodiversidad y fortalecen la resiliencia climática de Chiapas.</p>
    </div></section>
    <section className={styles.catalog} aria-labelledby="catalog-title"><div className={styles.catalogContainer}>
      <div className={styles.catalogHeading}><p className={styles.eyebrow}>Iniciativas de la comunidad</p><h2 id="catalog-title">Proyectos</h2><p>Conoce a las personas que están creando soluciones para el clima en Chiapas.</p></div>
      {categories.length > 1 && <div className={styles.filters} aria-label="Categorías">{categories.map((item) => <button className={category === item ? styles.selected : ''} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>}
      {error && <p role="alert">{error}</p>}
      <div className={styles.grid}>{visible.map((project) => <ProjectCard project={project} key={project.id} />)}</div>
      {!error && projects.length === 0 && <p className={styles.noProjects}>Aún no hay proyectos publicados. Sé la primera persona en compartir uno.</p>}
    </div></section>
  </main>
}
export default ChiapasPorElClima
