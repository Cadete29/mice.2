async function list(c){return (await c.query('SELECT id,nombre,creada_en FROM categorias ORDER BY nombre')).rows.map(r=>({id:r.id,name:r.nombre,createdAt:r.creada_en}))}
async function exists(c,name){return (await c.query('SELECT 1 FROM categorias WHERE nombre=$1',[name])).rowCount>0}
async function create(c,name){const r=await c.query('INSERT INTO categorias(nombre) VALUES($1) RETURNING id,nombre,creada_en',[name]);return{id:r.rows[0].id,name:r.rows[0].nombre,createdAt:r.rows[0].creada_en}}
async function usage(c,name){const r=await c.query('SELECT COUNT(*)::int total FROM proyectos WHERE categoria=$1',[name]);return r.rows[0].total}
async function remove(c,id){return (await c.query('DELETE FROM categorias WHERE id=$1 RETURNING id',[id])).rowCount>0}
module.exports={create,exists,list,remove,usage};
