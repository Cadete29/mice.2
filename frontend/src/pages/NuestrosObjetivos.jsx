import styles from './NuestrosObjetivos.module.css'
import pie from '../assets/objets/pie.jpg'

const objectives = [
  {
    number: '01',
    title: 'Desarrollar soluciones innovadoras',
    description: 'Investigar y crear tecnologías y biomateriales que ayuden a regenerar ecosistemas, restaurar suelos y enfrentar desafíos ambientales.',
  },
  {
    number: '02',
    title: 'Impulsar la restauración y regeneración de ecosistemas',
    description: 'Impulsar la restauración y regeneración de ecosistemas',
  },
  {
    number: '03',
    title: 'Fortalecer la educación ambiental ',
    description: 'Desarrollar programas educativos, talleres y experiencias que acerquen el conocimiento ambiental a escuelas, comunidades y juventudes.',
  },
  {
    number: '04',
    title: 'Promover la participación comunitaria en la protección del medio ambiente',
    description: 'Promover la participación comunitaria en la protección del medio ambiente',
  },
  {
    number: '05',
    title: 'Desarrollar investigación aplicada para entender los ecosistemas',
    description: 'Desarrollar investigación aplicada para entender los ecosistemas',
  },
  {
    number: '06',
    title: 'Construir alianzas para generar impacto ambiental y social',
    description: 'Colaborar con comunidades, empresas, instituciones y organizaciones para implementar soluciones sostenibles a mayor escala.',
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
          {/* <span>{objective.number}</span> */}
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
