import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import hoja1 from '../assets/objects/hoja1.jpg'
import hoja2 from '../assets/objects/hoja2.jpg'
import sidelateral from '../assets/objects/sidelateral.jpg'
import arbusto from '../assets/objects/arbusto.jpg'
import styles from './Proyectos.module.css'

const cx = (...classNames) => classNames.filter(Boolean).join(' ')

const proyectosActivos = [
  {
    id: 'suelos-vivos',
    nombre: 'Regeneración de suelos vivos',
    ubicacion: 'Comitán de Domínguez',
    coordenadas: [16.2516, -92.1343],
    descripcion:
      'Proyecto enfocado en restaurar la fertilidad del suelo mediante compostaje, cobertura vegetal y prácticas agroecológicas con productores locales.',
  },
  {
    id: 'jardines-polinizadores',
    nombre: 'Restauración de jardines polinizadores',
    ubicacion: 'San Cristóbal de las Casas',
    coordenadas: [16.737, -92.6376],
    descripcion:
      'Creación de corredores florales con especies nativas para fortalecer la presencia de abejas, mariposas y otros polinizadores urbanos.',
  },
  {
    id: 'aulas-verdes',
    nombre: 'Aulas verdes comunitarias',
    ubicacion: 'Tuxtla Gutiérrez',
    coordenadas: [16.7531, -93.1156],
    descripcion:
      'Espacios educativos al aire libre para que escuelas y comunidades aprendan sobre biodiversidad, huertos y restauración ecológica.',
  },
  {
    id: 'biodiversidad-urbana',
    nombre: 'Monitoreo de biodiversidad urbana',
    ubicacion: 'Chiapa de Corzo',
    coordenadas: [16.7077, -93.0168],
    descripcion:
      'Registro participativo de aves, insectos y flora urbana para generar datos locales que orienten acciones de conservación.',
  },
  {
    id: 'bioinsumos',
    nombre: 'Bioinsumos para agricultura sostenible',
    ubicacion: 'Tapachula',
    coordenadas: [14.9056, -92.2634],
    descripcion:
      'Desarrollo y validación de bioinsumos para mejorar la salud del suelo y reducir el uso de productos de alto impacto ambiental.',
  },
  {
    id: 'educacion-ambiental',
    nombre: 'Educación ambiental para escuelas',
    ubicacion: 'Palenque',
    coordenadas: [17.509, -91.9825],
    descripcion:
      'Programa de talleres, pláticas y materiales didácticos para fortalecer la cultura ambiental en niñas, niños y docentes.',
  },
  {
    id: 'laboratorio-ecologico',
    nombre: 'Laboratorio de innovación ecológica',
    ubicacion: 'Ocosingo',
    coordenadas: [16.9064, -92.0937],
    descripcion:
      'Laboratorio de prototipos y soluciones basadas en naturaleza para resolver retos de agua, suelo y restauración comunitaria.',
  },
  {
    id: 'alianzas-ambientales',
    nombre: 'Alianzas de responsabilidad ambiental',
    ubicacion: 'Tonalá',
    coordenadas: [16.0898, -93.7548],
    descripcion:
      'Vinculación con empresas e instituciones para diseñar acciones de responsabilidad ambiental con impacto territorial medible.',
  },
  {
    id: 'restauracion-participativa',
    nombre: 'Restauración participativa de ecosistemas',
    ubicacion: 'Villaflores',
    coordenadas: [16.2341, -93.2707],
    descripcion:
      'Procesos comunitarios de restauración ecológica que integran diagnóstico local, reforestación estratégica y seguimiento ciudadano.',
  },
]

const Objetivos = () => {
  const sectionRef = useRef(null)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerLayerRef = useRef(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(proyectosActivos[0].id)
  const selectedProject = proyectosActivos.find((proyecto) => proyecto.id === selectedProjectId)

  useEffect(() => {
    const section = sectionRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!section || reduceMotion) return undefined

    let animationFrame

    const updateParallax = () => {
      const rect = section.getBoundingClientRect()
      const visibleProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      const progress = Math.max(0, Math.min(1, visibleProgress))
      const offset = (progress - 0.5) * 500

      section.style.setProperty('--parallax-lateral-y', `${offset * 0.48}px`)
      section.style.setProperty('--parallax-arbusto-superior-y', `${offset * 0.72}px`)
      section.style.setProperty('--parallax-arbusto-inferior-y', `${offset * -0.58}px`)
      animationFrame = undefined
    }

    const handleScroll = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateParallax)
    }

    updateParallax()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return undefined

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([16.7569, -92.6298], 7)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    markerLayerRef.current = L.layerGroup().addTo(map)
    mapInstanceRef.current = map
    setIsMapReady(true)

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markerLayerRef.current = null
      setIsMapReady(false)
    }
  }, [])

  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markerLayerRef.current) return

    const map = mapInstanceRef.current
    const markerLayer = markerLayerRef.current
    markerLayer.clearLayers()

    proyectosActivos.forEach((proyecto) => {
      const isSelected = proyecto.id === selectedProjectId

      L.circleMarker(proyecto.coordenadas, {
        color: '#3d5021',
        fillColor: isSelected ? '#3d5021' : '#7f9544',
        fillOpacity: isSelected ? 1 : 0.82,
        radius: isSelected ? 11 : 8,
        weight: isSelected ? 4 : 2,
      })
        .addTo(markerLayer)
        .bindPopup(proyecto.nombre)
        .on('click', () => setSelectedProjectId(proyecto.id))
    })

    if (selectedProject) {
      map.flyTo(selectedProject.coordenadas, 12, { duration: 0.65 })
    }
  }, [isMapReady, selectedProject, selectedProjectId])

  return (
    <section ref={sectionRef} id="features" className={styles.objetivosSection}>
      <img
        className={styles.objetivosImagenLateral}
        src={sidelateral}
        alt=""
        aria-hidden="true"
      />
      <img
        className={cx(styles.objetivosArbusto, styles.objetivosArbustoSuperior)}
        src={arbusto}
        alt=""
        aria-hidden="true"
      />
      <img
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
              <img src={hoja1} alt="" aria-hidden="true" />
              <h3>Proyectos Activos</h3>
            </div>
            <ul>
              {proyectosActivos.map((proyecto) => (
                <li key={proyecto.id}>
                  <button
                    className={proyecto.id === selectedProjectId ? styles.active : ''}
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
            <div ref={mapRef} className={styles.objetivosMap} aria-label="Mapa de Chiapas"></div>
          </div>

          {selectedProject && (
            <div className={styles.proyectoDetalles}>
              <div className={styles.proyectoDetallesTitulo}>
                <img src={hoja2} alt="" aria-hidden="true" />
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
  )
}

export default Objetivos
