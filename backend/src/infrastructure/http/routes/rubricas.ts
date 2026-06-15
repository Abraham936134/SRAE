import { Router } from 'express';
import { RubricasController, rubricaSchema, cloneSchema } from '../controllers/rubricasController';
import { authMiddleware } from '../middlewares/auth';
import { rolesMiddleware } from '../middlewares/roles';
import { validateBody } from '../middlewares/validate';

const router = Router();
const controller = new RubricasController();

// All routes require authentication
router.use(authMiddleware);

// Active rubrics list & single read (accessible to any authenticated user)
router.get('/', (req, res) => controller.listActive(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/:id/historial', (req, res) => controller.getHistory(req, res));

// Modify/Write endpoints require 'docente' or 'administrador' roles
const authorRoles = rolesMiddleware(['docente', 'administrador']);

router.post('/', authorRoles, validateBody(rubricaSchema), (req, res) => controller.create(req, res));
router.put('/:id', authorRoles, validateBody(rubricaSchema), (req, res) => controller.update(req, res));
router.post('/clone', authorRoles, validateBody(cloneSchema), (req, res) => controller.clone(req, res));
router.delete('/:id', authorRoles, (req, res) => controller.archive(req, res));

export default router;
