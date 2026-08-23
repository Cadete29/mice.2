const { z } = require('zod');
const image = z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/);
const optional = z.string().trim().max(500).optional().nullable().transform((v) => v || null);
const callSchema = z.object({
 titulo:z.string().trim().min(3).max(140), descripcion:z.string().trim().min(20).max(5000),
 categoria:z.string().trim().min(2).max(60), tipo:z.enum(['interna','externa']),
 enlaceExterno:z.string().trim().url('Ingresa un enlace externo válido.').max(1000).optional().nullable().transform((v)=>v||null),
 imagen:image, imagenes:z.array(image).min(1).max(6).optional(), imagenPrincipal:z.number().int().min(0).max(5).optional(),
 correo:z.string().trim().email().optional().nullable().transform((v)=>v||null), whatsapp:optional,
 facebook:optional, instagram:optional, x:optional, tiktok:optional, youtube:optional, linkedin:optional,
}).strict().superRefine((data,ctx)=>{
 if(data.tipo==='externa'&&!data.enlaceExterno)ctx.addIssue({code:'custom',path:['enlaceExterno'],message:'La convocatoria externa requiere un enlace.'});
 if(data.imagenes&&data.imagenPrincipal>=data.imagenes.length)ctx.addIssue({code:'custom',path:['imagenPrincipal'],message:'La imagen principal seleccionada no existe.'});
 if(data.whatsapp&&!/^\d{10,15}$/.test(data.whatsapp))ctx.addIssue({code:'custom',path:['whatsapp'],message:'WhatsApp debe contener entre 10 y 15 dígitos.'});
});
const statusSchema=z.object({estado:z.enum(['aprobada','rechazada'])}).strict();
const visibilitySchema=z.object({activa:z.boolean()}).strict();
const uuidSchema=z.string().uuid();
module.exports={callSchema,statusSchema,uuidSchema,visibilitySchema};
