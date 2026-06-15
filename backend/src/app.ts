import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import usuariosRouter from './infrastructure/http/routes/usuarios';
import rubricasRouter from './infrastructure/http/routes/rubricas';
import evaluacionesRouter from './infrastructure/http/routes/evaluaciones';
import reportesRouter from './infrastructure/http/routes/reportes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use('/api/usuarios', usuariosRouter);
app.use('/api/rubricas', rubricasRouter);
app.use('/api/evaluaciones', evaluacionesRouter);
app.use('/api/reportes', reportesRouter);

// Basic health check route
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Global Error:', err);
  res.status(500).json({ error: 'Ha ocurrido un error inesperado en el servidor' });
});

export default app;
