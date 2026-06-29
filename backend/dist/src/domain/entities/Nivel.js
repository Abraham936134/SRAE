"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nivel = void 0;
class Nivel {
    id;
    criterioId;
    descripcion;
    puntos;
    constructor(id, criterioId, descripcion, puntos) {
        this.id = id;
        this.criterioId = criterioId;
        this.descripcion = descripcion;
        this.puntos = puntos;
    }
    static create(id, criterioId, descripcion, puntos) {
        return new Nivel(id, criterioId, descripcion, puntos);
    }
}
exports.Nivel = Nivel;
