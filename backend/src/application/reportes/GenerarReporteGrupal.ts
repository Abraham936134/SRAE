import { EvaluacionRepo } from '../../infrastructure/db/repositories/EvaluacionRepo';
import { RubricaRepo } from '../../infrastructure/db/repositories/RubricaRepo';
import { ValidationError } from '../../domain/errors/ValidationError';

export interface ReporteGrupalOutput {
  rubricaId: string;
  tituloRubrica: string;
  totalEvaluaciones: number;
  promedioGeneral: number;
  notaMaxima: number;
  notaMinima: number;
  criteriosStats: {
    criterioId: string;
    descripcion: string;
    ponderacion: number;
    promedioPuntos: number;
  }[];
}

export class GenerarReporteGrupal {
  constructor(
    private readonly rubricaRepo: RubricaRepo,
    private readonly evaluacionRepo: EvaluacionRepo
  ) {}

  async execute(rubricaId: string): Promise<ReporteGrupalOutput> {
    const rubrica = await this.rubricaRepo.findById(rubricaId);
    if (!rubrica) {
      throw new ValidationError(`Rúbrica con ID ${rubricaId} no encontrada`);
    }

    const evaluaciones = await this.evaluacionRepo.findByRubrica(rubricaId);
    if (evaluaciones.length === 0) {
      return {
        rubricaId: rubrica.id,
        tituloRubrica: rubrica.titulo,
        totalEvaluaciones: 0,
        promedioGeneral: 0,
        notaMaxima: 0,
        notaMinima: 0,
        criteriosStats: rubrica.criterios.map((c) => ({
          criterioId: c.id,
          descripcion: c.descripcion,
          ponderacion: c.ponderacion,
          promedioPuntos: 0,
        })),
      };
    }

    // Calculations
    const notas = evaluaciones.map((e) => e.notaFinal);
    const sumaNotas = notas.reduce((acc, val) => acc + val, 0);
    const promedioGeneral = Math.round((sumaNotas / evaluaciones.length + Number.EPSILON) * 100) / 100;
    const notaMaxima = Math.max(...notas);
    const notaMinima = Math.min(...notas);

    // Compute average score per criterion
    const criteriosStats = rubrica.criterios.map((criterio) => {
      let sumaPuntos = 0;
      let count = 0;

      for (const e of evaluaciones) {
        const resp = e.respuestas.find((r) => r.criterioId === criterio.id);
        if (resp) {
          sumaPuntos += resp.puntosNivel;
          count++;
        }
      }

      const promedioPuntos = count > 0 
        ? Math.round((sumaPuntos / count + Number.EPSILON) * 100) / 100 
        : 0;

      return {
        criterioId: criterio.id,
        descripcion: criterio.descripcion,
        ponderacion: criterio.ponderacion,
        promedioPuntos,
      };
    });

    return {
      rubricaId: rubrica.id,
      tituloRubrica: rubrica.titulo,
      totalEvaluaciones: evaluaciones.length,
      promedioGeneral,
      notaMaxima,
      notaMinima,
      criteriosStats,
    };
  }
}
