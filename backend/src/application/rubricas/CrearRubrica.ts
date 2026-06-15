import { randomUUID } from 'crypto';
import { Rubrica } from '../../domain/entities/Rubrica';
import { Criterio } from '../../domain/entities/Criterio';
import { Nivel } from '../../domain/entities/Nivel';
import { RubricaRepo } from '../../infrastructure/db/repositories/RubricaRepo';
import { EvaluacionRepo } from '../../infrastructure/db/repositories/EvaluacionRepo';
import { RubricaEnUsoError } from '../../domain/errors/RubricaEnUsoError';
import { ValidationError } from '../../domain/errors/ValidationError';

export interface NivelInput {
  descripcion: string;
  puntos: number;
}

export interface CriterioInput {
  descripcion: string;
  ponderacion: number;
  niveles: NivelInput[];
}

export interface CrearRubricaInput {
  id?: string; // Optional for new rubrics, required for modifications
  titulo: string;
  descripcion: string;
  criterios: CriterioInput[];
  creadoPor: string;
}

export class CrearRubrica {
  constructor(
    private readonly rubricaRepo: RubricaRepo,
    private readonly evaluacionRepo: EvaluacionRepo
  ) {}

  async execute(input: CrearRubricaInput): Promise<Rubrica> {
    let version = 1;
    let rubricId = input.id || randomUUID();
    let idOriginal: string | null = null;
    let fechaCreacion = new Date();

    if (input.id) {
      // Modifying an existing rubric
      const existing = await this.rubricaRepo.findById(input.id);
      if (existing) {
        // Rule: "Una rúbrica con evaluaciones aplicadas no puede editarse, solo clonarse"
        const hasEvaluations = await this.evaluacionRepo.hasEvaluaciones(input.id);
        if (hasEvaluations) {
          throw new RubricaEnUsoError();
        }

        // Check if the rubric is inactive
        if (!existing.activa) {
          throw new ValidationError('No se puede modificar una rúbrica archivada');
        }

        // Increment version
        version = existing.version + 1;
        idOriginal = existing.idOriginal;
        fechaCreacion = existing.fechaCreacion;
      }
    }

    // Convert inputs to domain objects and let the constructor run validations
    const criterios: Criterio[] = input.criterios.map((cInput) => {
      const criterioId = randomUUID();
      const niveles = cInput.niveles.map((nInput) =>
        Nivel.create(randomUUID(), criterioId, nInput.descripcion, nInput.puntos)
      );
      return Criterio.create(criterioId, rubricId, cInput.descripcion, cInput.ponderacion, niveles);
    });

    // Validations inside constructor check that ponderaciones sum to 100%
    const rubrica = Rubrica.create(
      rubricId,
      input.titulo,
      input.descripcion,
      version,
      true, // active by default
      input.creadoPor,
      criterios,
      idOriginal,
      fechaCreacion
    );

    await this.rubricaRepo.save(rubrica);
    return rubrica;
  }
}
