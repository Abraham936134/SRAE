"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AplicarEvaluacion = void 0;
const crypto_1 = require("crypto");
const Evaluacion_1 = require("../../domain/entities/Evaluacion");
const ValidationError_1 = require("../../domain/errors/ValidationError");
class AplicarEvaluacion {
    rubricaRepo;
    evaluacionRepo;
    constructor(rubricaRepo, evaluacionRepo) {
        this.rubricaRepo = rubricaRepo;
        this.evaluacionRepo = evaluacionRepo;
    }
    async execute(input) {
        const rubrica = await this.rubricaRepo.findById(input.rubricaId);
        if (!rubrica) {
            throw new ValidationError_1.ValidationError(`Rúbrica con ID ${input.rubricaId} no encontrada`);
        }
        if (!rubrica.activa) {
            throw new ValidationError_1.ValidationError('No se pueden aplicar evaluaciones a una rúbrica archivada');
        }
        // Map client answers (criterioId + nivelId) to Respuestas detail (weight, points)
        const respuestasDetalle = [];
        // Verify all criteria of the rubric are answered
        for (const criterio of rubrica.criterios) {
            const seleccion = input.respuestas.find((r) => r.criterioId === criterio.id);
            if (!seleccion) {
                throw new ValidationError_1.ValidationError(`Falta evaluar el criterio "${criterio.descripcion}"`);
            }
            const nivel = criterio.niveles.find((n) => n.id === seleccion.nivelId);
            if (!nivel) {
                throw new ValidationError_1.ValidationError(`El nivel seleccionado con ID ${seleccion.nivelId} no pertenece al criterio "${criterio.descripcion}"`);
            }
            respuestasDetalle.push({
                criterioId: criterio.id,
                ponderacionCriterio: criterio.ponderacion,
                nivelId: nivel.id,
                puntosNivel: nivel.puntos,
            });
        }
        // Check if extra criteria responses are sent that are not part of this rubric
        if (input.respuestas.length > rubrica.criterios.length) {
            throw new ValidationError_1.ValidationError('Se enviaron respuestas para criterios que no pertenecen a esta rúbrica');
        }
        // Create Evaluacion entity (performs grade calculation internally)
        const evaluacion = Evaluacion_1.Evaluacion.create((0, crypto_1.randomUUID)(), rubrica.id, rubrica.version, input.estudiante, input.evaluadorId, respuestasDetalle);
        await this.evaluacionRepo.save(evaluacion);
        return evaluacion;
    }
}
exports.AplicarEvaluacion = AplicarEvaluacion;
