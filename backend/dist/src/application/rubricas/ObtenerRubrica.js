"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObtenerRubrica = void 0;
const ValidationError_1 = require("../../domain/errors/ValidationError");
class ObtenerRubrica {
    rubricaRepo;
    constructor(rubricaRepo) {
        this.rubricaRepo = rubricaRepo;
    }
    async execute(id) {
        const rubrica = await this.rubricaRepo.findById(id);
        if (!rubrica) {
            throw new ValidationError_1.ValidationError(`Rúbrica con ID ${id} no encontrada`);
        }
        return rubrica;
    }
}
exports.ObtenerRubrica = ObtenerRubrica;
