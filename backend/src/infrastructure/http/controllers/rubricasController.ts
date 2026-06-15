import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth';
import { RubricaRepo } from '../../db/repositories/RubricaRepo';
import { EvaluacionRepo } from '../../db/repositories/EvaluacionRepo';
import { CrearRubrica } from '../../../application/rubricas/CrearRubrica';
import { ObtenerRubrica } from '../../../application/rubricas/ObtenerRubrica';
import { ClonarRubrica } from '../../../application/rubricas/ClonarRubrica';
import { ObtenerHistorial } from '../../../application/rubricas/ObtenerHistorial';
import { ValidationError } from '../../../domain/errors/ValidationError';
import { RubricaEnUsoError } from '../../../domain/errors/RubricaEnUsoError';

const rubricaRepo = new RubricaRepo();
const evaluacionRepo = new EvaluacionRepo();

const handleError = (error: any, res: Response) => {
  if (error instanceof ValidationError) {
    if (error.message.includes('no encontrada') || error.message.includes('no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(422).json({ error: error.message });
  }
  if (error instanceof RubricaEnUsoError) {
    return res.status(409).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

// Zod validation schemas
export const nivelSchema = z.object({
  descripcion: z.string().min(1, 'La descripción del nivel es obligatoria'),
  puntos: z.number().min(0, 'Los puntos del nivel deben ser mayores o iguales a 0'),
});

export const criterioSchema = z.object({
  descripcion: z.string().min(1, 'La descripción del criterio es obligatoria'),
  ponderacion: z.number().min(0.01, 'La ponderación del criterio debe ser mayor a 0'),
  niveles: z.array(nivelSchema).min(1, 'Cada criterio debe tener al menos un nivel'),
});

export const rubricaSchema = z.object({
  titulo: z.string().min(3, 'El título de la rúbrica debe tener al menos 3 caracteres'),
  descripcion: z.string().default(''),
  criterios: z.array(criterioSchema).min(1, 'La rúbrica debe contener al menos un criterio'),
});

export const cloneSchema = z.object({
  originalId: z.string().uuid('ID original inválido'),
});

export class RubricasController {
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const useCase = new CrearRubrica(rubricaRepo, evaluacionRepo);
      const rubrica = await useCase.execute({
        ...req.body,
        creadoPor: req.user!.id,
      });
      res.status(201).json(rubrica);
    } catch (error) {
      handleError(error, res);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const useCase = new CrearRubrica(rubricaRepo, evaluacionRepo);
      const rubrica = await useCase.execute({
        ...req.body,
        id,
        creadoPor: req.user!.id,
      });
      res.status(200).json(rubrica);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const useCase = new ObtenerRubrica(rubricaRepo);
      const rubrica = await useCase.execute(id);
      res.status(200).json(rubrica);
    } catch (error) {
      handleError(error, res);
    }
  }

  async listActive(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const rubricas = await rubricaRepo.findAllActive();
      res.status(200).json(rubricas);
    } catch (error) {
      handleError(error, res);
    }
  }

  async clone(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const useCase = new ClonarRubrica(rubricaRepo);
      const rubrica = await useCase.execute({
        originalId: req.body.originalId,
        creadoPor: req.user!.id,
      });
      res.status(201).json(rubrica);
    } catch (error) {
      handleError(error, res);
    }
  }

  async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const useCase = new ObtenerHistorial(rubricaRepo);
      const history = await useCase.execute(id);
      res.status(200).json(history);
    } catch (error) {
      handleError(error, res);
    }
  }

  async archive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rubrica = await rubricaRepo.findById(id);
      if (!rubrica) {
        res.status(404).json({ error: `Rúbrica con ID ${id} no encontrada` });
        return;
      }
      await rubricaRepo.archive(id);
      res.status(200).json({ message: 'Rúbrica archivada con éxito (soft delete)' });
    } catch (error) {
      handleError(error, res);
    }
  }
}
