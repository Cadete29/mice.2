import { useEffect, useState } from 'react'
import * as api from '../services/authApi'
import styles from './ConvocatoriaDetail.module.css'
import FormattedDescription from '../components/FormattedDescription'
import {requireAuthentication} from '../utils/requireAuthentication'

const labels = { facebook: 'Facebook', instagram: 'Instagram', x: 'X', tiktok: 'TikTok', youtube: 'YouTube', linkedin: 'LinkedIn' }
const builders = { facebook: (v) => `https://facebook.com/${v}`, instagram: (v) => `https://instagram.com/${v}`, x: (v) => `https://x.com/${v}`, tiktok: (v) => `https://tiktok.com/@${v}`, youtube: (v) => `https://youtube.com/@${v}`, linkedin: (v) => `https://linkedin.com/in/${v}` }
const socialUrl = (name, value) => /^https?:\/\//i.test(value) ? value : builders[name](value.replace(/^@/, ''))

export default function ConvocatoriaDetail({ callId }) {
  const showContact = false
  const [call, setCall] = useState(null), [selected, setSelected] = useState(''), [error, setError] = useState(''), [applying, setApplying] = useState(false), [message, setMessage] = useState('')
  useEffect(() => { api.getCall(callId).then((result) => {setCall(result.call);const gallery=result.call.gallery?.length?result.call.gallery:[{image:result.call.image}];setSelected(gallery.find(item=>item.principal)?.image||gallery[0].image)}).catch((cause) => setError(cause.message)) }, [callId])
  const apply = async () => { if(!api.hasAccessToken())return window.location.href='/sign-up';setApplying(true);setMessage('');try{await api.applyToCall(callId);setMessage('Tu postulación fue enviada al equipo administrador.')}catch(cause){if(cause.status===401){window.location.href='/sign-up';return}setMessage(cause.message)}finally{setApplying(false)} }
  if(error)return <main className={styles.page}><section className={styles.error}><h1>Convocatoria no disponible</h1><p>{error}</p><a href="/convocatorias">Volver a convocatorias</a></section></main>
  if(!call)return <main className={styles.page}><p className={styles.loading}>Cargando convocatoria…</p></main>
  const gallery=call.gallery?.length?call.gallery:[{image:call.image}]
  return <main className={styles.page}><article className={styles.call}><a className={styles.back} href="/convocatorias">← Volver a convocatorias</a><div className={styles.layout}><div><img className={styles.image} src={selected} alt={`Imagen de la convocatoria ${call.title}`}/>{gallery.length>1&&<div className={styles.thumbnails}>{gallery.map((item,index)=><button className={selected===item.image?styles.active:''} type="button" onClick={()=>setSelected(item.image)} key={item.id||index}><img src={item.image} alt={`Ver imagen ${index+1}`}/></button>)}</div>}</div><div className={styles.content}><p className={styles.category}>{call.category} · Convocatoria {call.type}</p><h1>{call.title}</h1><p className={styles.author}>Convoca: <strong>{call.author}</strong></p><FormattedDescription text={call.description}/>{showContact&&<div className={styles.contacts}>{call.email&&<a href={`mailto:${call.email}`}>Correo</a>}{call.whatsapp&&<a href={`https://wa.me/${call.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" onClick={requireAuthentication}>WhatsApp</a>}{Object.entries(call.social||{}).filter(([,value])=>value).map(([name,value])=><a href={socialUrl(name,value)} target="_blank" rel="noreferrer" onClick={requireAuthentication} key={name}>{labels[name]||name}</a>)}</div>}{call.type==='externa'?<a className={styles.apply} href={call.externalUrl} target="_blank" rel="noreferrer" onClick={requireAuthentication}>Ir al sitio de postulación</a>:<button className={styles.apply} type="button" onClick={apply} disabled={applying}>{applying?'Enviando…':'Postularme'}</button>}{message&&<p className={styles.status} role="status">{message}</p>}</div></div></article></main>
}
