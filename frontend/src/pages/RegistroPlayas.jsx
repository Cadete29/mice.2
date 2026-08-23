import { useEffect, useRef, useState } from 'react'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js'
import flags from 'react-phone-number-input/flags'
import styles from './RegistroPlayas.module.css'
import playaLimpia from '../assets/limpieza de playas/playalim.jpeg'
import playaLimpia2 from '../assets/limpieza de playas/playalim2.jpeg'
import playaLimpia3 from '../assets/limpieza de playas/playalim3.jpeg'
import playaLimpia4 from '../assets/limpieza de playas/playalim4.jpeg'
import { createBeachRegistration, getActiveBeachEvent } from '../services/authApi'

const beachImages = [playaLimpia, playaLimpia2, playaLimpia3, playaLimpia4]
const today = new Date().toISOString().split('T')[0]
const countryNames = new Intl.DisplayNames(['es'], { type: 'region' })
const countries = getCountries()
  .map((countryCode) => ({
    countryCode,
    name: countryNames.of(countryCode),
    callingCode: getCountryCallingCode(countryCode),
  }))
  .sort((countryA, countryB) => countryA.name.localeCompare(countryB.name, 'es'))
const normalizeSearch = (text) => text
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()

const CountryCallingCodeSelect = () => {
  const [country, setCountry] = useState('MX')
  const [search, setSearch] = useState('')
  const detailsRef = useRef(null)
  const searchRef = useRef(null)
  const SelectedFlag = flags[country]
  const normalizedSearch = normalizeSearch(search.trim())
  const filteredCountries = normalizedSearch
    ? countries.filter(({ name, callingCode }) => (
      normalizeSearch(name).includes(normalizedSearch)
      || callingCode.includes(normalizedSearch.replace('+', ''))
    ))
    : countries

  const selectCountry = (countryCode) => {
    setCountry(countryCode)
    setSearch('')
    detailsRef.current.open = false
  }

  const handleToggle = (event) => {
    if (event.currentTarget.open) {
      window.requestAnimationFrame(() => searchRef.current?.focus())
    }
  }

  return (
    <details className={styles.countrySelect} ref={detailsRef} onToggle={handleToggle}>
      <summary aria-label="Seleccionar país y lada internacional">
        <SelectedFlag title={country} />
        <span>+{getCountryCallingCode(country)}</span>
      </summary>
      <div className={styles.countryOptions} role="listbox" aria-label="Ladas internacionales">
        <div className={styles.countrySearch}>
          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar país o lada"
            aria-label="Buscar país o lada"
          />
        </div>
        {filteredCountries.map(({ countryCode, name, callingCode }) => {
          const Flag = flags[countryCode]

          return (
            <button
              key={countryCode}
              type="button"
              role="option"
              aria-label={`${name}, lada +${callingCode}`}
              aria-selected={country === countryCode}
              onClick={() => selectCountry(countryCode)}
            >
              <Flag title={countryCode} />
              <span className={styles.countryName}>{name}</span>
              <span className={styles.callingCode}>+{callingCode}</span>
            </button>
          )
        })}
        {filteredCountries.length === 0 && (
          <p className={styles.noCountries}>No se encontraron resultados.</p>
        )}
      </div>
      <input type="hidden" name="lada" value={`+${getCountryCallingCode(country)}`} />
      <input type="hidden" name="paisTelefono" value={country} />
    </details>
  )
}

const RegistroPlayas = () => {
  const [activeImage, setActiveImage] = useState(0)
  const [status, setStatus] = useState({type:'',message:''})
  const [sending, setSending] = useState(false)
  const [activeEvent, setActiveEvent] = useState(undefined)

  useEffect(() => {
    getActiveBeachEvent().then(({event})=>setActiveEvent(event)).catch(()=>setActiveEvent(null))
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % beachImages.length)
    }, 2000)

    return () => window.clearInterval(interval)
  }, [])

  const submit=async event=>{event.preventDefault();const form=event.currentTarget,data=Object.fromEntries(new FormData(form).entries());data.telefono=data.telefono.replace(/\D/g,'');data.usoImagen=true;data.privacidad=true;data.deslindeResponsabilidad=true;setSending(true);setStatus({type:'',message:''});try{const response=await createBeachRegistration(data);form.reset();setStatus({type:'success',message:response.message})}catch(error){setStatus({type:'error',message:error.message||'No fue posible enviar tu registro.'})}finally{setSending(false)}}

  return (
    <main className={styles.page}>
    <section className={styles.hero} aria-labelledby="playas-title">
      <div>
        <p>Acción comunitaria</p>
        <h1 id="playas-title">{activeEvent?.name||'Registro de Limpieza de Playas'}</h1>
        <span>
          Súmate a una jornada de limpieza y ayúdanos a recuperar las playas de Chiapas.
          Registra tus datos para coordinar tu participación.
        </span>
      </div>
    </section>

    {activeEvent===undefined?<p className={styles.closedNotice}>Consultando disponibilidad del registro…</p>:activeEvent===null?<section className={styles.closedNotice}><h2>El registro está cerrado</h2><p>En este momento no hay una jornada de limpieza de playas abierta. El formulario volverá a estar disponible cuando se publique la siguiente jornada.</p><a href="/">Volver al inicio</a></section>:<section className={styles.formSection} aria-labelledby="registro-title">
      <div className={styles.imagePanel} aria-live="polite">
        <img
          key={activeImage}
          src={beachImages[activeImage]}
          alt={`Jornada de limpieza de playa ${activeImage + 1}`}
        />
      </div>

      <div className={styles.registrationContent}>
        <div className={styles.formIntro}>
        <p>Participa con nosotros</p>
        <h2 id="registro-title">Datos de registro</h2>
        <span>
          Completa el formulario. El equipo organizador se pondrá en contacto contigo para
          compartir el punto de encuentro, horario y recomendaciones de la jornada.
        </span>
        <ul>
          <li>Lleva ropa cómoda y protección solar.</li>
          <li>Usa calzado cerrado y lleva agua reutilizable.</li>
          <li>Menores de edad deben asistir con una persona adulta.</li>
        </ul>
        </div>

        <form className={styles.form} onSubmit={submit}>
        <div className={styles.fieldRow}>
          <label>
            Primer nombre
            <input name="primerNombre" type="text" autoComplete="given-name" required />
          </label>
          <label>
            Segundo nombre {/* <small>(opcional)</small> */}
            <input name="segundoNombre" type="text" autoComplete="additional-name" />
          </label>
        </div>

        <div className={styles.fieldRow}>
          <label>
            Apellido paterno
            <input name="apellidoPaterno" type="text" autoComplete="family-name" required />
          </label>
          <label>
            Apellido materno
            <input name="apellidoMaterno" type="text" required />
          </label>
        </div>

        <div className={styles.fieldRow}>
          <label>
            Fecha de nacimiento
            <input name="fechaNacimiento" type="date" max={today} autoComplete="bday" required />
          </label>
          <label>
            CURP
            <input
              name="curp"
              type="text"
              minLength="18"
              maxLength="18"
              pattern="[A-Za-z]{4}[0-9]{6}[HMhm][A-Za-z]{5}[A-Za-z0-9][0-9]"
              title="Ingresa una CURP válida de 18 caracteres"
              className={styles.curpInput}
              required
            />
          </label>
        </div>

        <div className={styles.fieldRow}>
          <label>
            Teléfono
            <span className={styles.phoneField}>
              <CountryCallingCodeSelect />
              <input
                name="telefono"
                type="tel"
                autoComplete="tel-national"
                inputMode="numeric"
                placeholder="Número telefónico"
                required
              />
            </span>
          </label>
          <label>
            Correo electrónico
            <input name="email" type="email" autoComplete="email" required />
          </label>
        </div>

        <fieldset className={styles.transportField}>
          <legend>Transporte</legend>
          <label>
            <input name="transporte" type="radio" value="necesita-transporte" required />
            <span>Necesito transporte</span>
          </label>
          <label>
            <input name="transporte" type="radio" value="cuenta-con-vehiculo" required />
            <span>Cuento con vehículo</span>
          </label>
        </fieldset>

        <div className={styles.notices}>
          <label className={styles.checkField}>
            <input name="usoImagen" type="checkbox" required />
            <span>Acepto el <a href="/aviso-uso-de-imagen" target="_blank" rel="noreferrer">aviso de uso de imagen</a>.</span>
          </label>

          <label className={styles.checkField}>
            <input name="privacidad" type="checkbox" required />
            <span>Acepto el <a href="/aviso-de-privacidad" target="_blank" rel="noreferrer">aviso de privacidad</a> y el tratamiento de mis datos para coordinar la actividad.</span>
          </label>

          <label className={styles.checkField}>
            <input name="deslindeResponsabilidad" type="checkbox" required />
            <span>Acepto el <a href="/deslinde-de-responsabilidad" target="_blank" rel="noreferrer">deslinde de responsabilidad</a>.</span>
          </label>
        </div>

        <button type="submit" disabled={sending}>{sending?'Enviando…':'Enviar registro'}</button>
        {status.message&&<p className={`${styles.formStatus} ${styles[status.type]}`} role="status" aria-live="polite">{status.message}</p>}
        </form>
      </div>
    </section>}
    </main>
  )
}

export default RegistroPlayas
