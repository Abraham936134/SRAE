import { Router } from 'express';
import { ReportesController } from '../controllers/reportesController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const controller = new ReportesController();

// Auth required for report access
router.use(authMiddleware);

router.get('/:rubricaId/stats', (req, res) => controller.getStats(req, res));
router.get('/:rubricaId/pdf', (req, res) => controller.exportPDF(req, res));
router.get('/:rubricaId/excel', (req, res) => controller.exportExcel(req, res));

export default router;
