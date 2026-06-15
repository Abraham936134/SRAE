"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesMiddleware = void 0;
const rolesMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Usuario no autenticado' });
            return;
        }
        if (!allowedRoles.includes(req.user.rol)) {
            res.status(403).json({ error: 'Acceso denegado: Permisos insuficientes' });
            return;
        }
        next();
    };
};
exports.rolesMiddleware = rolesMiddleware;
