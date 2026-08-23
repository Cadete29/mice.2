const adminService = require('../services/admin.service');
const { userIdSchema } = require('../models/admin.schemas');
const HttpError = require('../utils/http-error');
const projectModel = require('../models/project.model');
const { pool } = require('../config/database');

function targetId(req) {
  const parsed = userIdSchema.safeParse(req.params.userId);
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0].message, 'VALIDATION_ERROR');
  return parsed.data;
}

async function listUsers(req, res) {
  res.json(await adminService.listUsers(req.query));
}

async function changeRole(req, res) {
  res.json({ user: await adminService.changeRole(req.auth.userId, targetId(req), req.body.role) });
}

async function changeStatus(req, res) {
  res.json({ user: await adminService.changeStatus(req.auth.userId, targetId(req), req.body.active) });
}

async function listConsents(req, res) {
  res.json({ consents: await adminService.listConsents(targetId(req)) });
}
async function listProjects(_req, res) { res.json({ projects: await projectModel.listPublic(pool) }); }
async function deleteProject(req, res) {
  const projectId = targetId({ params: { userId: req.params.projectId } });
  if (!await projectModel.remove(pool, projectId)) throw new HttpError(404, 'El proyecto no existe.', 'PROJECT_NOT_FOUND');
  res.status(204).end();
}

module.exports = { changeRole, changeStatus, deleteProject, listConsents, listProjects, listUsers };
