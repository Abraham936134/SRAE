"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubricasController = exports.cloneSchema = exports.rubricaSchema = exports.criterioSchema = exports.nivelSchema = void 0;
const zod_1 = require("zod");
const RubricaRepo_1 = require("../../db/repositories/RubricaRepo");
const EvaluacionRepo_1 = require("../../db/repositories/EvaluacionRepo");
const CrearRubrica_1 = require("../../../application/rubricas/CrearRubrica");
const ObtenerRubrica_1 = require("../../../application/rubricas/ObtenerRubrica");
const ClonarRubrica_1 = require("../../../application/rubricas/ClonarRubrica");
const ObtenerHistorial_1 = require("../../../application/rubricas/ObtenerHistorial");
const ValidationError_1 = require("../../../domain/errors/ValidationError");
const RubricaEnUsoError_1 = require("../../../domain/errors/RubricaEnUsoError");
const rubricaRepo = new RubricaRepo_1.RubricaRepo();
const evaluacionRepo = new EvaluacionRepo_1.EvaluacionRepo();
const handleError = (error, res) => {
    if (error instanceof ValidationError_1.ValidationError) {
        if (error.message.includes('no encontrada') || error.message.includes('no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        return res.status(422).json({ error: error.message });
    }
    if (error instanceof RubricaEnUsoError_1.RubricaEnUsoError) {
        return res.status(409).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
};
// Zod validation schemas
exports.nivelSchema = zod_1.z.object({
    descripcion: zod_1.z.string().min(1, 'La descripción del nivel es obligatoria'),
    puntos: zod_1.z.number().min(0, 'Los puntos del nivel deben ser mayores o iguales a 0'),
});
exports.criterioSchema = zod_1.z.object({
    descripcion: zod_1.z.string().min(1, 'La descripción del criterio es obligatoria'),
    ponderacion: zod_1.z.number().min(0.01, 'La ponderación del criterio debe ser mayor a 0'),
    niveles: zod_1.z.array(exports.nivelSchema).min(1, 'Cada criterio debe tener al menos un nivel'),
});
exports.rubricaSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(3, 'El título de la rúbrica debe tener al menos 3 caracteres'),
    descripcion: zod_1.z.string().default(''),
    criterios: zod_1.z.array(exports.criterioSchema).min(1, 'La rúbrica debe contener al menos un criterio'),
});
exports.cloneSchema = zod_1.z.object({
    originalId: zod_1.z.string().uuid('ID original inválido'),
});
class RubricasController {
    async create(req, res) {
        try {
            const useCase = new CrearRubrica_1.CrearRubrica(rubricaRepo, evaluacionRepo);
            const rubrica = await useCase.execute({
                ...req.body,
                creadoPor: req.user.id,
            });
            res.status(201).json(rubrica);
        }
        catch (error) {
            handleError(error, res);
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const useCase = new CrearRubrica_1.CrearRubrica(rubricaRepo, evaluacionRepo);
            const rubrica = await useCase.execute({
                ...req.body,
                id,
                creadoPor: req.user.id,
            });
            res.status(200).json(rubrica);
        }
        catch (error) {
            handleError(error, res);
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const useCase = new ObtenerRubrica_1.ObtenerRubrica(rubricaRepo);
            const rubrica = await useCase.execute(id);
            res.status(200).json(rubrica);
        }
        catch (error) {
            handleError(error, res);
        }
    }
    async listActive(_req, res) {
        try {
            const rubricas = await rubricaRepo.findAllActive();
            res.status(200).json(rubricas);
        }
        catch (error) {
            handleError(error, res);
        }
    }
    async clone(req, res) {
        try {
            const useCase = new ClonarRubrica_1.ClonarRubrica(rubricaRepo);
            const rubrica = await useCase.execute({
                originalId: req.body.originalId,
                creadoPor: req.user.id,
            });
            res.status(201).json(rubrica);
        }
        catch (error) {
            handleError(error, res);
        }
    }
    async getHistory(req, res) {
        try {
            const { id } = req.params;
            const useCase = new ObtenerHistorial_1.ObtenerHistorial(rubricaRepo);
            const history = await useCase.execute(id);
            res.status(200).json(history);
        }
        catch (error) {
            handleError(error, res);
        }
    }
    async archive(req, res) {
        try {
            const { id } = req.params;
            const rubrica = await rubricaRepo.findById(id);
            if (!rubrica) {
                res.status(404).json({ error: `Rúbrica con ID ${id} no encontrada` });
                return;
            }
            await rubricaRepo.archive(id);
            res.status(200).json({ message: 'Rúbrica archivada con éxito (soft delete)' });
        }
        catch (error) {
            handleError(error, res);
        }
    }
}
exports.RubricasController = RubricasController;
