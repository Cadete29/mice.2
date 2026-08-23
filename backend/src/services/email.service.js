const nodemailer = require('nodemailer');
const config = require('../config/env');

const PROVIDERS = {
  gmail: { host: 'smtp.gmail.com', port: 465, secure: true },
  namecheap: { host: 'mail.privateemail.com', port: 465, secure: true },
};

let transporter;
function getTransporter() {
  if (!config.EMAIL_ENABLED) return null;
  if (!transporter) {
    const defaults = PROVIDERS[config.EMAIL_PROVIDER];
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST || defaults.host,
      port: config.SMTP_PORT || defaults.port,
      secure: config.SMTP_SECURE ?? defaults.secure,
      connectionTimeout: config.SMTP_CONNECTION_TIMEOUT_MS,
      greetingTimeout: config.SMTP_GREETING_TIMEOUT_MS,
      socketTimeout: config.SMTP_SOCKET_TIMEOUT_MS,
      auth: { user: config.EMAIL_USER, pass: config.EMAIL_PASSWORD },
    });
  }
  return transporter;
}

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[character]));

function layout(title, name, message, buttonText, url, expiration) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f4f4ed;font-family:Arial,sans-serif;color:#343226">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:40px 16px">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#fff;border-radius:20px;overflow:hidden">
  <tr><td style="background:#3d5121;color:#fff;padding:28px 36px"><strong style="font-size:24px">MICE-LO</strong></td></tr>
  <tr><td style="padding:36px"><h1 style="color:#3d5121;font-size:26px">${escapeHtml(title)}</h1>
  <p>Hola ${escapeHtml(name)},</p><p style="line-height:1.6">${escapeHtml(message)}</p>
  <p style="margin:30px 0"><a href="${escapeHtml(url)}" style="background:#607a2f;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:bold">${escapeHtml(buttonText)}</a></p>
  <p style="color:#6c6a5c;font-size:13px">Este enlace expira en ${escapeHtml(expiration)}. Si no solicitaste esta acción, ignora este correo.</p>
  <p style="color:#6c6a5c;font-size:12px;word-break:break-all">Si el botón no funciona, copia esta liga:<br>${escapeHtml(url)}</p>
  </td></tr></table></td></tr></table></body></html>`;
}

async function send({ to, subject, text, html, replyTo }) {
  const mailer = getTransporter();
  if (!mailer) return { sent: false, development: true };
  const fromAddress = config.EMAIL_FROM_ADDRESS || config.EMAIL_USER;
  const info = await mailer.sendMail({
    from: `"${config.EMAIL_FROM_NAME.replace(/"/g, '')}" <${fromAddress}>`, to, subject, text, html, replyTo,
  });
  return { sent: true, messageId: info.messageId };
}

function contactLayout({ title, greeting, paragraphs }) {
  const content = paragraphs.map((paragraph) => `<p style="line-height:1.65;white-space:pre-wrap">${escapeHtml(paragraph)}</p>`).join('');
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f4f4ed;font-family:Arial,sans-serif;color:#343226">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:40px 16px">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#fff;border-radius:20px;overflow:hidden">
  <tr><td style="background:#3d5121;color:#fff;padding:28px 36px"><strong style="font-size:24px">MICE-LO</strong></td></tr>
  <tr><td style="padding:36px"><h1 style="color:#3d5121;font-size:26px">${escapeHtml(title)}</h1>
  <p>Hola ${escapeHtml(greeting)},</p>${content}
  <p style="color:#6c6a5c;font-size:13px;margin-top:30px">Este correo fue generado desde el formulario de contacto de MICE-LO.</p>
  </td></tr></table></td></tr></table></body></html>`;
}

async function sendContactEmails({ nombre, correo, asunto, mensaje }) {
  const adminEmail = config.ADMIN_EMAIL || config.EMAIL_USER;
  const adminMessage = `Nombre: ${nombre}\nCorreo: ${correo}\nAsunto: ${asunto}\n\nMensaje:\n${mensaje}`;
  const confirmation = `Recibimos tu mensaje sobre “${asunto}”. Nuestro equipo lo revisará y se pondrá en contacto contigo.\n\nEsta es una copia de tu mensaje:\n${mensaje}`;

  return Promise.all([
    send({
      to: adminEmail,
      replyTo: correo,
      subject: `Contacto web: ${asunto}`,
      text: adminMessage,
      html: contactLayout({
        title: 'Nuevo mensaje de contacto',
        greeting: 'equipo administrador',
        paragraphs: [`${nombre} (${correo}) escribió sobre “${asunto}”.`, mensaje],
      }),
    }),
    send({
      to: correo,
      subject: 'Recibimos tu mensaje en MICE-LO',
      text: `Hola ${nombre}.\n\n${confirmation}`,
      html: contactLayout({
        title: 'Recibimos tu mensaje',
        greeting: nombre,
        paragraphs: [confirmation],
      }),
    }),
  ]);
}

function sendFamilyContactEmail({ nombre, correo, mensaje }) {
  const adminEmail = config.ADMIN_EMAIL || config.EMAIL_USER;
  const text = `Nueva solicitud para unirse a la familia MICE-LO.\n\nNombre: ${nombre}\nCorreo: ${correo}\n\nMensaje:\n${mensaje}`;

  return send({
    to: adminEmail,
    replyTo: correo,
    subject: `Solicitud para unirse a la familia MICE-LO — ${nombre}`,
    text,
    html: contactLayout({
      title: 'Nueva solicitud para la familia MICE-LO',
      greeting: 'equipo administrador',
      paragraphs: [`${nombre} (${correo}) desea unirse a la familia MICE-LO.`, mensaje],
    }),
  });
}

function sendVerificationEmail({ to, name, token }) {
  const url = `${config.FRONTEND_URL}/sign-up?verify=${encodeURIComponent(token)}`;
  return send({
    to, subject: 'Confirma tu correo en MICE-LO',
    text: `Hola ${name}. Confirma tu correo: ${url}. El enlace expira en 24 horas.`,
    html: layout('Confirma tu correo', name, 'Gracias por unirte. Confirma tu dirección para completar tu cuenta.', 'Confirmar correo', url, '24 horas'),
  });
}

function sendPasswordResetEmail({ to, name, token }) {
  const url = `${config.FRONTEND_URL}/sign-up?reset=${encodeURIComponent(token)}`;
  return send({
    to, subject: 'Recupera tu cuenta de MICE-LO',
    text: `Hola ${name}. Restablece tu contraseña: ${url}. El enlace expira en 30 minutos.`,
    html: layout('Restablece tu contraseña', name, 'Recibimos una solicitud para cambiar la contraseña de tu cuenta.', 'Crear nueva contraseña', url, '30 minutos'),
  });
}

async function tryDelivery(kind, delivery) {
  try {
    return await delivery();
  } catch (error) {
    console.error('[email:delivery-failed]', { kind, message: error.message });
    return { sent: false, retryable: true };
  }
}

const trySendVerificationEmail = (message) => tryDelivery(
  'email_verification', () => sendVerificationEmail(message),
);
const trySendPasswordResetEmail = (message) => tryDelivery(
  'password_reset', () => sendPasswordResetEmail(message),
);
function sendNewProjectEmail(project) {
  const to = config.ADMIN_EMAIL || config.EMAIL_USER;
  if (!to) return Promise.resolve({ sent: false, development: true });
  const url = `${config.FRONTEND_URL}/administracion`;
  return send({
    to, subject: `Nuevo proyecto: ${project.title}`,
    text: `${project.author} publicó "${project.title}" en ${project.category}. Revisión: ${url}`,
    html: layout('Nuevo proyecto publicado', 'equipo administrador', `${project.author} publicó "${project.title}" en la categoría ${project.category}.`, 'Revisar proyecto', url, 'el tiempo que sea necesario'),
  });
}
const trySendNewProjectEmail = (project) => tryDelivery('new_project', () => sendNewProjectEmail(project));
function sendApplicationEmail({ user, application, callId, callTitle }) {
  const to=config.ADMIN_EMAIL||config.EMAIL_USER;if(!to)return Promise.resolve({sent:false,development:true});
  const contacts=[`Correo: ${application.correo}`,application.whatsapp&&`WhatsApp: ${application.whatsapp}`,application.facebook&&`Facebook: ${application.facebook}`,application.instagram&&`Instagram: ${application.instagram}`,application.x&&`X: ${application.x}`,application.tiktok&&`TikTok: ${application.tiktok}`,application.youtube&&`YouTube: ${application.youtube}`,application.linkedin&&`LinkedIn: ${application.linkedin}`].filter(Boolean).join('\n');
  const url=`${config.FRONTEND_URL}/administracion`;
  const title=callTitle||callId;
  return Promise.all([
    send({to,replyTo:application.correo,subject:`Nueva postulación: ${title}`,text:`Convocatoria: ${title}\nPostulante: ${user.nombre} ${user.apellido_paterno}\n\nDatos de contacto:\n${contacts}\n\n${url}`,html:contactLayout({title:'Nueva postulación interna',greeting:'equipo administrador',paragraphs:[`Convocatoria: ${title}`,`Postulante: ${user.nombre} ${user.apellido_paterno}\n\nDatos de contacto:\n${contacts}`]})}),
    send({to:application.correo,subject:`Recibimos tu postulación: ${title}`,text:`Hola ${user.nombre}. Recibimos tu postulación a “${title}”. El equipo de MICE-LO revisará tus datos y se comunicará contigo por los medios de contacto autorizados en tu cuenta.`,html:contactLayout({title:'Postulación recibida',greeting:user.nombre,paragraphs:[`Recibimos tu postulación a “${title}”.`,`El equipo de MICE-LO revisará tus datos y se comunicará contigo por los medios de contacto autorizados en tu cuenta.`]})}),
  ]);
}
const trySendApplicationEmail=(data)=>tryDelivery('call_application',()=>sendApplicationEmail(data));

function sendBeachRegistrationEmails(registration){
  const admin=config.ADMIN_EMAIL||config.EMAIL_USER;
  const name=[registration.firstName,registration.middleName,registration.lastName,registration.secondLastName].filter(Boolean).join(' ');
  const phone=`${registration.callingCode} ${registration.phone}`;
  const dashboard=`${config.FRONTEND_URL}/administracion`;
  return Promise.all([
    send({to:admin,replyTo:registration.email,subject:'Nuevo registro para limpieza de playas',text:`${name} se registró para la limpieza de playas.\nCorreo: ${registration.email}\nTeléfono: ${phone}\nTransporte: ${registration.transport}\nConsulta el registro completo: ${dashboard}`,html:contactLayout({title:'Nuevo registro de limpieza de playas',greeting:'equipo administrador',paragraphs:[`${name} completó el formulario de participación.`,`Correo: ${registration.email}\nTeléfono: ${phone}\nTransporte: ${registration.transport}\n\nConsulta los datos completos y consentimientos en el dashboard administrativo.`]})}),
    send({to:registration.email,subject:'Confirmación de registro — Limpieza de playas',text:`Hola ${registration.firstName}. Recibimos tu registro para participar en la limpieza de playas. El equipo organizador se comunicará contigo para compartir el punto de encuentro, horario y recomendaciones.`,html:contactLayout({title:'Registro confirmado',greeting:registration.firstName,paragraphs:['Recibimos tu registro para participar en la jornada de limpieza de playas.','El equipo organizador se comunicará contigo para compartir el punto de encuentro, horario y recomendaciones. ¡Gracias por sumarte!']})}),
  ]);
}
const trySendBeachRegistrationEmails=(data)=>tryDelivery('beach_registration',()=>sendBeachRegistrationEmails(data));

async function verifyConnection() {
  const mailer = getTransporter();
  if (!mailer) return false;
  let timeout;
  try {
    await Promise.race([
      mailer.verify(),
      new Promise((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error('La verificación SMTP excedió el tiempo límite.')),
          config.SMTP_CONNECTION_TIMEOUT_MS,
        );
      }),
    ]);
    return true;
  } catch (error) {
    mailer.close();
    transporter = undefined;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  sendVerificationEmail, sendPasswordResetEmail,
  trySendVerificationEmail, trySendPasswordResetEmail, trySendNewProjectEmail, trySendApplicationEmail,
  sendContactEmails, sendFamilyContactEmail, trySendBeachRegistrationEmails, verifyConnection,
};
