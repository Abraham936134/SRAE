"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUsuario = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ValidationError_1 = require("../../domain/errors/ValidationError");
class LoginUsuario {
    usuarioRepo;
    constructor(usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }
    async execute(input) {
        if (!input.password) {
            throw new ValidationError_1.ValidationError('La contraseña es obligatoria');
        }
        const usuario = await this.usuarioRepo.findByEmailOrUsername(input.email);
        if (!usuario || !usuario.password) {
            throw new ValidationError_1.ValidationError('Credenciales incorrectas');
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(input.password, usuario.password);
        if (!isPasswordValid) {
            throw new ValidationError_1.ValidationError('Credenciales incorrectas');
        }
        // Sign JWT token
        const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';
        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
        };
        const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '8h' });
        return {
            token,
            user: payload,
        };
    }
}
exports.LoginUsuario = LoginUsuario;
