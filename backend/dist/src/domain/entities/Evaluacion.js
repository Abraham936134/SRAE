"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Evaluacion = void 0;
const ValidationError_1 = require("../errors/ValidationError");
class Evaluacion {
    id;
    rubricaId;
    rubricaVersion;
    estudiante;
    evaluadorId;
    respuestas;
    notaFinal;
    fecha;
    constructor(id, rubricaId, rubricaVersion, estudiante, evaluadorId, respuestas, notaFinal, fecha = new Date()) {
        this.id = id;
        this.rubricaId = rubricaId;
        this.rubricaVersion = rubricaVersion;
        this.estudiante = estudiante;
        this.evaluadorId = evaluadorId;
        this.respuestas = respuestas;
        this.notaFinal = notaFinal;
        this.fecha = fecha;
    }
    static calcularNota(respuestas) {
        if (respuestas.length === 0)
            return 0;
        // Σ (puntos_nivel × ponderacion_criterio / 100)
        const suma = respuestas.reduce((acc, resp) => {
            return acc + (resp.puntosNivel * resp.ponderacionCriterio / 100);
        }, 0);
        // Round to 2 decimals
        return Math.round((suma + Number.EPSILON) * 100) / 100;
    }
    static create(id, rubricaId, rubricaVersion, estudiante, evaluadorId, respuestas, fecha = new Date()) {
        if (!estudiante || estudiante.trim() === '') {
            throw new ValidationError_1.ValidationError('El nombre del estudiante es obligatorio');
        }
        if (respuestas.length === 0) {
            throw new ValidationError_1.ValidationError('La evaluación debe contener al menos una respuesta');
        }
        const notaFinal = this.calcularNota(respuestas);
        return new Evaluacion(id, rubricaId, rubricaVersion, estudiante, evaluadorId, respuestas, notaFinal, fecha);
    }
}
exports.Evaluacion = Evaluacion;
