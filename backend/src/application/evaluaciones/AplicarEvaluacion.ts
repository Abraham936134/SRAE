import { randomUUID } from 'crypto';
import { Evaluacion, RespuestaCriterio } from '../../domain/entities/Evaluacion';
import { RubricaRepo } from '../../infrastructure/db/repositories/RubricaRepo';
import { EvaluacionRepo } from '../../infrastructure/db/repositories/EvaluacionRepo';
import { ValidationError } from '../../domain/errors/ValidationError';

export interface SeleccionRespuesta {
  criterioId: string;
  nivelId: string;
}

export interface AplicarEvaluacionInput {
  id?: string;
  rubricaId: string;
  estudiante: string;
  evaluadorId: string;
  respuestas: SeleccionRespuesta[];
}

export class AplicarEvaluacion {
  constructor(
    private readonly rubricaRepo: RubricaRepo,
    private readonly evaluacionRepo: EvaluacionRepo
  ) {}

  async execute(input: AplicarEvaluacionInput): Promise<Evaluacion> {
    const rubrica = await this.rubricaRepo.findById(input.rubricaId);
    if (!rubrica) {
      throw new ValidationError(`Rúbrica con ID ${input.rubricaId} no encontrada`);
    }

    if (!rubrica.activa) {
      throw new ValidationError('No se pueden aplicar evaluaciones a una rúbrica archivada');
    }

    // Map client answers (criterioId + nivelId) to Respuestas detail (weight, points)
    const respuestasDetalle: RespuestaCriterio[] = [];

    // Verify all criteria of the rubric are answered
    for (const criterio of rubrica.criterios) {
      const seleccion = input.respuestas.find((r) => r.criterioId === criterio.id);
      if (!seleccion) {
        throw new ValidationError(`Falta evaluar el criterio "${criterio.descripcion}"`);
      }

      const nivel = criterio.niveles.find((n) => n.id === seleccion.nivelId);
      if (!nivel) {
        throw new ValidationError(`El nivel seleccionado con ID ${seleccion.nivelId} no pertenece al criterio "${criterio.descripcion}"`);
      }

      respuestasDetalle.push({
        criterioId: criterio.id,
        ponderacionCriterio: criterio.ponderacion,
        nivelId: nivel.id,
        puntosNivel: nivel.puntos,
      });
    }

    // Check if extra criteria responses are sent that are not part of this rubric
    if (input.respuestas.length > rubrica.criterios.length) {
      throw new ValidationError('Se enviaron respuestas para criterios que no pertenecen a esta rúbrica');
    }

    const evalId = input.id || randomUUID();

    // Create Evaluacion entity (performs grade calculation internally)
    const evaluacion = Evaluacion.create(
      evalId,
      rubrica.id,
      rubrica.version,
      input.estudiante,
      input.evaluadorId,
      respuestasDetalle
    );

    await this.evaluacionRepo.save(evaluacion);
    return evaluacion;
  }
}
