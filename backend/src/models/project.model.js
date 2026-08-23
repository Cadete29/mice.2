const emptyProfile = {
  whatsapp: null, facebook: null, instagram: null, x: null, tiktok: null, youtube: null, linkedin: null,
  mostrarWhatsapp: false, mostrarFacebook: false, mostrarInstagram: false, mostrarX: false,
  mostrarTiktok: false, mostrarYoutube: false, mostrarLinkedin: false,
};

const mapProfile = (row) => row ? ({
  whatsapp: row.whatsapp, facebook: row.facebook, instagram: row.instagram, x: row.x, tiktok: row.tiktok,
  youtube: row.youtube, linkedin: row.linkedin, mostrarWhatsapp: row.mostrar_whatsapp,
  mostrarFacebook: row.mostrar_facebook, mostrarInstagram: row.mostrar_instagram, mostrarX: row.mostrar_x,
  mostrarTiktok: row.mostrar_tiktok, mostrarYoutube: row.mostrar_youtube,
  mostrarLinkedin: row.mostrar_linkedin,
}) : emptyProfile;

const mapProject = (row) => ({
  id: row.id, title: row.titulo, description: row.descripcion, category: row.categoria,
  image: `data:${row.imagen_mime};base64,${row.imagen.toString('base64')}`,
  authorId: row.usuario_id, author: [row.nombre, row.segundo_nombre, row.apellido_paterno, row.apellido_materno].filter(Boolean).join(' '),
  email: row.correo_electronico, createdAt: row.creado_en,
  ...(row.whatsapp && row.mostrar_whatsapp ? { whatsapp: row.whatsapp } : {}),
  social: {
    ...(row.facebook && row.mostrar_facebook ? { facebook: row.facebook } : {}),
    ...(row.instagram && row.mostrar_instagram ? { instagram: row.instagram } : {}),
    ...(row.x && row.mostrar_x ? { x: row.x } : {}),
    ...(row.tiktok && row.mostrar_tiktok ? { tiktok: row.tiktok } : {}),
    ...(row.youtube && row.mostrar_youtube ? { youtube: row.youtube } : {}),
    ...(row.linkedin && row.mostrar_linkedin ? { linkedin: row.linkedin } : {}),
  },
});

const select = `SELECT p.*, u.nombre, u.segundo_nombre, u.apellido_paterno, u.apellido_materno, u.correo_electronico,
 ps.whatsapp, ps.facebook, ps.instagram, ps.x, ps.tiktok, ps.youtube, ps.linkedin,
 ps.mostrar_whatsapp, ps.mostrar_facebook, ps.mostrar_instagram, ps.mostrar_x, ps.mostrar_tiktok,
 ps.mostrar_youtube, ps.mostrar_linkedin FROM proyectos p
 JOIN usuarios u ON u.id = p.usuario_id LEFT JOIN perfiles_sociales ps ON ps.usuario_id = u.id`;

async function listPublic(client) { const r = await client.query(`${select} WHERE u.activo = TRUE ORDER BY p.creado_en DESC`); return r.rows.map(mapProject); }
async function findPublicById(client, id) { const r = await client.query(`${select} WHERE p.id = $1 AND u.activo = TRUE`, [id]); if(!r.rows[0])return null;const project=mapProject(r.rows[0]);const images=await client.query('SELECT id,imagen,imagen_mime,principal,orden FROM proyecto_imagenes WHERE proyecto_id=$1 ORDER BY orden',[id]);project.gallery=images.rows.map(row=>({id:row.id,image:`data:${row.imagen_mime};base64,${row.imagen.toString('base64')}`,principal:row.principal}));return project; }
async function findPublicAuthorProfile(client, userId) {
  const result = await client.query(`SELECT u.id,u.nombre,u.segundo_nombre,u.apellido_paterno,u.apellido_materno,u.foto_perfil,u.foto_perfil_mime,u.descripcion_perfil,u.mision,u.vision,u.objetivos,ps.facebook,ps.instagram,ps.x,ps.tiktok,ps.youtube,ps.linkedin,ps.whatsapp,ps.mostrar_facebook,ps.mostrar_instagram,ps.mostrar_x,ps.mostrar_tiktok,ps.mostrar_youtube,ps.mostrar_linkedin,ps.mostrar_whatsapp FROM usuarios u LEFT JOIN perfiles_sociales ps ON ps.usuario_id=u.id WHERE u.id=$1 AND u.activo=TRUE AND u.tipo='usuario'`, [userId]);
  const row=result.rows[0]; if(!row)return null;
  return {id:row.id,nombreCompleto:[row.nombre,row.segundo_nombre,row.apellido_paterno,row.apellido_materno].filter(Boolean).join(' '),fotoPerfil:row.foto_perfil&&row.foto_perfil_mime?`data:${row.foto_perfil_mime};base64,${row.foto_perfil.toString('base64')}`:null,descripcion:row.descripcion_perfil||'',mision:row.mision||'',vision:row.vision||'',objetivos:row.objetivos||'',whatsapp:row.mostrar_whatsapp?row.whatsapp:null,social:{facebook:row.mostrar_facebook?row.facebook:null,instagram:row.mostrar_instagram?row.instagram:null,x:row.mostrar_x?row.x:null,tiktok:row.mostrar_tiktok?row.tiktok:null,youtube:row.mostrar_youtube?row.youtube:null,linkedin:row.mostrar_linkedin?row.linkedin:null}};
}
async function listOwn(client, userId) { const r = await client.query(`${select} WHERE p.usuario_id = $1 ORDER BY p.creado_en DESC`, [userId]); return r.rows.map(mapProject); }
async function create(client, userId, input, image, gallery = [image]) {
  const r = await client.query(`INSERT INTO proyectos (usuario_id,titulo,descripcion,categoria,imagen,imagen_mime)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [userId, input.titulo, input.descripcion, input.categoria, image.buffer, image.mime]);
  for(let index=0;index<gallery.length;index+=1){const item=gallery[index];await client.query('INSERT INTO proyecto_imagenes(proyecto_id,imagen,imagen_mime,orden,principal) VALUES($1,$2,$3,$4,$5)',[r.rows[0].id,item.buffer,item.mime,index,index===(input.imagenPrincipal||0)])}
  const full = await client.query(`${select} WHERE p.id = $1`, [r.rows[0].id]); return mapProject(full.rows[0]);
}
async function remove(client, id) { return (await client.query('DELETE FROM proyectos WHERE id=$1 RETURNING id', [id])).rowCount > 0; }
async function removeOwn(client, id, userId) { return (await client.query('DELETE FROM proyectos WHERE id=$1 AND usuario_id=$2 RETURNING id', [id,userId])).rowCount > 0; }
async function updateOwn(client, id, userId, input, image, gallery = null) {
  const result = image ? await client.query('UPDATE proyectos SET titulo=$3,descripcion=$4,categoria=$5,imagen=$6,imagen_mime=$7 WHERE id=$1 AND usuario_id=$2 RETURNING id',[id,userId,input.titulo,input.descripcion,input.categoria,image.buffer,image.mime]) : await client.query('UPDATE proyectos SET titulo=$3,descripcion=$4,categoria=$5 WHERE id=$1 AND usuario_id=$2 RETURNING id',[id,userId,input.titulo,input.descripcion,input.categoria]);
  if(!result.rowCount)return null;
  if(gallery){await client.query('DELETE FROM proyecto_imagenes WHERE proyecto_id=$1',[id]);for(let index=0;index<gallery.length;index+=1){const item=gallery[index];await client.query('INSERT INTO proyecto_imagenes(proyecto_id,imagen,imagen_mime,orden,principal) VALUES($1,$2,$3,$4,$5)',[id,item.buffer,item.mime,index,index===(input.imagenPrincipal||0)])}}
  return findPublicById(client,id);
}
async function getProfile(client, userId) { return mapProfile((await client.query('SELECT * FROM perfiles_sociales WHERE usuario_id=$1', [userId])).rows[0]); }
async function saveProfile(client, userId, p) {
  const values = [p.whatsapp,p.facebook,p.instagram,p.x,p.tiktok,p.youtube,p.linkedin,p.mostrarWhatsapp,p.mostrarFacebook,p.mostrarInstagram,p.mostrarX,p.mostrarTiktok,p.mostrarYoutube,p.mostrarLinkedin];
  const r = await client.query(`INSERT INTO perfiles_sociales (usuario_id,whatsapp,facebook,instagram,x,tiktok,youtube,linkedin,mostrar_whatsapp,mostrar_facebook,mostrar_instagram,mostrar_x,mostrar_tiktok,mostrar_youtube,mostrar_linkedin)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT (usuario_id) DO UPDATE SET whatsapp=$2,facebook=$3,instagram=$4,x=$5,tiktok=$6,youtube=$7,linkedin=$8,mostrar_whatsapp=$9,mostrar_facebook=$10,mostrar_instagram=$11,mostrar_x=$12,mostrar_tiktok=$13,mostrar_youtube=$14,mostrar_linkedin=$15 RETURNING *`, [userId,...values]);
  return mapProfile(r.rows[0]);
}
module.exports = { create, findPublicAuthorProfile, findPublicById, getProfile, listOwn, listPublic, remove, removeOwn, saveProfile, updateOwn };
