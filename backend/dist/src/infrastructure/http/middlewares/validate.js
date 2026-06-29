"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(422).json({
                error: 'Errores de validación de datos',
                details: result.error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
            return;
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
