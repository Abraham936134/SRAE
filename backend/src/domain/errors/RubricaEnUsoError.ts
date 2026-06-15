export class RubricaEnUsoError extends Error {
  constructor(message: string = 'No se puede modificar una rúbrica que ya tiene evaluaciones asociadas') {
    super(message);
    this.name = 'RubricaEnUsoError';
    Object.setPrototypeOf(this, RubricaEnUsoError.prototype);
  }
}
