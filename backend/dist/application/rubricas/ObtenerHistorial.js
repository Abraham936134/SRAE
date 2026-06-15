"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObtenerHistorial = void 0;
const ValidationError_1 = require("../../domain/errors/ValidationError");
class ObtenerHistorial {
    rubricaRepo;
    constructor(rubricaRepo) {
        this.rubricaRepo = rubricaRepo;
    }
    async execute(rubricaId) {
        const rubrica = await this.rubricaRepo.findById(rubricaId);
        if (!rubrica) {
            throw new ValidationError_1.ValidationError(`Rúbrica con ID ${rubricaId} no encontrada`);
        }
        return this.rubricaRepo.findHistory(rubricaId);
    }
}
exports.ObtenerHistorial = ObtenerHistorial;
