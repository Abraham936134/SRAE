"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearRubrica = void 0;
const crypto_1 = require("crypto");
const Rubrica_1 = require("../../domain/entities/Rubrica");
const Criterio_1 = require("../../domain/entities/Criterio");
const Nivel_1 = require("../../domain/entities/Nivel");
const RubricaEnUsoError_1 = require("../../domain/errors/RubricaEnUsoError");
const ValidationError_1 = require("../../domain/errors/ValidationError");
class CrearRubrica {
    rubricaRepo;
    evaluacionRepo;
    constructor(rubricaRepo, evaluacionRepo) {
        this.rubricaRepo = rubricaRepo;
        this.evaluacionRepo = evaluacionRepo;
    }
    async execute(input) {
        let version = 1;
        let rubricId = input.id || (0, crypto_1.randomUUID)();
        let idOriginal = null;
        let fechaCreacion = new Date();
        if (input.id) {
            // Modifying an existing rubric
            const existing = await this.rubricaRepo.findById(input.id);
            if (existing) {
                // Rule: "Una rúbrica con evaluaciones aplicadas no puede editarse, solo clonarse"
                const hasEvaluations = await this.evaluacionRepo.hasEvaluaciones(input.id);
                if (hasEvaluations) {
                    throw new RubricaEnUsoError_1.RubricaEnUsoError();
                }
                // Check if the rubric is inactive
                if (!existing.activa) {
                    throw new ValidationError_1.ValidationError('No se puede modificar una rúbrica archivada');
                }
                // Increment version
                version = existing.version + 1;
                idOriginal = existing.idOriginal;
                fechaCreacion = existing.fechaCreacion;
            }
        }
        // Convert inputs to domain objects and let the constructor run validations
        const criterios = input.criterios.map((cInput) => {
            const criterioId = (0, crypto_1.randomUUID)();
            const niveles = cInput.niveles.map((nInput) => Nivel_1.Nivel.create((0, crypto_1.randomUUID)(), criterioId, nInput.descripcion, nInput.puntos));
            return Criterio_1.Criterio.create(criterioId, rubricId, cInput.descripcion, cInput.ponderacion, niveles);
        });
        // Validations inside constructor check that ponderaciones sum to 100%
        const rubrica = Rubrica_1.Rubrica.create(rubricId, input.titulo, input.descripcion, version, true, // active by default
        input.creadoPor, criterios, idOriginal, fechaCreacion);
        await this.rubricaRepo.save(rubrica);
        return rubrica;
    }
}
exports.CrearRubrica = CrearRubrica;
