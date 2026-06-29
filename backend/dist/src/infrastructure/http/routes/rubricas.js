"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rubricasController_1 = require("../controllers/rubricasController");
const auth_1 = require("../middlewares/auth");
const roles_1 = require("../middlewares/roles");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
const controller = new rubricasController_1.RubricasController();
/**
 * @openapi
 * tags:
 *   name: Rubricas
 *   description: Endpoints para la gestión y creación de rúbricas analíticas
 */
// All routes require authentication
router.use(auth_1.authMiddleware);
/**
 * @openapi
 * /api/rubricas:
 *   get:
 *     summary: Listar rúbricas activas
 *     tags: [Rubricas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de rúbricas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   titulo:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   version:
 *                     type: integer
 *                   activa:
 *                     type: boolean
 *                   creadoPor:
 *                     type: string
 *                     format: uuid
 *       401:
 *         description: No autorizado (token JWT faltante o inválido)
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', (req, res) => controller.listActive(req, res));
/**
 * @openapi
 * /api/rubricas/{id}:
 *   get:
 *     summary: Obtener una rúbrica por su ID
 *     tags: [Rubricas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la rúbrica
 *     responses:
 *       200:
 *         description: Rúbrica encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Rúbrica no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', (req, res) => controller.getById(req, res));
/**
 * @openapi
 * /api/rubricas/{id}/historial:
 *   get:
 *     summary: Obtener historial de versiones de una rúbrica
 *     tags: [Rubricas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la rúbrica original
 *     responses:
 *       200:
 *         description: Historial de versiones obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/historial', (req, res) => controller.getHistory(req, res));
// Modify/Write endpoints require 'docente' or 'administrador' roles
const authorRoles = (0, roles_1.rolesMiddleware)(['docente', 'administrador']);
/**
 * @openapi
 * /api/rubricas:
 *   post:
 *     summary: Crear una nueva rúbrica
 *     tags: [Rubricas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - criterios
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título de la rúbrica
 *                 example: Exposición Final de Proyecto
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la rúbrica
 *                 example: Criterios para evaluar la sustentación
 *               criterios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - descripcion
 *                     - ponderacion
 *                     - niveles
 *                   properties:
 *                     descripcion:
 *                       type: string
 *                       example: Redacción y estructura
 *                     ponderacion:
 *                       type: number
 *                       example: 40
 *                     niveles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - descripcion
 *                           - puntos
 *                         properties:
 *                           descripcion:
 *                             type: string
 *                             example: Excelente
 *                           puntos:
 *                             type: number
 *                             example: 5
 *     responses:
 *       201:
 *         description: Rúbrica creada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes (requiere rol docente o admin)
 *       422:
 *         description: Error de validación (ej. la suma de ponderaciones no es 100%)
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authorRoles, (0, validate_1.validateBody)(rubricasController_1.rubricaSchema), (req, res) => controller.create(req, res));
/**
 * @openapi
 * /api/rubricas/{id}:
 *   put:
 *     summary: Actualizar una rúbrica existente
 *     description: Permite modificar el contenido de una rúbrica. Si la rúbrica ya posee evaluaciones aplicadas, se creará una nueva versión de la misma.
 *     tags: [Rubricas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - criterios
 *     responses:
 *       200:
 *         description: Rúbrica actualizada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       422:
 *         description: Error de validación de datos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authorRoles, (0, validate_1.validateBody)(rubricasController_1.rubricaSchema), (req, res) => controller.update(req, res));
/**
 * @openapi
 * /api/rubricas/clone:
 *   post:
 *     summary: Clonar una rúbrica existente
 *     tags: [Rubricas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rubricaId
 *             properties:
 *               rubricaId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la rúbrica a clonar
 *                 example: 11111111-1111-1111-1111-111111111111
 *     responses:
 *       201:
 *         description: Rúbrica clonada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Rúbrica original no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/clone', authorRoles, (0, validate_1.validateBody)(rubricasController_1.cloneSchema), (req, res) => controller.clone(req, res));
/**
 * @openapi
 * /api/rubricas/{id}:
 *   delete:
 *     summary: Archivar/Eliminar una rúbrica (soft delete)
 *     tags: [Rubricas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Rúbrica archivada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Rúbrica no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authorRoles, (req, res) => controller.archive(req, res));
exports.default = router;
