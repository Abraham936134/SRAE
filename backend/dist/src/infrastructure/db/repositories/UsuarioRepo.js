"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioRepo = void 0;
const neon_1 = __importDefault(require("../neon"));
const Usuario_1 = require("../../../domain/entities/Usuario");
class UsuarioRepo {
    async findByEmail(email) {
        try {
            const rows = await (0, neon_1.default) `SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ${email} LIMIT 1`;
            if (rows.length === 0)
                return null;
            const row = rows[0];
            return Usuario_1.Usuario.create(row.id, row.nombre, row.email, row.password, row.rol);
        }
        catch (error) {
            console.error('Error en UsuarioRepo.findByEmail:', error);
            throw error;
        }
    }
    async findByEmailOrUsername(identifier) {
        try {
            const emailPattern = identifier.includes('@') ? identifier : `${identifier}@urp.edu.pe`;
            const rows = await (0, neon_1.default) `
        SELECT id, nombre, email, password, rol 
        FROM usuarios 
        WHERE email = ${identifier} 
           OR email = ${emailPattern} 
        LIMIT 1
      `;
            if (rows.length === 0)
                return null;
            const row = rows[0];
            return Usuario_1.Usuario.create(row.id, row.nombre, row.email, row.password, row.rol);
        }
        catch (error) {
            console.error('Error en UsuarioRepo.findByEmailOrUsername:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            const rows = await (0, neon_1.default) `SELECT id, nombre, email, password, rol FROM usuarios WHERE id = ${id} LIMIT 1`;
            if (rows.length === 0)
                return null;
            const row = rows[0];
            return Usuario_1.Usuario.create(row.id, row.nombre, row.email, row.password, row.rol);
        }
        catch (error) {
            console.error('Error en UsuarioRepo.findById:', error);
            throw error;
        }
    }
    async save(usuario) {
        try {
            await (0, neon_1.default) `
        INSERT INTO usuarios (id, nombre, email, password, rol)
        VALUES (${usuario.id}, ${usuario.nombre}, ${usuario.email}, ${usuario.password || ''}, ${usuario.rol})
        ON CONFLICT (id) DO UPDATE
        SET nombre = EXCLUDED.nombre, email = EXCLUDED.email, password = EXCLUDED.password, rol = EXCLUDED.rol
      `;
        }
        catch (error) {
            console.error('Error en UsuarioRepo.save:', error);
            throw error;
        }
    }
}
exports.UsuarioRepo = UsuarioRepo;
