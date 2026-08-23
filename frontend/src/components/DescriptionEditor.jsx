import {useRef} from 'react'
import styles from './DescriptionEditor.module.css'

export default function DescriptionEditor({defaultValue='',required=true}){
 const ref=useRef(null)
 const insert=(before,after=before,placeholder='texto')=>{const field=ref.current,start=field.selectionStart,end=field.selectionEnd,selected=field.value.slice(start,end)||placeholder;field.setRangeText(`${before}${selected}${after}`,start,end,'end');field.focus()}
 const line=(prefix)=>{const field=ref.current,start=field.selectionStart,lineStart=field.value.lastIndexOf('\n',start-1)+1;field.setRangeText(prefix,lineStart,lineStart,'end');field.focus()}
 return <div className={styles.editor}><div className={styles.toolbar} aria-label="Formato de descripción"><button type="button" onClick={()=>line('## ')}>Título</button><button type="button" onClick={()=>insert('**','**','texto en negritas')}><strong>Negrita</strong></button><button type="button" onClick={()=>insert('*','*','texto en cursiva')}><em>Cursiva</em></button><button type="button" onClick={()=>line('- ')}>Lista</button></div><textarea ref={ref} name="descripcion" defaultValue={defaultValue} placeholder={'Presentación de la convocatoria\n\n## Requisitos\n- Primer requisito\n- Segundo requisito'} minLength="20" maxLength="5000" rows="10" required={required}/><small>Usa los botones para organizar la descripción, los requisitos, las fechas y cualquier información adicional.</small></div>
}
