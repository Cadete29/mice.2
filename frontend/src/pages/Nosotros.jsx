import styles from "./Nosotros.module.css";
import ceo from "../assets/nosotros/luis.webp";
import cofundador from "../assets/nosotros/co-fun.webp";
import vinculacion from "../assets/nosotros/alianzas.webp";
import developer from "../assets/nosotros/developer.webp";
const team = [
  {
    name: "Ing. Luis Rovelo",
    role: "CEO - Director general",
    photo: ceo,
  },
  {
    name: " Lic. Katherine Andrea Vargas Jiménez",
    role: "Co-fundadora",
    photo: cofundador,
  },
  {
    name: "Ing. Edson Omar Martínez Gálvez",
    role: "Vinculación y Alianzas",
    photo: vinculacion,
  },
  {
    name: "Ing, Alan Michel Santiago Serrano",
    role: "Desarrollo y tecnología",
    photo: developer,
  },
];
const Nosotros = () => (
  <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="nosotros-title">
      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>Personas · Propósito · Acción</p>
        <h1 id="nosotros-title">Nosotros</h1>
        <p>
          Somos un equipo multidisciplinario que une ciencia, comunidad e
          innovación para construir un futuro sostenible en Chiapas.
        </p>
        <a className={styles.objectivesButton} href="/nuestros-objetivos">
          Nuestros Objetivos
        </a>
      </div>
    </section>

    <section className={styles.purpose} aria-label="Misión y visión">
      <article className={styles.purposeCard}>
        {/* <span>01</span> */}
        <h2>Misión</h2>
        <p>
          Impulsar proyectos ambientales y sociales que conecten a las personas,
          fortalezcan las comunidades y regeneren los ecosistemas de Chiapas.
        </p>
      </article>
      <article className={styles.purposeCard}>
        {/* <span>02</span> */}
        <h2>Visión</h2>
        <p>
          Ser una organización referente en innovación socioambiental, capaz de
          convertir la colaboración local en soluciones sostenibles de impacto
          global.
        </p>
      </article>
    </section>

    <section className={styles.teamSection} aria-labelledby="team-title">
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>Nuestro equipo</p>
        <h2 id="team-title">Equipo de dirección</h2>
        <p>
          Conoce a las personas responsables de coordinar cada área de nuestra
          organización.
        </p>
      </div>

      <div className={styles.teamGrid}>
        {team.map((member) => (
          <article className={styles.memberCard} key={member.role}>
            <img
              decoding="async"
              src={member.photo}
              alt={`Fotografía de ${member.name}`}
            />
            <div>
              <p>{member.role}</p>
              <h3>{member.name}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  </main>
);
export default Nosotros;
