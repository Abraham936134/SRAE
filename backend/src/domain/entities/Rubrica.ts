import { Criterio } from './Criterio';
import { ValidationError } from '../errors/ValidationError';

export class Rubrica {
  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly descripcion: string,
    public readonly version: number,
    public readonly activa: boolean,
    public readonly creadoPor: string,
    public readonly criterios: Criterio[] = [],
    public readonly idOriginal: string | null = null,
    public readonly fechaCreacion: Date = new Date()
  ) {
    this.validarPonderaciones();
  }

  private validarPonderaciones(): void {
    if (this.criterios.length === 0) return;
    const totalPonderacion = this.criterios.reduce((acc, c) => acc + c.ponderacion, 0);
    // Use a small epsilon for floating point issues just in case, but let's check exactness
    if (Math.abs(totalPonderacion - 100) > 0.0001) {
      throw new ValidationError(`La suma de ponderaciones de los criterios debe ser exactamente 100%. Actualmente es ${totalPonderacion}%`);
    }
  }

  static create(
    id: string,
    titulo: string,
    descripcion: string,
    version: number,
    activa: boolean,
    creadoPor: string,
    criterios: Criterio[] = [],
    idOriginal: string | null = null,
    fechaCreacion: Date = new Date()
  ): Rubrica {
    return new Rubrica(id, titulo, descripcion, version, activa, creadoPor, criterios, idOriginal, fechaCreacion);
  }
}
