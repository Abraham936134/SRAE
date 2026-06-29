"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubricaEnUsoError = void 0;
class RubricaEnUsoError extends Error {
    constructor(message = 'No se puede modificar una rúbrica que ya tiene evaluaciones asociadas') {
        super(message);
        this.name = 'RubricaEnUsoError';
        Object.setPrototypeOf(this, RubricaEnUsoError.prototype);
    }
}
exports.RubricaEnUsoError = RubricaEnUsoError;
