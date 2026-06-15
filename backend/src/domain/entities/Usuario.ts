export type UserRole = 'docente' | 'administrador' | 'auxiliar';

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly email: string,
    public readonly password?: string,
    public readonly rol: UserRole = 'docente'
  ) {}

  static create(id: string, nombre: string, email: string, password?: string, rol: UserRole = 'docente'): Usuario {
    return new Usuario(id, nombre, email, password, rol);
  }
}
