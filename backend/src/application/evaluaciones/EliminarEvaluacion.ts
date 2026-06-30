import { EvaluacionRepo } from '../../infrastructure/db/repositories/EvaluacionRepo';

export class EliminarEvaluacion {
  constructor(private readonly evaluacionRepo: EvaluacionRepo) {}

  async execute(id: string): Promise<void> {
    await this.evaluacionRepo.delete(id);
  }
}
