const {pool,transaction}=require('../config/database');
const model=require('../models/call.model');
const email=require('../services/email.service');
const HttpError=require('../utils/http-error');
const {uuidSchema}=require('../models/call.schemas');
const categoryModel=require('../models/call-category.model');
const id=(value)=>{const r=uuidSchema.safeParse(value);if(!r.success)throw new HttpError(400,'Identificador inválido.','VALIDATION_ERROR');return r.data};
function image(data){const m=/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(data),buffer=m&&Buffer.from(m[2],'base64');if(!m||!buffer.length||buffer.length>3*1024*1024)throw new HttpError(400,'Imagen inválida o mayor a 3 MB.','INVALID_IMAGE');return{mime:m[1],buffer}}
async function list(_q,r){r.json({calls:await model.listPublic(pool)})}
async function get(q,r){const call=await model.findPublicById(pool,id(q.params.callId));if(!call)throw new HttpError(404,'Convocatoria no encontrada.','CALL_NOT_FOUND');r.json({call})}
async function adminList(_q,r){r.json({calls:await model.listAdmin(pool)})}
async function adminGet(q,r){const call=await model.findAdminById(pool,id(q.params.callId));if(!call)throw new HttpError(404,'Convocatoria no encontrada.','CALL_NOT_FOUND');r.json({call})}
async function create(q,r){if(!await categoryModel.exists(pool,q.body.categoria))throw new HttpError(400,'La categoría de convocatoria seleccionada no existe.','INVALID_CATEGORY');const gallery=(q.body.imagenes||[q.body.imagen]).map(image);if(gallery.reduce((total,item)=>total+item.buffer.length,0)>12*1024*1024)throw new HttpError(400,'La galería debe pesar máximo 12 MB.','GALLERY_TOO_LARGE');const principal=gallery[q.body.imagenPrincipal||0],call=await transaction(c=>model.create(c,q.auth.userId,q.body,principal,gallery));r.status(201).json({call})}
async function remove(q,r){if(!await model.remove(pool,id(q.params.callId)))throw new HttpError(404,'Convocatoria no encontrada.','CALL_NOT_FOUND');r.status(204).end()}
async function update(q,r){if(!await categoryModel.exists(pool,q.body.categoria))throw new HttpError(400,'La categoría de convocatoria seleccionada no existe.','INVALID_CATEGORY');const gallery=(q.body.imagenes||[q.body.imagen]).map(image);if(gallery.reduce((total,item)=>total+item.buffer.length,0)>12*1024*1024)throw new HttpError(400,'La galería debe pesar máximo 12 MB.','GALLERY_TOO_LARGE');const call=await transaction(c=>model.update(c,id(q.params.callId),q.body,gallery[q.body.imagenPrincipal||0],gallery));if(!call)throw new HttpError(404,'Convocatoria no encontrada.','CALL_NOT_FOUND');r.json({call})}
async function visibility(q,r){const call=await model.setActive(pool,id(q.params.callId),q.body.activa);if(!call)throw new HttpError(404,'Convocatoria no encontrada.','CALL_NOT_FOUND');r.json({call})}
async function apply(q,r){try{const result=await model.apply(pool,id(q.params.callId),q.auth.userId);if(result.missing)throw new HttpError(404,'Convocatoria no encontrada.','CALL_NOT_FOUND');if(result.external)throw new HttpError(409,'Esta convocatoria se gestiona en un sitio externo.','EXTERNAL_CALL');if(!result.application)throw new HttpError(409,'Ya te postulaste a esta convocatoria.','ALREADY_APPLIED');email.trySendApplicationEmail({callId:q.params.callId,...result});r.status(201).json({message:'Postulación enviada.'})}catch(error){if(error.code==='23503')throw new HttpError(404,'Convocatoria no encontrada.','CALL_NOT_FOUND');throw error}}
async function mine(q,r){r.json({applications:await model.listMine(pool,q.auth.userId)})}
async function applications(_q,r){r.json({applications:await model.listApplications(pool)})}
async function status(q,r){if(!await model.updateStatus(pool,id(q.params.applicationId),q.body.estado))throw new HttpError(404,'Postulación no encontrada.','APPLICATION_NOT_FOUND');r.json({status:q.body.estado})}
async function removeApplication(q,r){if(!await model.removeApplication(pool,id(q.params.applicationId)))throw new HttpError(404,'Postulación no encontrada.','APPLICATION_NOT_FOUND');r.status(204).end()}
module.exports={adminGet,adminList,apply,applications,create,get,list,mine,remove,removeApplication,status,update,visibility};
