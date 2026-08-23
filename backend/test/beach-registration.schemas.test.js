const test=require('node:test');
const assert=require('node:assert/strict');
const {beachRegistrationSchema}=require('../src/models/beach-registration.schemas');
const valid={primerNombre:'Ana',segundoNombre:'',apellidoPaterno:'López',apellidoMaterno:'Pérez',fechaNacimiento:'1995-04-20',curp:'LOPA950420MCSXXX01',lada:'+52',paisTelefono:'MX',telefono:'9611234567',email:'ANA@EXAMPLE.COM',transporte:'necesita-transporte',usoImagen:true,privacidad:true,deslindeResponsabilidad:true};
test('normaliza un registro válido de limpieza de playas',()=>{const result=beachRegistrationSchema.parse(valid);assert.equal(result.email,'ana@example.com');assert.equal(result.segundoNombre,null);assert.equal(result.curp,'LOPA950420MCSXXX01')});
test('rechaza un registro sin consentimientos',()=>{assert.equal(beachRegistrationSchema.safeParse({...valid,privacidad:false}).success,false)});
test('rechaza CURP y teléfono inválidos',()=>{assert.equal(beachRegistrationSchema.safeParse({...valid,curp:'INVALIDA',telefono:'123'}).success,false)});
