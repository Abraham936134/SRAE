import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { Usuario, UserRole } from '../../domain/entities/Usuario';
import { UsuarioRepo } from '../../infrastructure/db/repositories/UsuarioRepo';
import { ValidationError } from '../../domain/errors/ValidationError';

export interface CrearUsuarioInput {
  nombre: string;
  email: string;
  password?: string;
  rol: UserRole;
}

export class CrearUsuario {
  constructor(private readonly usuarioRepo: UsuarioRepo) {}

  async execute(input: CrearUsuarioInput): Promise<Omit<Usuario, 'password'>> {
    if (!input.password) {
      throw new ValidationError('La contraseña es obligatoria');
    }

    const existing = await this.usuarioRepo.findByEmail(input.email);
    if (existing) {
      throw new ValidationError(`El correo electrónico ${input.email} ya está registrado`);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const usuario = Usuario.create(
      randomUUID(),
      input.nombre,
      input.email,
      hashedPassword,
      input.rol
    );

    await this.usuarioRepo.save(usuario);

    // Return without password
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };
  }
}
