import sql from '../neon';
import { Usuario, UserRole } from '../../../domain/entities/Usuario';

export class UsuarioRepo {
  async findByEmail(email: string): Promise<Usuario | null> {
    try {
      const rows = await sql`SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ${email} LIMIT 1`;
      if (rows.length === 0) return null;
      const row = rows[0];
      return Usuario.create(row.id, row.nombre, row.email, row.password, row.rol as UserRole);
    } catch (error) {
      console.error('Error en UsuarioRepo.findByEmail:', error);
      throw error;
    }
  }

  async findByEmailOrUsername(identifier: string): Promise<Usuario | null> {
    try {
      const emailPattern = identifier.includes('@') ? identifier : `${identifier}@urp.edu.pe`;
      const rows = await sql`
        SELECT id, nombre, email, password, rol 
        FROM usuarios 
        WHERE email = ${identifier} 
           OR email = ${emailPattern} 
        LIMIT 1
      `;
      if (rows.length === 0) return null;
      const row = rows[0];
      return Usuario.create(row.id, row.nombre, row.email, row.password, row.rol as UserRole);
    } catch (error) {
      console.error('Error en UsuarioRepo.findByEmailOrUsername:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Usuario | null> {
    try {
      const rows = await sql`SELECT id, nombre, email, password, rol FROM usuarios WHERE id = ${id} LIMIT 1`;
      if (rows.length === 0) return null;
      const row = rows[0];
      return Usuario.create(row.id, row.nombre, row.email, row.password, row.rol as UserRole);
    } catch (error) {
      console.error('Error en UsuarioRepo.findById:', error);
      throw error;
    }
  }

  async save(usuario: Usuario): Promise<void> {
    try {
      await sql`
        INSERT INTO usuarios (id, nombre, email, password, rol)
        VALUES (${usuario.id}, ${usuario.nombre}, ${usuario.email}, ${usuario.password || ''}, ${usuario.rol})
        ON CONFLICT (id) DO UPDATE
        SET nombre = EXCLUDED.nombre, email = EXCLUDED.email, password = EXCLUDED.password, rol = EXCLUDED.rol
      `;
    } catch (error) {
      console.error('Error en UsuarioRepo.save:', error);
      throw error;
    }
  }
}
