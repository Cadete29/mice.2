const test = require('node:test');
const assert = require('node:assert/strict');
const { socialProfileSchema } = require('../src/models/project.schemas');
const base = { whatsapp:null,facebook:null,instagram:null,x:null,tiktok:null,youtube:null,linkedin:null,mostrarWhatsapp:false,mostrarFacebook:false,mostrarInstagram:false,mostrarX:false,mostrarTiktok:false,mostrarYoutube:false,mostrarLinkedin:false };
test('acepta WhatsApp sólo con dígitos',()=>assert.equal(socialProfileSchema.safeParse({...base,whatsapp:'521234567890'}).success,true));
test('rechaza símbolos en WhatsApp',()=>assert.equal(socialProfileSchema.safeParse({...base,whatsapp:'+52 1234567890'}).success,false));
test('exige URLs correspondientes a cada red',()=>{assert.equal(socialProfileSchema.safeParse({...base,instagram:'https://instagram.com/micelo'}).success,true);assert.equal(socialProfileSchema.safeParse({...base,instagram:'@micelo'}).success,false);assert.equal(socialProfileSchema.safeParse({...base,instagram:'https://example.com/micelo'}).success,false)});
