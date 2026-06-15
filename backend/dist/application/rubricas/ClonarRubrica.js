"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClonarRubrica = void 0;
const crypto_1 = require("crypto");
const Rubrica_1 = require("../../domain/entities/Rubrica");
const Criterio_1 = require("../../domain/entities/Criterio");
const Nivel_1 = require("../../domain/entities/Nivel");
const ValidationError_1 = require("../../domain/errors/ValidationError");
class ClonarRubrica {
    rubricaRepo;
    constructor(rubricaRepo) {
        this.rubricaRepo = rubricaRepo;
    }
    async execute(input) {
        const original = await this.rubricaRepo.findById(input.originalId);
        if (!original) {
            throw new ValidationError_1.ValidationError(`Rúbrica original con ID ${input.originalId} no encontrada`);
        }
        const newRubricId = (0, crypto_1.randomUUID)();
        // Map criteria and levels to new instances
        const nuevosCriterios = original.criterios.map((c) => {
            const newCriterioId = (0, crypto_1.randomUUID)();
            const nuevosNiveles = c.niveles.map((n) => Nivel_1.Nivel.create((0, crypto_1.randomUUID)(), newCriterioId, n.descripcion, n.puntos));
            return Criterio_1.Criterio.create(newCriterioId, newRubricId, c.descripcion, c.ponderacion, nuevosNiveles);
        });
        const clonada = Rubrica_1.Rubrica.create(newRubricId, `${original.titulo} (Clonada)`, original.descripcion, 1, // Reset version to 1
        true, // active
        input.creadoPor, nuevosCriterios, original.id, // Track lineage via originalId
        new Date() // new creation date
        );
        await this.rubricaRepo.save(clonada);
        return clonada;
    }
}
exports.ClonarRubrica = ClonarRubrica;
