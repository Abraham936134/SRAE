"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuariosController = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const UsuarioRepo_1 = require("../../db/repositories/UsuarioRepo");
const CrearUsuario_1 = require("../../../application/usuarios/CrearUsuario");
const LoginUsuario_1 = require("../../../application/usuarios/LoginUsuario");
const ValidationError_1 = require("../../../domain/errors/ValidationError");
const usuarioRepo = new UsuarioRepo_1.UsuarioRepo();
// Zod validation schemas
exports.registerSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: zod_1.z.string().email('Formato de correo electrónico inválido'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    rol: zod_1.z.enum(['docente', 'administrador', 'auxiliar'], {
        errorMap: () => ({ message: 'El rol debe ser: docente, administrador o auxiliar' }),
    }),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().min(1, 'El usuario o correo electrónico es obligatorio'),
    password: zod_1.z.string().min(1, 'La contraseña es obligatoria'),
});
class UsuariosController {
    async register(req, res) {
        try {
            const useCase = new CrearUsuario_1.CrearUsuario(usuarioRepo);
            const user = await useCase.execute(req.body);
            res.status(201).json(user);
        }
        catch (error) {
            if (error instanceof ValidationError_1.ValidationError) {
                res.status(422).json({ error: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        }
    }
    async login(req, res) {
        try {
            const useCase = new LoginUsuario_1.LoginUsuario(usuarioRepo);
            const result = await useCase.execute(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof ValidationError_1.ValidationError) {
                res.status(422).json({ error: error.message });
            }
            else {
                console.error(error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        }
    }
}
exports.UsuariosController = UsuariosController;
