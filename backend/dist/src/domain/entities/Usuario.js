"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    id;
    nombre;
    email;
    password;
    rol;
    constructor(id, nombre, email, password, rol = 'docente') {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.rol = rol;
    }
    static create(id, nombre, email, password, rol = 'docente') {
        return new Usuario(id, nombre, email, password, rol);
    }
}
exports.Usuario = Usuario;
