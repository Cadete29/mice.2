const { pool, transaction } = require('../config/database');
const model = require('../models/project.model');
const email = require('../services/email.service');
const HttpError = require('../utils/http-error');
const categoryModel = require('../models/category.model');

function decodeImage(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) throw new HttpError(400, 'La imagen no es válida.', 'INVALID_IMAGE');
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > 3 * 1024 * 1024) throw new HttpError(400, 'La imagen debe pesar máximo 3 MB.', 'IMAGE_TOO_LARGE');
  const valid = match[1] === 'image/jpeg' ? buffer[0] === 0xff && buffer[1] === 0xd8
    : match[1] === 'image/png' ? buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
      : buffer.subarray(0,4).toString() === 'RIFF' && buffer.subarray(8,12).toString() === 'WEBP';
  if (!valid) throw new HttpError(400, 'El contenido de la imagen no coincide con su formato.', 'INVALID_IMAGE');
  return { mime: match[1], buffer };
}

async function listPublic(_req, res) { res.json({ projects: await model.listPublic(pool) }); }
async function getPublic(req, res) { const project = await model.findPublicById(pool, req.params.projectId); if (!project) throw new HttpError(404, 'Proyecto no encontrado.', 'PROJECT_NOT_FOUND'); res.json({ project }); }
async function getPublicAuthorProfile(req, res) { const profile = await model.findPublicAuthorProfile(pool, req.params.userId); if (!profile) throw new HttpError(404, 'Perfil no encontrado.', 'PROFILE_NOT_FOUND'); res.json({ profile, projects: await model.listOwn(pool, req.params.userId) }); }
async function listOwn(req, res) { res.json({ projects: await model.listOwn(pool, req.auth.userId) }); }
async function create(req, res) {
  if (!await categoryModel.exists(pool, req.body.categoria)) throw new HttpError(400, 'La categoría seleccionada no existe.', 'INVALID_CATEGORY');
  const gallery = (req.body.imagenes || [req.body.imagen]).map(decodeImage);
  if (gallery.reduce((total,item)=>total+item.buffer.length,0)>12*1024*1024) throw new HttpError(400,'La galería debe pesar máximo 12 MB.','GALLERY_TOO_LARGE');
  const principal = gallery[req.body.imagenPrincipal || 0];
  const project = await transaction(client=>model.create(client, req.auth.userId, req.body, principal, gallery));
  email.trySendNewProjectEmail(project);
  res.status(201).json({ project });
}
async function updateOwn(req,res){if(!await categoryModel.exists(pool,req.body.categoria))throw new HttpError(400,'La categoría seleccionada no existe.','INVALID_CATEGORY');const gallery=req.body.imagenes?.map(decodeImage)||null;if(gallery&&gallery.reduce((total,item)=>total+item.buffer.length,0)>12*1024*1024)throw new HttpError(400,'La galería debe pesar máximo 12 MB.','GALLERY_TOO_LARGE');const image=gallery?gallery[req.body.imagenPrincipal||0]:(req.body.imagen?decodeImage(req.body.imagen):null);const project=await transaction(client=>model.updateOwn(client,req.params.projectId,req.auth.userId,req.body,image,gallery));if(!project)throw new HttpError(404,'El proyecto no existe o no te pertenece.','PROJECT_NOT_FOUND');res.json({project});}
async function deleteOwn(req,res){if(!await model.removeOwn(pool,req.params.projectId,req.auth.userId))throw new HttpError(404,'El proyecto no existe o no te pertenece.','PROJECT_NOT_FOUND');res.status(204).end();}
async function getProfile(req, res) { res.json({ profile: await model.getProfile(pool, req.auth.userId) }); }
async function saveProfile(req, res) { res.json({ profile: await model.saveProfile(pool, req.auth.userId, req.body) }); }
module.exports = { create, deleteOwn, getProfile, getPublic, getPublicAuthorProfile, listOwn, listPublic, saveProfile, updateOwn };
