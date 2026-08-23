const {z}=require('zod');
const text=(max)=>z.string().trim().min(2).max(max);
const schema=z.object({
 primerNombre:text(100),segundoNombre:z.string().trim().max(100).optional().transform(v=>v||null),
 apellidoPaterno:text(100),apellidoMaterno:text(100),
 fechaNacimiento:z.iso.date().refine(value=>new Date(`${value}T00:00:00Z`)<=new Date(),'La fecha de nacimiento no puede ser futura.'),
 curp:z.string().trim().toUpperCase().regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/,'La CURP no tiene un formato válido.'),
 lada:z.string().trim().regex(/^\+\d{1,4}$/,'La lada internacional no es válida.'),
 paisTelefono:z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
 telefono:z.string().trim().regex(/^\d{7,15}$/,'El teléfono debe contener entre 7 y 15 dígitos.'),
 email:z.string().trim().email('El correo electrónico no es válido.').max(254).transform(v=>v.toLowerCase()),
 transporte:z.enum(['necesita-transporte','cuenta-con-vehiculo']),
 usoImagen:z.literal(true,{error:'Debes aceptar el aviso de uso de imagen.'}),
 privacidad:z.literal(true,{error:'Debes aceptar el aviso de privacidad.'}),
 deslindeResponsabilidad:z.literal(true,{error:'Debes aceptar el deslinde de responsabilidad.'}),
}).strict();
module.exports={beachRegistrationSchema:schema};
