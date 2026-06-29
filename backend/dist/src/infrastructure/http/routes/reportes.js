"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportesController_1 = require("../controllers/reportesController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const controller = new reportesController_1.ReportesController();
/**
 * @openapi
 * tags:
 *   name: Reportes
 *   description: Endpoints para la obtención y exportación de reportes de evaluaciones
 */
// Auth required for report access
router.use(auth_1.authMiddleware);
/**
 * @openapi
 * /api/reportes/{rubricaId}/stats:
 *   get:
 *     summary: Obtener estadísticas grupales de evaluaciones para una rúbrica
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rubricaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la rúbrica evaluada
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Rúbrica no encontrada o sin evaluaciones
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:rubricaId/stats', (req, res) => controller.getStats(req, res));
/**
 * @openapi
 * /api/reportes/{rubricaId}/pdf:
 *   get:
 *     summary: Exportar reporte de rúbrica a PDF
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rubricaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Archivo PDF generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Rúbrica no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:rubricaId/pdf', (req, res) => controller.exportPDF(req, res));
/**
 * @openapi
 * /api/reportes/{rubricaId}/excel:
 *   get:
 *     summary: Exportar reporte de rúbrica a Excel (XLSX)
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rubricaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Rúbrica no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:rubricaId/excel', (req, res) => controller.exportExcel(req, res));
exports.default = router;
