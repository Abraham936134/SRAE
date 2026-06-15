import { RubricaRepo } from '../../infrastructure/db/repositories/RubricaRepo';
import { ValidationError } from '../../domain/errors/ValidationError';

export class ObtenerHistorial {
  constructor(private readonly rubricaRepo: RubricaRepo) {}

  async execute(rubricaId: string): Promise<any[]> {
    const rubrica = await this.rubricaRepo.findById(rubricaId);
    if (!rubrica) {
      throw new ValidationError(`Rúbrica con ID ${rubricaId} no encontrada`);
    }
    return this.rubricaRepo.findHistory(rubricaId);
  }
}
