"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstudiantesController = exports.createEstudianteSchema = void 0;
const neon_1 = __importDefault(require("../../db/neon"));
const zod_1 = require("zod");
exports.createEstudianteSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    nombre: zod_1.z.string().min(1),
    codigo: zod_1.z.string().min(1),
    email: zod_1.z.string().email()
});
class EstudiantesController {
    async listar(_req, res) {
        try {
            const rows = await (0, neon_1.default) `
        SELECT id, nombre, codigo, email, creado_en as "creadoEn"
        FROM estudiantes
        ORDER BY nombre ASC
      `;
            return res.status(200).json(rows);
        }
        catch (error) {
            console.error('[EstudiantesController] Error in listar:', error);
            return res.status(500).json({ error: 'Error interno al listar estudiantes' });
        }
    }
    async crear(req, res) {
        try {
            const { id, nombre, codigo, email } = req.body;
            // Check if code or email exists
            const existing = await (0, neon_1.default) `
        SELECT id FROM estudiantes
        WHERE codigo = ${codigo} OR email = ${email}
        LIMIT 1
      `;
            if (existing.length > 0) {
                return res.status(422).json({ error: 'El código o correo electrónico del alumno ya está registrado.' });
            }
            await (0, neon_1.default) `
        INSERT INTO estudiantes (id, nombre, codigo, email)
        VALUES (${id}, ${nombre}, ${codigo}, ${email})
      `;
            return res.status(201).json({ id, nombre, codigo, email });
        }
        catch (error) {
            console.error('[EstudiantesController] Error in crear:', error);
            return res.status(500).json({ error: 'Error interno al crear estudiante' });
        }
    }
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            await (0, neon_1.default) `
        DELETE FROM estudiantes
        WHERE id = ${id}
      `;
            return res.status(200).json({ message: 'Estudiante eliminado con éxito' });
        }
        catch (error) {
            console.error('[EstudiantesController] Error in eliminar:', error);
            return res.status(500).json({ error: 'Error interno al eliminar estudiante' });
        }
    }
}
exports.EstudiantesController = EstudiantesController;
