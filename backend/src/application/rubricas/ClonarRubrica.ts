import { randomUUID } from 'crypto';
import { Rubrica } from '../../domain/entities/Rubrica';
import { Criterio } from '../../domain/entities/Criterio';
import { Nivel } from '../../domain/entities/Nivel';
import { RubricaRepo } from '../../infrastructure/db/repositories/RubricaRepo';
import { ValidationError } from '../../domain/errors/ValidationError';

export interface ClonarRubricaInput {
  originalId: string;
  creadoPor: string;
}

export class ClonarRubrica {
  constructor(private readonly rubricaRepo: RubricaRepo) {}

  async execute(input: ClonarRubricaInput): Promise<Rubrica> {
    const original = await this.rubricaRepo.findById(input.originalId);
    if (!original) {
      throw new ValidationError(`Rúbrica original con ID ${input.originalId} no encontrada`);
    }

    const newRubricId = randomUUID();

    // Map criteria and levels to new instances
    const nuevosCriterios = original.criterios.map((c) => {
      const newCriterioId = randomUUID();
      const nuevosNiveles = c.niveles.map((n) =>
        Nivel.create(randomUUID(), newCriterioId, n.descripcion, n.puntos)
      );
      return Criterio.create(newCriterioId, newRubricId, c.descripcion, c.ponderacion, nuevosNiveles);
    });

    const clonada = Rubrica.create(
      newRubricId,
      `${original.titulo} (Clonada)`,
      original.descripcion,
      1, // Reset version to 1
      true, // active
      input.creadoPor,
      nuevosCriterios,
      original.id, // Track lineage via originalId
      new Date() // new creation date
    );

    await this.rubricaRepo.save(clonada);
    return clonada;
  }
}
