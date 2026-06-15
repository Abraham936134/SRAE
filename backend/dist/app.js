"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const usuarios_1 = __importDefault(require("./infrastructure/http/routes/usuarios"));
const rubricas_1 = __importDefault(require("./infrastructure/http/routes/rubricas"));
const evaluaciones_1 = __importDefault(require("./infrastructure/http/routes/evaluaciones"));
const reportes_1 = __importDefault(require("./infrastructure/http/routes/reportes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SRAE - Sistema de Rubricas Analiticas para Evaluacion',
            version: '1.0.0',
            description: 'API REST para gestion de rubricas academicas - Universidad Ricardo Palma',
        },
        servers: [
            {
                url: 'https://srae-backend.onrender.com',
                description: 'Servidor en Producción (Render)',
            },
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [
        './src/infrastructure/http/routes/*.ts',
        './dist/src/infrastructure/http/routes/*.js',
        `${__dirname}/infrastructure/http/routes/*.js`,
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Root route returning status and link to documentation
app.get('/', (_req, res) => {
    res.status(200).json({
        status: 'online',
        message: 'SRAE API is running',
        documentation: '/api-docs',
        timestamp: new Date()
    });
});
// Routes
app.use('/api/usuarios', usuarios_1.default);
app.use('/api/rubricas', rubricas_1.default);
app.use('/api/evaluaciones', evaluaciones_1.default);
app.use('/api/reportes', reportes_1.default);
// Basic health check route
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled Global Error:', err);
    res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
});
exports.default = app;
