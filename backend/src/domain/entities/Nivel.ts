export class Nivel {
  constructor(
    public readonly id: string,
    public readonly criterioId: string,
    public readonly descripcion: string,
    public readonly puntos: number
  ) {}

  static create(id: string, criterioId: string, descripcion: string, puntos: number): Nivel {
    return new Nivel(id, criterioId, descripcion, puntos);
  }
}
