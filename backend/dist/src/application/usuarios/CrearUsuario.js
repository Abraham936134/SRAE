"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearUsuario = void 0;
const crypto_1 = require("crypto");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Usuario_1 = require("../../domain/entities/Usuario");
const ValidationError_1 = require("../../domain/errors/ValidationError");
class CrearUsuario {
    usuarioRepo;
    constructor(usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }
    async execute(input) {
        if (!input.password) {
            throw new ValidationError_1.ValidationError('La contraseña es obligatoria');
        }
        const existing = await this.usuarioRepo.findByEmail(input.email);
        if (existing) {
            throw new ValidationError_1.ValidationError(`El correo electrónico ${input.email} ya está registrado`);
        }
        // Hash the password
        const hashedPassword = await bcrypt_1.default.hash(input.password, 10);
        const usuario = Usuario_1.Usuario.create((0, crypto_1.randomUUID)(), input.nombre, input.email, hashedPassword, input.rol);
        await this.usuarioRepo.save(usuario);
        // Return without password
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
        };
    }
}
exports.CrearUsuario = CrearUsuario;
