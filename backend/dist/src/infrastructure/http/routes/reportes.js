"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportesController_1 = require("../controllers/reportesController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const controller = new reportesController_1.ReportesController();
// Auth required for report access
router.use(auth_1.authMiddleware);
router.get('/:rubricaId/stats', (req, res) => controller.getStats(req, res));
router.get('/:rubricaId/pdf', (req, res) => controller.exportPDF(req, res));
router.get('/:rubricaId/excel', (req, res) => controller.exportExcel(req, res));
exports.default = router;
