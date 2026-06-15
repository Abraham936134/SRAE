import { Router } from 'express';
import { EvaluacionesController, aplicarEvaluacionSchema } from '../controllers/evaluacionesController';
import { authMiddleware } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';

const router = Router();
const controller = new EvaluacionesController();

// Authentication required to apply evaluations
router.use(authMiddleware);

router.post('/', validateBody(aplicarEvaluacionSchema), (req, res) => controller.apply(req, res));

export default router;
