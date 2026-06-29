"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluacionesController = exports.aplicarEvaluacionSchema = exports.seleccionRespuestaSchema = void 0;
const zod_1 = require("zod");
const RubricaRepo_1 = require("../../db/repositories/RubricaRepo");
const EvaluacionRepo_1 = require("../../db/repositories/EvaluacionRepo");
const AplicarEvaluacion_1 = require("../../../application/evaluaciones/AplicarEvaluacion");
const ValidationError_1 = require("../../../domain/errors/ValidationError");
const rubricaRepo = new RubricaRepo_1.RubricaRepo();
const evaluacionRepo = new EvaluacionRepo_1.EvaluacionRepo();
const handleError = (error, res) => {
    if (error instanceof ValidationError_1.ValidationError) {
        if (error.message.includes('no encontrada') || error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(422).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
};
// Zod validation schemas
exports.seleccionRespuestaSchema = zod_1.z.object({
    criterioId: zod_1.z.string().uuid('ID de criterio inválido'),
    nivelId: zod_1.z.string().uuid('ID de nivel inválido'),
});
exports.aplicarEvaluacionSchema = zod_1.z.object({
    rubricaId: zod_1.z.string().uuid('ID de rúbrica inválido'),
    estudiante: zod_1.z.string().min(1, 'El nombre del estudiante es obligatorio'),
    respuestas: zod_1.z.array(exports.seleccionRespuestaSchema).min(1, 'Debe proporcionar al menos una respuesta'),
});
class EvaluacionesController {
    async apply(req, res) {
        try {
            const useCase = new AplicarEvaluacion_1.AplicarEvaluacion(rubricaRepo, evaluacionRepo);
            const evaluacion = await useCase.execute({
                ...req.body,
                evaluadorId: req.user.id,
            });
            res.status(201).json(evaluacion);
        }
        catch (error) {
            handleError(error, res);
        }
    }
}
exports.EvaluacionesController = EvaluacionesController;
