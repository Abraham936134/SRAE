import { Rubrica } from '../../domain/entities/Rubrica';
import { RubricaRepo } from '../../infrastructure/db/repositories/RubricaRepo';
import { ValidationError } from '../../domain/errors/ValidationError';

export class ObtenerRubrica {
  constructor(private readonly rubricaRepo: RubricaRepo) {}

  async execute(id: string): Promise<Rubrica> {
    const rubrica = await this.rubricaRepo.findById(id);
    if (!rubrica) {
      throw new ValidationError(`Rúbrica con ID ${id} no encontrada`);
    }
    return rubrica;
  }
}
