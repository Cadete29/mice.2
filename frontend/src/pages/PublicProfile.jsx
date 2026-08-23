import {useEffect,useState} from 'react'
import * as api from '../services/authApi'
import ProjectCard from '../components/ProjectCard'
import styles from './PublicProfile.module.css'

const labels={facebook:'Facebook',instagram:'Instagram',x:'X',tiktok:'TikTok',youtube:'YouTube',linkedin:'LinkedIn'}
export default function PublicProfile({userId}){
 const[data,setData]=useState(null),[error,setError]=useState('')
 useEffect(()=>{api.getPublicProfile(userId).then(setData).catch(e=>setError(e.message))},[userId])
 if(error)return <main className={styles.page}><div className={styles.empty}><h1>Perfil no disponible</h1><p>{error}</p><a href="/chiapas-por-el-clima">Volver a proyectos</a></div></main>
 if(!data)return <main className={styles.page}><p className={styles.loading}>Cargando perfil…</p></main>
 const{profile,projects}=data,initials=profile.nombreCompleto.split(' ').slice(0,2).map(x=>x[0]).join('')
 return <main className={styles.page}><section className={styles.hero}><div className={styles.heroContent}><div className={styles.photo}>{profile.fotoPerfil?<img src={profile.fotoPerfil} alt={`Fotografía de ${profile.nombreCompleto}`}/>:initials}</div><div><p className={styles.eyebrow}>Perfil de la comunidad</p><h1>{profile.nombreCompleto}</h1>{profile.descripcion&&<p className={styles.intro}>{profile.descripcion}</p>}<div className={styles.social}>{profile.whatsapp&&<a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}{Object.entries(profile.social).filter(([,url])=>url).map(([name,url])=><a href={url} target="_blank" rel="noreferrer" key={name}>{labels[name]}</a>)}</div></div></div></section><section className={styles.body}><div className={styles.statements}>{profile.mision&&<article><p className={styles.eyebrow}>Propósito</p><h2>Misión</h2><p>{profile.mision}</p></article>}{profile.vision&&<article><p className={styles.eyebrow}>Futuro</p><h2>Visión</h2><p>{profile.vision}</p></article>}{profile.objetivos&&<article className={styles.objectives}><p className={styles.eyebrow}>Metas</p><h2>Objetivos</h2><p>{profile.objetivos}</p></article>}</div><div className={styles.projects}><p className={styles.eyebrow}>Iniciativas</p><h2>Proyectos publicados</h2>{projects.length?<div className={styles.grid}>{projects.map(project=><ProjectCard project={project} key={project.id}/>)}</div>:<p>Este usuario aún no ha publicado proyectos.</p>}</div></section></main>
}
