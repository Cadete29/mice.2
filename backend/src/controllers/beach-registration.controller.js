const {pool}=require('../config/database');
const config=require('../config/env');
const model=require('../models/beach-registration.model');
const email=require('../services/email.service');
async function create(q,r){const registration=await model.create(pool,q.body,{privacyVersion:config.PRIVACY_VERSION,ip:q.ip,userAgent:(q.get('user-agent')||'').slice(0,1000)});email.trySendBeachRegistrationEmails(registration);r.status(201).json({message:'Tu registro fue recibido. Te enviamos una confirmación por correo.',registrationId:registration.id})}
async function list(q,r){r.json({registrations:await model.list(pool,q.query.eventId)})}
async function active(_q,r){r.json({event:await model.activeEvent(pool)})}
async function events(_q,r){r.json({events:await model.listEvents(pool)})}
async function createEvent(q,r){const name=String(q.body.name||'').trim().slice(0,160);r.status(201).json({event:await model.createEvent(pool,name)})}
async function status(q,r){if(!['abierto','cerrado'].includes(q.body.status))return r.status(400).json({error:{code:'INVALID_STATUS',message:'Estado inválido.'}});r.json({event:await model.setEventStatus(pool,q.params.id,q.body.status)})}
module.exports={create,list,active,events,createEvent,status};
