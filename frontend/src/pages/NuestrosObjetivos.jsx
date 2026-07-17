import styles from './NuestrosObjetivos.module.css'
import pie from '../assets/objets/pie.jpg'

const objectives = [
  {
    number: '01',
    title: 'Regenerar ecosistemas',
    description: 'Restaurar espacios naturales mediante proyectos comunitarios, ciencia y prácticas sostenibles.',
  },
  {
    number: '02',
    title: 'Fortalecer comunidades',
    description: 'Impulsar la participación local y brindar herramientas para construir comunidades resilientes.',
  },
  {
    number: '03',
    title: 'Promover la innovación',
    description: 'Conectar tecnología, conocimiento tradicional e investigación para resolver retos ambientales.',
  },
  {
    number: '04',
    title: 'Crear alianzas',
    description: 'Vincular personas, organizaciones e instituciones comprometidas con el futuro de Chiapas.',
  },
  {
    number: '05',
    title: 'Educar para transformar',
    description: 'Compartir conocimientos y experiencias que inspiren una cultura de cuidado ambiental y acción colectiva.',
  },
  {
    number: '06',
    title: 'Impulsar la economía sostenible',
    description: 'Promover iniciativas productivas responsables que generen oportunidades sin comprometer los recursos naturales.',
  },
]

const NuestrosObjetivos = () => (
  <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="objetivos-page-title">
      <div className={styles.container}>
        <p className={styles.eyebrow}>El rumbo que compartimos</p>
        <h1 id="objetivos-page-title">Nuestros Objetivos</h1>
        <p className={styles.intro}>
          Trabajamos con metas claras para transformar el conocimiento y la colaboración en
          resultados positivos para las personas y la naturaleza.
        </p>
      </div>
    </section>

    <section className={styles.objectives} aria-label="Objetivos de la organización">
      {objectives.map((objective) => (
        <article className={styles.objectiveCard} key={objective.number}>
          <span>{objective.number}</span>
          <h2>{objective.title}</h2>
          <p>{objective.description}</p>
        </article>
      ))}
    </section>
    <div className={styles.bottomImage} aria-hidden="true">
      <img src={pie} alt="" />
    </div>
  </main>
)

export default NuestrosObjetivos
