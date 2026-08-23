const map=(r)=>({id:r.id,name:r.nombre,createdAt:r.creada_en});
async function list(c){return (await c.query('SELECT * FROM categorias_convocatorias ORDER BY nombre')).rows.map(map)}
async function exists(c,name){return (await c.query('SELECT 1 FROM categorias_convocatorias WHERE nombre=$1',[name])).rowCount>0}
async function create(c,name){return map((await c.query('INSERT INTO categorias_convocatorias(nombre) VALUES($1) RETURNING *',[name])).rows[0])}
async function usage(c,name){return Number((await c.query('SELECT COUNT(*) FROM convocatorias WHERE categoria=$1',[name])).rows[0].count)}
async function remove(c,id){return (await c.query('DELETE FROM categorias_convocatorias WHERE id=$1 RETURNING id',[id])).rowCount>0}
module.exports={create,exists,list,remove,usage};
