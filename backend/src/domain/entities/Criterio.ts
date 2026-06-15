import { Nivel } from './Nivel';

export class Criterio {
  constructor(
    public readonly id: string,
    public readonly rubricaId: string,
    public readonly descripcion: string,
    public readonly ponderacion: number,
    public readonly niveles: Nivel[] = []
  ) {}

  static create(id: string, rubricaId: string, descripcion: string, ponderacion: number, niveles: Nivel[] = []): Criterio {
    return new Criterio(id, rubricaId, descripcion, ponderacion, niveles);
  }
}
