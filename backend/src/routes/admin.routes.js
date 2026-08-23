const express = require('express');
const controller = require('../controllers/admin.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { changeRoleSchema, changeStatusSchema } = require('../models/admin.schemas');

const router = express.Router();
router.use(authenticate, authorize('administrador'));
router.get('/users', controller.listUsers);
router.get('/users/:userId/consents', controller.listConsents);
router.patch('/users/:userId/role', validate(changeRoleSchema), controller.changeRole);
router.patch('/users/:userId/status', validate(changeStatusSchema), controller.changeStatus);
router.get('/projects', controller.listProjects);
router.delete('/projects/:projectId', controller.deleteProject);

module.exports = router;
