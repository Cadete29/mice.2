const { z } = require('zod');

const optionalPhone = z.string().trim().max(20).optional().nullable().transform((v) => v || null);
const optionalUrl = z.string().trim().max(500).optional().nullable().transform((v) => v || null);
const socialHosts = { facebook: ['facebook.com', 'fb.com'], instagram: ['instagram.com'], x: ['x.com', 'twitter.com'], tiktok: ['tiktok.com'], youtube: ['youtube.com', 'youtu.be'], linkedin: ['linkedin.com'] };
const validSocialUrl = (value, hosts) => { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)); } catch { return false; } };
const socialProfileSchema = z.object({
  whatsapp: optionalPhone, facebook: optionalUrl, instagram: optionalUrl, x: optionalUrl,
  tiktok: optionalUrl, youtube: optionalUrl, linkedin: optionalUrl,
  mostrarWhatsapp: z.boolean(), mostrarFacebook: z.boolean(), mostrarInstagram: z.boolean(), mostrarX: z.boolean(),
  mostrarTiktok: z.boolean(), mostrarYoutube: z.boolean(), mostrarLinkedin: z.boolean(),
}).strict().superRefine((data, ctx) => {
  const pairs = [['Whatsapp', 'whatsapp'], ['Facebook', 'facebook'], ['Instagram', 'instagram'], ['X', 'x'], ['Tiktok', 'tiktok'], ['Youtube', 'youtube'], ['Linkedin', 'linkedin']];
  pairs.forEach(([label, field]) => {
    if (data[`mostrar${label}`] && !data[field]) ctx.addIssue({ code: 'custom', path: [field], message: `Captura ${label} antes de activarlo.` });
  });
  if (data.whatsapp && !/^\d{10,15}$/.test(data.whatsapp)) ctx.addIssue({ code: 'custom', path: ['whatsapp'], message: 'WhatsApp debe contener únicamente entre 10 y 15 dígitos.' });
  Object.entries(socialHosts).forEach(([field, hosts]) => {
    if (data[field] && !validSocialUrl(data[field], hosts)) ctx.addIssue({ code: 'custom', path: [field], message: `Ingresa una URL válida de ${field === 'x' ? 'X' : field}.` });
  });
});

const projectSchema = z.object({
  titulo: z.string().trim().min(3).max(140),
  descripcion: z.string().trim().min(20).max(2000),
  categoria: z.string().trim().min(2).max(60),
  imagen: z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/),
  imagenes: z.array(z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/)).min(1).max(6).optional(),
  imagenPrincipal: z.number().int().min(0).max(5).optional(),
}).strict().superRefine((data,ctx)=>{if(data.imagenes&&data.imagenPrincipal>=data.imagenes.length)ctx.addIssue({code:'custom',path:['imagenPrincipal'],message:'La imagen principal seleccionada no existe.'})});
const projectUpdateSchema = projectSchema.safeExtend({ imagen: projectSchema.shape.imagen.optional().nullable() }).strict();

module.exports = { projectSchema, projectUpdateSchema, socialProfileSchema };
