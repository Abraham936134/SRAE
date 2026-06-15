"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluacionRepo = void 0;
const neon_1 = __importDefault(require("../neon"));
const Evaluacion_1 = require("../../../domain/entities/Evaluacion");
class EvaluacionRepo {
    async save(evaluacion) {
        try {
            await (0, neon_1.default) `
        INSERT INTO evaluaciones (id, rubrica_id, rubrica_version, estudiante, evaluador_id, nota_final, respuestas, fecha)
        VALUES (
          ${evaluacion.id}, 
          ${evaluacion.rubricaId}, 
          ${evaluacion.rubricaVersion}, 
          ${evaluacion.estudiante}, 
          ${evaluacion.evaluadorId}, 
          ${evaluacion.notaFinal}, 
          ${JSON.stringify(evaluacion.respuestas)}, 
          ${evaluacion.fecha}
        )
      `;
        }
        catch (error) {
            console.error('Error en EvaluacionRepo.save:', error);
            throw error;
        }
    }
    async hasEvaluaciones(rubricaId) {
        try {
            const rows = await (0, neon_1.default) `
        SELECT 1 
        FROM evaluaciones 
        WHERE rubrica_id = ${rubricaId} 
        LIMIT 1
      `;
            return rows.length > 0;
        }
        catch (error) {
            console.error('Error en EvaluacionRepo.hasEvaluaciones:', error);
            throw error;
        }
    }
    async findByRubrica(rubricaId) {
        try {
            const rows = await (0, neon_1.default) `
        SELECT id, rubrica_id, rubrica_version, estudiante, evaluador_id, nota_final, respuestas, fecha 
        FROM evaluaciones 
        WHERE rubrica_id = ${rubricaId}
        ORDER BY fecha DESC
      `;
            return rows.map((row) => {
                const respuestas = typeof row.respuestas === 'string'
                    ? JSON.parse(row.respuestas)
                    : row.respuestas;
                return new Evaluacion_1.Evaluacion(row.id, row.rubrica_id, row.rubrica_version, row.estudiante, row.evaluador_id, respuestas, Number(row.nota_final), new Date(row.fecha));
            });
        }
        catch (error) {
            console.error('Error en EvaluacionRepo.findByRubrica:', error);
            throw error;
        }
    }
}
exports.EvaluacionRepo = EvaluacionRepo;
