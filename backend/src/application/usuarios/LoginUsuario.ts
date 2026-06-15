import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UsuarioRepo } from '../../infrastructure/db/repositories/UsuarioRepo';
import { ValidationError } from '../../domain/errors/ValidationError';

export interface LoginUsuarioInput {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  };
}

export class LoginUsuario {
  constructor(private readonly usuarioRepo: UsuarioRepo) {}

  async execute(input: LoginUsuarioInput): Promise<LoginResponse> {
    if (!input.password) {
      throw new ValidationError('La contraseña es obligatoria');
    }

    const usuario = await this.usuarioRepo.findByEmailOrUsername(input.email);
    if (!usuario || !usuario.password) {
      throw new ValidationError('Credenciales incorrectas');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, usuario.password);
    if (!isPasswordValid) {
      throw new ValidationError('Credenciales incorrectas');
    }

    // Sign JWT token
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';
    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '8h' });

    return {
      token,
      user: payload,
    };
  }
}
