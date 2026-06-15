"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Criterio = void 0;
class Criterio {
    id;
    rubricaId;
    descripcion;
    ponderacion;
    niveles;
    constructor(id, rubricaId, descripcion, ponderacion, niveles = []) {
        this.id = id;
        this.rubricaId = rubricaId;
        this.descripcion = descripcion;
        this.ponderacion = ponderacion;
        this.niveles = niveles;
    }
    static create(id, rubricaId, descripcion, ponderacion, niveles = []) {
        return new Criterio(id, rubricaId, descripcion, ponderacion, niveles);
    }
}
exports.Criterio = Criterio;
