import { Request, Response } from 'express';
import { z } from 'zod';
import { UsuarioRepo } from '../../db/repositories/UsuarioRepo';
import { CrearUsuario } from '../../../application/usuarios/CrearUsuario';
import { LoginUsuario } from '../../../application/usuarios/LoginUsuario';
import { ValidationError } from '../../../domain/errors/ValidationError';

const usuarioRepo = new UsuarioRepo();

// Zod validation schemas
export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Formato de correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(['docente', 'administrador', 'auxiliar'], {
    errorMap: () => ({ message: 'El rol debe ser: docente, administrador o auxiliar' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'El usuario o correo electrónico es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export class UsuariosController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const useCase = new CrearUsuario(usuarioRepo);
      const user = await useCase.execute(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(422).json({ error: error.message });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const useCase = new LoginUsuario(usuarioRepo);
      const result = await useCase.execute(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(422).json({ error: error.message });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
    }
  }
}
