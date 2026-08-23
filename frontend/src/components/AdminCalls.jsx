import {useEffect,useState} from 'react'
import * as api from '../services/authApi'
import styles from './AdminCalls.module.css'
import DescriptionEditor from './DescriptionEditor'
const serialize=(file)=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)})
export default function AdminCalls(){
 const[categories,setCategories]=useState([]),[msg,setMsg]=useState(''),[type,setType]=useState('interna'),[images,setImages]=useState([]),[principal,setPrincipal]=useState(0),[publishing,setPublishing]=useState(false)
 useEffect(()=>{api.listCallCategories().then(k=>setCategories(k.categories)).catch(e=>setMsg(e.message))},[])
 const chooseImages=e=>{const files=[...e.target.files];e.target.value='';if(files.some(file=>file.size>3*1024*1024))return setMsg('Cada imagen debe pesar máximo 3 MB.');const existing=new Set(images.map(({file})=>`${file.name}-${file.size}-${file.lastModified}`)),fresh=files.filter(file=>!existing.has(`${file.name}-${file.size}-${file.lastModified}`));if(images.length+fresh.length>6)return setMsg('Puedes subir máximo 6 imágenes en total.');setImages(current=>[...current,...fresh.map(file=>({file,preview:URL.createObjectURL(file)}))]);setMsg(fresh.length?'':'Las imágenes seleccionadas ya estaban agregadas.')}
 const removeImage=index=>{setImages(current=>current.filter((_,itemIndex)=>itemIndex!==index));setPrincipal(current=>current===index?0:current>index?current-1:current)}
 const submit=async e=>{e.preventDefault();if(!images.length)return setMsg('Agrega al menos una imagen.');const f=e.currentTarget;setPublishing(true);try{const serialized=await Promise.all(images.map(item=>serialize(item.file))),p={titulo:f.titulo.value,descripcion:f.descripcion.value,categoria:f.categoria.value,tipo:type,enlaceExterno:type==='externa'?f.enlaceExterno.value:null,imagen:serialized[principal],imagenes:serialized,imagenPrincipal:principal,correo:null,whatsapp:null,facebook:null,instagram:null,x:null,tiktok:null,youtube:null,linkedin:null};await api.createCall(p);f.reset();setImages([]);setPrincipal(0);setType('interna');setMsg('Convocatoria publicada. Puedes administrarla desde la pestaña Convocatorias.')}catch(error){setMsg(error.message)}finally{setPublishing(false)}}
 return <section className={styles.wrapper}><h2>Crear convocatoria</h2><p>Los contactos y redes pertenecen únicamente a esta convocatoria. Puedes escribir la URL completa siguiendo los ejemplos.</p>{msg&&<p className={styles.message} role="status">{msg}</p>}<form className={styles.form} onSubmit={submit}>
  <label>Título<input name="titulo" placeholder="Ej. Voluntariado de restauración" minLength="3" maxLength="140" required/></label>
  <label>Categoría<select name="categoria" required defaultValue=""><option value="" disabled>Selecciona una categoría de convocatoria</option>{categories.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></label>
  <label>Tipo de convocatoria<select name="tipo" value={type} onChange={e=>setType(e.target.value)}><option value="interna">Interna — postulación en MICE-LO</option><option value="externa">Externa — dirige a otro sitio</option></select></label>
  {type==='externa'&&<label>Enlace de postulación externa<input name="enlaceExterno" type="url" placeholder="Ej. https://organizacion.org/convocatoria" required/></label>}
  <label className={styles.full}>Descripción con formato<DescriptionEditor/></label>
  <label className={styles.full}>Imágenes del carrusel (1 a 6)<input name="imagenes" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={chooseImages} required={!images.length}/></label>
  {images.length>0&&<div className={`${styles.full} ${styles.previews}`}>{images.map((item,index)=><label className={principal===index?styles.selected:''} key={item.preview}><img src={item.preview} alt={`Vista previa ${index+1}`}/><span><input type="radio" name="principal" checked={principal===index} onChange={()=>setPrincipal(index)}/> Imagen principal</span><button type="button" onClick={()=>removeImage(index)}>Quitar</button></label>)}</div>}
  <button className={styles.full} disabled={publishing}>{publishing?'Publicando…':'Publicar convocatoria'}</button>
 </form></section>
}
