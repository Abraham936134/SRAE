import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import usuariosRouter from './infrastructure/http/routes/usuarios';
import rubricasRouter from './infrastructure/http/routes/rubricas';
import evaluacionesRouter from './infrastructure/http/routes/evaluaciones';
import reportesRouter from './infrastructure/http/routes/reportes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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
