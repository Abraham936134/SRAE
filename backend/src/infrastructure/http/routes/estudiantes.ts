import { Router } from 'express';
import { EstudiantesController, createEstudianteSchema } from '../controllers/estudiantesController';
import { validateBody } from '../middlewares/validate';

const router = Router();
const controller = new EstudiantesController();

router.get('/', (req, res) => controller.listar(req, res));
router.post('/', validateBody(createEstudianteSchema), (req, res) => controller.crear(req, res));
router.delete('/:id', (req, res) => controller.eliminar(req, res));

export default router;
