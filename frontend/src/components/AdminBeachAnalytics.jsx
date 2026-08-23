import {useEffect,useMemo,useState} from 'react'
import * as api from '../services/authApi'
import styles from './AdminBeachAnalytics.module.css'

const transportLabels={
 'necesita-transporte':'Necesita transporte',
 'cuenta-con-vehiculo':'Cuenta con vehículo'
}

const fullName=item=>[item.firstName,item.middleName,item.lastName,item.secondLastName].filter(Boolean).join(' ')
const ageOf=value=>{
 const birth=new Date(`${String(value).slice(0,10)}T00:00:00Z`)
 const today=new Date()
 let age=today.getUTCFullYear()-birth.getUTCFullYear()
 if(today.getUTCMonth()<birth.getUTCMonth()||(today.getUTCMonth()===birth.getUTCMonth()&&today.getUTCDate()<birth.getUTCDate()))age--
 return Number.isFinite(age)?age:0
}

export default function AdminBeachAnalytics({onBack,onCountChange}){
 const[items,setItems]=useState([]),[events,setEvents]=useState([]),[selectedEventId,setSelectedEventId]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState(''),[transport,setTransport]=useState('all'),[newEventName,setNewEventName]=useState(''),[updating,setUpdating]=useState(false)
 const selectedEvent=events.find(event=>event.id===selectedEventId)
 const loadEvents=async(preferredId)=>{const r=await api.listBeachEvents(),next=r.events||[];setEvents(next);onCountChange?.(next.reduce((sum,event)=>sum+event.registrations,0));setSelectedEventId(current=>preferredId||current||next.find(event=>event.status==='abierto')?.id||next[0]?.id||'');return next}
 useEffect(()=>{api.listBeachEvents().then(r=>{const next=r.events||[];setEvents(next);onCountChange?.(next.reduce((sum,event)=>sum+event.registrations,0));setSelectedEventId(next.find(event=>event.status==='abierto')?.id||next[0]?.id||'');if(!next.length)setLoading(false)}).catch(e=>{setError(e.message);setLoading(false)})},[onCountChange])
 useEffect(()=>{if(!selectedEventId)return;api.listBeachRegistrations(selectedEventId).then(r=>setItems(r.registrations||[])).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[selectedEventId])
 const startEvent=async event=>{event.preventDefault();if(!confirm('Se cerrará cualquier jornada abierta y comenzará un registro nuevo. ¿Continuar?'))return;setUpdating(true);setError('');try{const r=await api.createBeachEvent(newEventName.trim());setNewEventName('');await loadEvents(r.event.id)}catch(e){setError(e.message)}finally{setUpdating(false)}}
 const toggleEvent=async()=>{if(!selectedEvent)return;const next=selectedEvent.status==='abierto'?'cerrado':'abierto';if(!confirm(next==='cerrado'?'Al cerrar la jornada desaparecerá el enlace de registro del hero. ¿Continuar?':'Al abrir esta jornada se cerrará cualquier otra jornada activa. ¿Continuar?'))return;setUpdating(true);setError('');try{await api.setBeachEventStatus(selectedEvent.id,next);await loadEvents(selectedEvent.id)}catch(e){setError(e.message)}finally{setUpdating(false)}}

 const analytics=useMemo(()=>{
  const needs=items.filter(item=>item.transport==='necesita-transporte').length
  const vehicle=items.filter(item=>item.transport==='cuenta-con-vehiculo').length
  const ages=items.map(item=>ageOf(item.birthDate))
  const ageGroups=[['Menores de 18',0,17],['18 a 29',18,29],['30 a 44',30,44],['45 a 59',45,59],['60 o más',60,200]].map(([label,min,max])=>({label,count:ages.filter(age=>age>=min&&age<=max).length}))
  const countries=Object.entries(items.reduce((acc,item)=>{const country=item.phoneCountry||'Sin especificar';acc[country]=(acc[country]||0)+1;return acc},{})).sort((a,b)=>b[1]-a[1])
  const days=Array.from({length:7},(_,index)=>{const date=new Date();date.setHours(0,0,0,0);date.setDate(date.getDate()-(6-index));const key=date.toLocaleDateString('en-CA');return{key,label:date.toLocaleDateString('es-MX',{weekday:'short',day:'numeric'}),count:items.filter(item=>String(item.createdAt).slice(0,10)===key).length}})
  return{needs,vehicle,averageAge:ages.length?Math.round(ages.reduce((sum,age)=>sum+age,0)/ages.length):0,ageGroups,countries,days}
 },[items])

 const filtered=useMemo(()=>items.filter(item=>{
  const matchesTransport=transport==='all'||item.transport===transport
  const haystack=`${fullName(item)} ${item.email} ${item.phone} ${item.phoneCountry}`.toLocaleLowerCase('es')
  return matchesTransport&&haystack.includes(query.trim().toLocaleLowerCase('es'))
 }).sort((a,b)=>(a.transport==='necesita-transporte'?0:1)-(b.transport==='necesita-transporte'?0:1)||fullName(a).localeCompare(fullName(b),'es')),[items,query,transport])
 const maximum=Math.max(...analytics.days.map(day=>day.count),1)
 const ageMaximum=Math.max(...analytics.ageGroups.map(group=>group.count),1)

 return <section className={styles.analytics}>
  <div className={styles.printHeader}><img src="/logo.png" alt="MICE-LO"/><div><p>Participación comunitaria</p><h1>{selectedEvent?.name||'Registro de limpieza de playas'}</h1><span>Lista operativa de participantes</span></div></div>
  <header className={styles.header}><div><p>Análisis de participación</p><h1>Detalles de registro de playas</h1><span>Información operativa para organizar la asistencia y el transporte.</span></div><div className={`${styles.headerActions} ${styles.noPrint}`}><button className={styles.secondary} onClick={onBack}>Volver al resumen</button><button onClick={()=>window.print()}>Imprimir lista</button></div></header>
  {error&&<p className={styles.error}>{error}</p>}
  <section className={`${styles.eventManager} ${styles.noPrint}`}><div><p>Jornadas de limpieza</p><h2>Administrar registros</h2><span>Consulta jornadas anteriores, cierra el registro actual o inicia uno nuevo.</span></div><div className={styles.eventActions}><label>Jornada<select value={selectedEventId} onChange={e=>{setLoading(true);setSelectedEventId(e.target.value)}}>{events.map(event=><option value={event.id} key={event.id}>#{event.number} · {event.name} · {event.status==='abierto'?'Abierta':'Cerrada'} ({event.registrations})</option>)}</select></label>{selectedEvent&&<button className={selectedEvent.status==='abierto'?styles.closeButton:styles.openButton} disabled={updating} onClick={toggleEvent}>{selectedEvent.status==='abierto'?'Cerrar registro':'Abrir nuevamente'}</button>}</div><form onSubmit={startEvent}><input value={newEventName} onChange={e=>setNewEventName(e.target.value)} placeholder="Nombre de la próxima limpieza (opcional)"/><button disabled={updating}>{updating?'Actualizando…':'Iniciar nuevo registro'}</button></form><small>Solo puede existir una jornada abierta. Los datos históricos nunca se eliminan.</small></section>
  {loading?<p className={styles.loading}>Cargando análisis de registros…</p>:<>
   {selectedEvent&&<div className={styles.eventBanner}><div><span>Jornada #{selectedEvent.number}</span><strong>{selectedEvent.name}</strong></div><b className={selectedEvent.status==='abierto'?styles.openStatus:styles.closedStatus}>{selectedEvent.status==='abierto'?'Registro abierto':'Registro cerrado'}</b></div>}
   <div className={styles.metrics}>
    <article><span>Personas que acudirán</span><strong>{items.length}</strong><small>Total de registros</small></article>
    <article className={styles.transportMetric}><span>Necesitan transporte</span><strong>{analytics.needs}</strong><small>{items.length?Math.round(analytics.needs/items.length*100):0}% de participantes</small></article>
    <article><span>Cuentan con vehículo</span><strong>{analytics.vehicle}</strong><small>{items.length?Math.round(analytics.vehicle/items.length*100):0}% de participantes</small></article>
    <article><span>Edad promedio</span><strong>{analytics.averageAge}</strong><small>años</small></article>
   </div>

   <div className={styles.analysisGrid}>
    <article className={styles.chartCard}><div><h2>Registros de los últimos 7 días</h2><span>Tendencia diaria de participación</span></div><div className={styles.verticalChart}>{analytics.days.map(day=><div key={day.key} className={styles.day}><b>{day.count}</b><i style={{height:`${Math.max(day.count/maximum*100,4)}%`}}/><span>{day.label}</span></div>)}</div></article>
    <article className={styles.chartCard}><div><h2>Distribución por edad</h2><span>Perfil general de asistentes</span></div><div className={styles.horizontalChart}>{analytics.ageGroups.map(group=><div key={group.label}><span>{group.label}</span><i><b style={{width:`${group.count/ageMaximum*100}%`}}/></i><strong>{group.count}</strong></div>)}</div></article>
    <article className={styles.chartCard}><div><h2>País telefónico</h2><span>Principales ubicaciones declaradas</span></div><div className={styles.countries}>{analytics.countries.slice(0,6).map(([country,count])=><div key={country}><span>{country}</span><strong>{count}</strong></div>)}{!analytics.countries.length&&<p>Sin datos todavía.</p>}</div></article>
   </div>

   <section className={styles.listSection}>
    <div className={styles.listHeading}><div><p>Lista operativa</p><h2>Participantes</h2><span>{filtered.length} de {items.length} registros · quienes necesitan transporte aparecen primero</span></div><div className={`${styles.filters} ${styles.noPrint}`}><input aria-label="Buscar participante" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar nombre, correo o teléfono"/><select aria-label="Filtrar por transporte" value={transport} onChange={e=>setTransport(e.target.value)}><option value="all">Todo el transporte</option><option value="necesita-transporte">Necesita transporte</option><option value="cuenta-con-vehiculo">Cuenta con vehículo</option></select></div></div>
    <p className={styles.printMeta}>{selectedEvent?.name} · Lista generada el {new Date().toLocaleString('es-MX')} · Filtro: {transport==='all'?'Todos':transportLabels[transport]}</p>
    <div className={styles.tableWrap}><table><thead><tr><th>#</th><th>Participante</th><th>Edad</th><th>Contacto</th><th>Transporte</th><th>Registro</th></tr></thead><tbody>{filtered.map((item,index)=><tr key={item.id}><td>{index+1}</td><td><strong>{fullName(item)}</strong><span>{item.email}</span></td><td>{ageOf(item.birthDate)} años</td><td><strong>{item.callingCode} {item.phone}</strong><span>{item.phoneCountry}</span></td><td><b className={item.transport==='necesita-transporte'?styles.needs:styles.vehicle}>{transportLabels[item.transport]||'Sin especificar'}</b></td><td>{new Date(item.createdAt).toLocaleDateString('es-MX')}</td></tr>)}</tbody></table>{!filtered.length&&<p className={styles.empty}>No hay participantes que coincidan con los filtros.</p>}</div>
   </section>
   <footer className={styles.printFooter}><span>MICE-LO · Chiapas por el Clima</span><strong>www.micelo.org</strong></footer>
  </>}
 </section>
}
