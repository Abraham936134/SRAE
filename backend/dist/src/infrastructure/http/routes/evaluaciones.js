"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const evaluacionesController_1 = require("../controllers/evaluacionesController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
const controller = new evaluacionesController_1.EvaluacionesController();
/**
 * @openapi
 * tags:
 *   name: Evaluaciones
 *   description: Endpoints para aplicar y guardar evaluaciones de estudiantes
 */
// Authentication required to apply evaluations
router.use(auth_1.authMiddleware);
/**
 * @openapi
 * /api/evaluaciones:
 *   post:
 *     summary: Guardar una evaluación aplicada a un estudiante
 *     tags: [Evaluaciones]
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
 *               - estudiante
 *               - respuestas
 *             properties:
 *               rubricaId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la rúbrica utilizada para evaluar
 *                 example: 11111111-1111-1111-1111-111111111111
 *               estudiante:
 *                 type: string
 *                 description: Nombre o código del estudiante evaluado
 *                 example: María Quispe
 *               respuestas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - criterioId
 *                     - nivelId
 *                   properties:
 *                     criterioId:
 *                       type: string
 *                       format: uuid
 *                       example: 22222222-2222-2222-2222-222222222222
 *                     nivelId:
 *                       type: string
 *                       format: uuid
 *                       example: 33333333-3333-3333-3333-333333333333
 *     responses:
 *       201:
 *         description: Evaluación registrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       422:
 *         description: Error de validación (datos incompletos, criterios faltantes, etc.)
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', (0, validate_1.validateBody)(evaluacionesController_1.aplicarEvaluacionSchema), (req, res) => controller.apply(req, res));
exports.default = router;
