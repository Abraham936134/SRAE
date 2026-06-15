import { Router } from 'express';
import { UsuariosController, registerSchema, loginSchema } from '../controllers/usuariosController';
import { validateBody } from '../middlewares/validate';

const router = Router();
const controller = new UsuariosController();

router.post('/register', validateBody(registerSchema), (req, res) => controller.register(req, res));
router.post('/login', validateBody(loginSchema), (req, res) => controller.login(req, res));

export default router;
