"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rubricasController_1 = require("../controllers/rubricasController");
const auth_1 = require("../middlewares/auth");
const roles_1 = require("../middlewares/roles");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
const controller = new rubricasController_1.RubricasController();
// All routes require authentication
router.use(auth_1.authMiddleware);
// Active rubrics list & single read (accessible to any authenticated user)
router.get('/', (req, res) => controller.listActive(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/:id/historial', (req, res) => controller.getHistory(req, res));
// Modify/Write endpoints require 'docente' or 'administrador' roles
const authorRoles = (0, roles_1.rolesMiddleware)(['docente', 'administrador']);
router.post('/', authorRoles, (0, validate_1.validateBody)(rubricasController_1.rubricaSchema), (req, res) => controller.create(req, res));
router.put('/:id', authorRoles, (0, validate_1.validateBody)(rubricasController_1.rubricaSchema), (req, res) => controller.update(req, res));
router.post('/clone', authorRoles, (0, validate_1.validateBody)(rubricasController_1.cloneSchema), (req, res) => controller.clone(req, res));
router.delete('/:id', authorRoles, (req, res) => controller.archive(req, res));
exports.default = router;
