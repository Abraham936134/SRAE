import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth';
import { RubricaRepo } from '../../db/repositories/RubricaRepo';
import { EvaluacionRepo } from '../../db/repositories/EvaluacionRepo';
import { AplicarEvaluacion } from '../../../application/evaluaciones/AplicarEvaluacion';
import { EliminarEvaluacion } from '../../../application/evaluaciones/EliminarEvaluacion';
import { ValidationError } from '../../../domain/errors/ValidationError';

const rubricaRepo = new RubricaRepo();
const evaluacionRepo = new EvaluacionRepo();

const handleError = (error: any, res: Response) => {
  if (error instanceof ValidationError) {
    if (error.message.includes('no encontrada') || error.message.includes('no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(422).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

// Zod validation schemas
export const seleccionRespuestaSchema = z.object({
  criterioId: z.string().uuid('ID de criterio inválido'),
  nivelId: z.string().uuid('ID de nivel inválido'),
});

export const aplicarEvaluacionSchema = z.object({
  rubricaId: z.string().uuid('ID de rúbrica inválido'),
  estudiante: z.string().min(1, 'El nombre del estudiante es obligatorio'),
  respuestas: z.array(seleccionRespuestaSchema).min(1, 'Debe proporcionar al menos una respuesta'),
});

export class EvaluacionesController {
  async apply(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const useCase = new AplicarEvaluacion(rubricaRepo, evaluacionRepo);
      const evaluacion = await useCase.execute({
        ...req.body,
        evaluadorId: req.user!.id,
      });
      res.status(201).json(evaluacion);
    } catch (error) {
      handleError(error, res);
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const useCase = new AplicarEvaluacion(rubricaRepo, evaluacionRepo);
      const evaluacion = await useCase.execute({
        ...req.body,
        id,
        evaluadorId: req.user!.id,
      });
      res.status(200).json(evaluacion);
    } catch (error) {
      handleError(error, res);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const useCase = new EliminarEvaluacion(evaluacionRepo);
      await useCase.execute(id);
      res.status(200).json({ message: 'Evaluación eliminada con éxito' });
    } catch (error) {
      handleError(error, res);
    }
  }
}
