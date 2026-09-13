import { useEffect, useRef, useState } from "react";
import { getActiveBeachEvent } from "../services/authApi";
import esfera from "../assets/hero/esfera.webp";
import esfera2 from "../assets/hero/esfera2.webp";
import fondo1 from "../assets/hero/fondo1.webp";
import fondo2 from "../assets/hero/fondo2.webp";
import fondo3 from "../assets/hero/fondo3.webp";
import styles from "./Hero.module.css";
const cx = (...classNames) => classNames.join(" ");
const Hero = () => {
  const heroRef = useRef(null);
  const [activeEvent, setActiveEvent] = useState(null);
  useEffect(() => {
    getActiveBeachEvent()
      .then(({ event }) => setActiveEvent(event))
      .catch(() => setActiveEvent(null));
  }, []);
  useEffect(() => {
    const hero = heroRef.current;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!hero || prefersReducedMotion) return undefined;
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      const visibleProgress =
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const progress = Math.max(0, Math.min(1, visibleProgress));
      const offset = (progress - 0.5) * 500;
      hero.style.setProperty("--hero-parallax-back-x", `${offset * 0.28}px`);
      hero.style.setProperty("--hero-parallax-back-y", `${offset * -0.48}px`);
      hero.style.setProperty("--hero-parallax-mid-x", `${offset * -0.42}px`);
      hero.style.setProperty("--hero-parallax-mid-y", `${offset * -0.7}px`);
      hero.style.setProperty("--hero-parallax-front-x", `${offset * 0.58}px`);
      hero.style.setProperty("--hero-parallax-front-y", `${offset * -0.9}px`);
      hero.style.setProperty("--hero-parallax-left-x", `${offset * -0.62}px`);
      hero.style.setProperty("--hero-parallax-left-y", `${offset * -0.65}px`);
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener("scroll", requestUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <section id="hero" className={styles.heroSection} ref={heroRef}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1>
            Fusión natural,
            <span>futuro</span>
            <span>sostenible</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Conectamos naturaleza, investigación e innovación para regenerar
            ecosistemas
          </p>
          <div className={styles.heroButtons}>
            <a href="#features">Conoce los proyectos</a>
            {activeEvent && (
              <a href="/registro-eventos">
                {activeEvent.name}
              </a>
            )}
            {/* <a href="/donativos">Donativos</a> */}
          </div>
        </div>

        <div className={styles.heroImages}>
          <img
            fetchPriority="high"
            decoding="async"
            src={fondo2}
            className={cx(styles.heroImage, styles.heroImageBottom)}
            alt=""
          />
          <img
            fetchPriority="high"
            decoding="async"
            src={fondo1}
            className={cx(styles.heroImage, styles.heroImageTop)}
            alt=""
          />
          <img
            loading="lazy"
            decoding="async"
            src={esfera2}
            className={cx(styles.heroImage, styles.heroImageSphereSecondary)}
            alt=""
          />
          <img
            fetchPriority="high"
            decoding="async"
            src={esfera}
            className={cx(styles.heroImage, styles.heroImageSphere)}
            alt=""
          />
        </div>
      </div>
      <img
        loading="lazy"
        decoding="async"
        src={fondo3}
        className={cx(styles.heroImage, styles.heroImageLeft)}
        alt=""
      />
    </section>
  );
};
export default Hero;
