const {pool}=require('../config/database');
const model=require('../models/call-category.model');
const HttpError=require('../utils/http-error');
async function list(_q,r){r.json({categories:await model.list(pool)})}
async function create(q,r){try{r.status(201).json({category:await model.create(pool,q.body.nombre)})}catch(e){if(e.code==='23505')throw new HttpError(409,'La categoría ya existe.','CATEGORY_EXISTS');throw e}}
async function remove(q,r){const items=await model.list(pool),item=items.find(x=>x.id===q.params.categoryId);if(!item)throw new HttpError(404,'Categoría no encontrada.','CATEGORY_NOT_FOUND');if(await model.usage(pool,item.name))throw new HttpError(409,'No puedes eliminar una categoría que está en uso.','CATEGORY_IN_USE');await model.remove(pool,item.id);r.status(204).end()}
module.exports={create,list,remove};
