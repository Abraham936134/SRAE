"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rubrica = void 0;
const ValidationError_1 = require("../errors/ValidationError");
class Rubrica {
    id;
    titulo;
    descripcion;
    version;
    activa;
    creadoPor;
    criterios;
    idOriginal;
    fechaCreacion;
    constructor(id, titulo, descripcion, version, activa, creadoPor, criterios = [], idOriginal = null, fechaCreacion = new Date()) {
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.version = version;
        this.activa = activa;
        this.creadoPor = creadoPor;
        this.criterios = criterios;
        this.idOriginal = idOriginal;
        this.fechaCreacion = fechaCreacion;
        this.validarPonderaciones();
    }
    validarPonderaciones() {
        if (this.criterios.length === 0)
            return;
        const totalPonderacion = this.criterios.reduce((acc, c) => acc + c.ponderacion, 0);
        // Use a small epsilon for floating point issues just in case, but let's check exactness
        if (Math.abs(totalPonderacion - 100) > 0.0001) {
            throw new ValidationError_1.ValidationError(`La suma de ponderaciones de los criterios debe ser exactamente 100%. Actualmente es ${totalPonderacion}%`);
        }
    }
    static create(id, titulo, descripcion, version, activa, creadoPor, criterios = [], idOriginal = null, fechaCreacion = new Date()) {
        return new Rubrica(id, titulo, descripcion, version, activa, creadoPor, criterios, idOriginal, fechaCreacion);
    }
}
exports.Rubrica = Rubrica;
