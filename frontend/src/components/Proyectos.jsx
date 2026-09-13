import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import hoja1 from "../assets/objects/hoja1.webp";
import hoja2 from "../assets/objects/hoja2.webp";
import sidelateral from "../assets/objects/sidelateral.webp";
import arbusto from "../assets/objects/arbusto.webp";
import styles from "./Proyectos.module.css";
const cx = (...classNames) => classNames.filter(Boolean).join(" ");
const proyectosActivos = [
  {
    id: "ere",
    nombre: "Ere de Reforestacion",
    ubicacion: "Mazatan",
    coordenadas: [14.863, -92.449],
    descripcion:
      "Ell Primer vivero ciudadano comunitario, donde personas podrán ir a adoptar un árbol o solicitar árboles para campaña de reforestación de manera gratuita con plan de manejo y ficha de características de la especie",
  },
  {
    id: "escudo",
    nombre: "Escudo Costero",
    ubicacion: "Playa Linda",
    coordenadas: [14.6743010, -92.3819987],
    descripcion:
      "Proyecto que busca minimizar la llegada de residuos a nuestras playas a través de un prototipo de captura de basura, aprovechamiento y economía circular",
  },
  {
    id: "Santuario",
    nombre: "Santuario del Casquito",
    ubicacion: "Puerto Madero",
    coordenadas: [14.716784, -92.425006],
    descripcion:
      "Santuario creado para el rescate de la tortuga casquito, la reubicación y la educación ambiental.",
  },
  {
    id: "Club",
    nombre: "Club Secreto",
    ubicacion: "Playa linda ",
    coordenadas: [14.6743010, -92.3819987],
    descripcion:
      "Programa de limpieza de playas con ciudadanía, buscando visibilizar la problemática de contaminación de nuestras playas a través de la participación ciudadana y la educación ambiental",
  },
  {
    id: "Cuerdas",
    nombre: "Cuerdas Micelizadas",
    ubicacion: "Tuxtla Gutierrez",
    coordenadas: [16.7528, -93.1156],
    descripcion:
      "Programa de talleres, pláticas y materiales didácticos para fortalecer la cultura ambiental en niñas, niños y docentes.",
  },
  {
    id: "Rave",
    nombre: "Rave forestación",
    ubicacion: "Tapachula",
    coordenadas: [14.9038, -92.2630],
    descripcion:
      "Evento de reforestación con evento musical, para promover la participación ciudadana y la multiculturalidad a través del arte, la convivencia y la amistad",
  },
  
];
const Objetivos = () => {
  const sectionRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(
    proyectosActivos[0].id,
  );
  const selectedProject = proyectosActivos.find(
    (proyecto) => proyecto.id === selectedProjectId,
  );
  useEffect(() => {
    const section = sectionRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!section || reduceMotion) return undefined;
    let animationFrame;
    const updateParallax = () => {
      const rect = section.getBoundingClientRect();
      const visibleProgress =
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const progress = Math.max(0, Math.min(1, visibleProgress));
      const offset = (progress - 0.5) * 500;
      section.style.setProperty("--parallax-lateral-y", `${offset * 0.48}px`);
      section.style.setProperty(
        "--parallax-arbusto-superior-y",
        `${offset * 0.72}px`,
      );
      section.style.setProperty(
        "--parallax-arbusto-inferior-y",
        `${offset * -0.58}px`,
      );
      animationFrame = undefined;
    };
    const handleScroll = () => {
      if (!animationFrame)
        animationFrame = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return undefined;
    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([16.7569, -92.6298], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    setIsMapReady(true);
    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerLayerRef.current = null;
      setIsMapReady(false);
    };
  }, []);
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markerLayerRef.current)
      return;
    const map = mapInstanceRef.current;
    const markerLayer = markerLayerRef.current;
    markerLayer.clearLayers();
    proyectosActivos.forEach((proyecto) => {
      const isSelected = proyecto.id === selectedProjectId;
      L.circleMarker(proyecto.coordenadas, {
        color: "#3d5021",
        fillColor: isSelected ? "#3d5021" : "#7f9544",
        fillOpacity: isSelected ? 1 : 0.82,
        radius: isSelected ? 11 : 8,
        weight: isSelected ? 4 : 2,
      })
        .addTo(markerLayer)
        .bindPopup(proyecto.nombre)
        .on("click", () => setSelectedProjectId(proyecto.id));
    });
    if (selectedProject) {
      map.flyTo(selectedProject.coordenadas, 12, {
        duration: 0.65,
      });
    }
  }, [isMapReady, selectedProject, selectedProjectId]);
  return (
    <section ref={sectionRef} id="features" className={styles.objetivosSection}>
      <img
        loading="lazy"
        decoding="async"
        className={styles.objetivosImagenLateral}
        src={sidelateral}
        alt=""
        aria-hidden="true"
      />
      <img
        loading="lazy"
        decoding="async"
        className={cx(styles.objetivosArbusto, styles.objetivosArbustoSuperior)}
        src={arbusto}
        alt=""
        aria-hidden="true"
      />
      <img
        loading="lazy"
        decoding="async"
        className={cx(styles.objetivosArbusto, styles.objetivosArbustoInferior)}
        src={arbusto}
        alt=""
        aria-hidden="true"
      />
      <div className={styles.objetivosContainer}>
        <div className={styles.objetivosContent}>
          <h2>
            Nuestros
            <span>Proyectos</span>
          </h2>

          <div className={styles.proyectosActivos}>
            <div className={styles.proyectosActivosTitulo}>
              <img
                loading="lazy"
                decoding="async"
                src={hoja1}
                alt=""
                aria-hidden="true"
              />
              <h3>Proyectos Activos</h3>
            </div>
            <ul>
              {proyectosActivos.map((proyecto) => (
                <li key={proyecto.id}>
                  <button
                    className={
                      proyecto.id === selectedProjectId ? styles.active : ""
                    }
                    type="button"
                    onClick={() => setSelectedProjectId(proyecto.id)}
                  >
                    {proyecto.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.objetivosSide}>
          <div className={styles.objetivosMapCard}>
            <div
              ref={mapRef}
              className={styles.objetivosMap}
              aria-label="Mapa de Chiapas"
            ></div>
          </div>

          {selectedProject && (
            <div className={styles.proyectoDetalles}>
              <div className={styles.proyectoDetallesTitulo}>
                <img
                  loading="lazy"
                  decoding="async"
                  src={hoja2}
                  alt=""
                  aria-hidden="true"
                />
                <h3>Detalles del proyecto</h3>
              </div>
              <strong>{selectedProject.nombre}</strong>
              <span>{selectedProject.ubicacion}, Chiapas</span>
              <h4>Descripción</h4>
              <p>{selectedProject.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
export default Objetivos;
