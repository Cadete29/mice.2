const {pool}=require('../config/database');
const config=require('../config/env');
const model=require('../models/beach-registration.model');
const email=require('../services/email.service');
async function create(q,r){const registration=await model.create(pool,q.body,{privacyVersion:config.PRIVACY_VERSION,ip:q.ip,userAgent:(q.get('user-agent')||'').slice(0,1000)});email.trySendBeachRegistrationEmails(registration);r.status(201).json({message:'Tu registro fue recibido. Te enviamos una confirmación por correo.',registrationId:registration.id})}
async function list(q,r){r.json({registrations:await model.list(pool,q.query.eventId)})}
async function active(_q,r){r.set("Cache-Control","no-store");r.json({event:await model.activeEvent(pool)})}
async function events(_q,r){r.json({events:await model.listEvents(pool)})}
async function createEvent(q,r){r.status(201).json({event:await model.createEvent(pool,q.body)})}
async function status(q,r){if(!['abierto','cerrado'].includes(q.body.status))return r.status(400).json({error:{code:'INVALID_STATUS',message:'Estado inválido.'}});r.json({event:await model.setEventStatus(pool,q.params.id,q.body.status)})}
async function eventDetail(q,r){r.set('Cache-Control','no-store');r.json({event:await model.getEvent(pool,q.params.id)})}
async function updateEvent(q,r){r.json({event:await model.updateEvent(pool,q.params.id,q.body)})}
const participantEmails=require('../models/participant-email.model');
const HttpError=require('../utils/http-error');
async function sendEmails(q,r){if(!config.EMAIL_ENABLED)throw new HttpError(503,'El envío de correos no está habilitado en el servidor.','EMAIL_DISABLED');await model.getEvent(pool,q.params.id);const id=await participantEmails.enqueue(pool,q.params.id,q.auth.userId,q.body);r.status(202).json({batchId:id})}
async function emailHistory(q,r){r.set('Cache-Control','no-store');r.json({batches:await participantEmails.list(pool,q.params.id)})}
module.exports={sendEmails,emailHistory,eventDetail,updateEvent,create,list,active,events,createEvent,status};
