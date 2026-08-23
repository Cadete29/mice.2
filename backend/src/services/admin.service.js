const { pool, transaction } = require('../config/database');
const adminModel = require('../models/admin.model');
const userModel = require('../models/user.model');
const HttpError = require('../utils/http-error');
const consentModel = require('../models/consent.model');

const mapAdminUser = (row) => ({
  ...userModel.mapUser(row),
  activo: row.activo,
  ultimoInicioSesion: row.ultimo_inicio_sesion,
  actualizadoEn: row.actualizado_en,
});

async function listUsers({ search = '', page = 1, limit = 20 }) {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const result = await adminModel.listUsers(pool, {
    search: String(search).trim().slice(0, 100),
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  });
  return { users: result.rows.map(mapAdminUser), pagination: { page: safePage, limit: safeLimit, total: result.total } };
}

async function changeRole(actorId, targetId, role) {
  return transaction(async (client) => {
    await adminModel.lockRoleManagement(client);
    const target = await adminModel.findForUpdate(client, targetId);
    if (!target) throw new HttpError(404, 'Usuario no encontrado.', 'USER_NOT_FOUND');
    if (target.tipo === 'administrador' && role !== 'administrador' && target.activo
      && await adminModel.countActiveAdmins(client) <= 1) {
      throw new HttpError(409, 'No puedes degradar al último administrador activo.', 'LAST_ADMIN_REQUIRED');
    }
    const updated = await adminModel.updateRole(client, targetId, role);
    console.info('[admin:role-changed]', { actorId, targetId, previousRole: target.tipo, role });
    return mapAdminUser(updated);
  });
}

async function changeStatus(actorId, targetId, active) {
  if (actorId === targetId && !active) {
    throw new HttpError(409, 'No puedes desactivar tu propia cuenta.', 'CANNOT_DISABLE_SELF');
  }
  return transaction(async (client) => {
    await adminModel.lockRoleManagement(client);
    const target = await adminModel.findForUpdate(client, targetId);
    if (!target) throw new HttpError(404, 'Usuario no encontrado.', 'USER_NOT_FOUND');
    if (target.tipo === 'administrador' && target.activo && !active
      && await adminModel.countActiveAdmins(client) <= 1) {
      throw new HttpError(409, 'No puedes desactivar al último administrador activo.', 'LAST_ADMIN_REQUIRED');
    }
    const updated = await adminModel.updateStatus(client, targetId, active);
    console.info('[admin:status-changed]', { actorId, targetId, previousStatus: target.activo, active });
    return mapAdminUser(updated);
  });
}

async function listConsents(userId) {
  const user = await adminModel.findById(pool, userId);
  if (!user) throw new HttpError(404, 'Usuario no encontrado.', 'USER_NOT_FOUND');
  const rows = await consentModel.listForUser(pool, userId);
  return rows.map((row) => ({
    id: row.id, type: row.tipo, version: row.version, documentUrl: row.documento_url,
    acceptedAt: row.aceptado_en, ip: row.direccion_ip, device: row.dispositivo,
  }));
}

module.exports = { changeRole, changeStatus, listConsents, listUsers };
