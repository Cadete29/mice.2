const test=require('node:test');
const assert=require('node:assert/strict');
const {callSchema}=require('../src/models/call.schemas');
const base={titulo:'Convocatoria ambiental',descripcion:'Descripción suficientemente extensa para publicar.',categoria:'Comunidad',imagen:'data:image/png;base64,AAAA',tipo:'interna'};
test('acepta una convocatoria interna sin enlace externo',()=>{assert.equal(callSchema.safeParse(base).success,true)});
test('exige enlace para una convocatoria externa',()=>{assert.equal(callSchema.safeParse({...base,tipo:'externa'}).success,false);assert.equal(callSchema.safeParse({...base,tipo:'externa',enlaceExterno:'https://example.com/postulacion'}).success,true)});
test('limita la galería a seis imágenes',()=>{assert.equal(callSchema.safeParse({...base,imagenes:Array(7).fill(base.imagen)}).success,false)});
