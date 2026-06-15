import { ValidationError } from '../errors/ValidationError';

export interface RespuestaCriterio {
  criterioId: string;
  ponderacionCriterio: number; // e.g. 30
  nivelId: string;
  puntosNivel: number; // e.g. 15
}

export class Evaluacion {
  constructor(
    public readonly id: string,
    public readonly rubricaId: string,
    public readonly rubricaVersion: number,
    public readonly estudiante: string,
    public readonly evaluadorId: string,
    public readonly respuestas: RespuestaCriterio[],
    public readonly notaFinal: number,
    public readonly fecha: Date = new Date()
  ) {}

  static calcularNota(respuestas: RespuestaCriterio[]): number {
    if (respuestas.length === 0) return 0;
    
    // Σ (puntos_nivel × ponderacion_criterio / 100)
    const suma = respuestas.reduce((acc, resp) => {
      return acc + (resp.puntosNivel * resp.ponderacionCriterio / 100);
    }, 0);

    // Round to 2 decimals
    return Math.round((suma + Number.EPSILON) * 100) / 100;
  }

  static create(
    id: string,
    rubricaId: string,
    rubricaVersion: number,
    estudiante: string,
    evaluadorId: string,
    respuestas: RespuestaCriterio[],
    fecha: Date = new Date()
  ): Evaluacion {
    if (!estudiante || estudiante.trim() === '') {
      throw new ValidationError('El nombre del estudiante es obligatorio');
    }
    if (respuestas.length === 0) {
      throw new ValidationError('La evaluación debe contener al menos una respuesta');
    }
    const notaFinal = this.calcularNota(respuestas);
    return new Evaluacion(id, rubricaId, rubricaVersion, estudiante, evaluadorId, respuestas, notaFinal, fecha);
  }
}
