import { Request, Response } from 'express';
import sql from '../../db/neon';
import { z } from 'zod';

export const createEstudianteSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().min(1),
  codigo: z.string().min(1),
  email: z.string().email()
});

export class EstudiantesController {
  async listar(_req: Request, res: Response) {
    try {
      const rows = await sql`
        SELECT id, nombre, codigo, email, creado_en as "creadoEn"
        FROM estudiantes
        ORDER BY nombre ASC
      `;
      return res.status(200).json(rows);
    } catch (error: any) {
      console.error('[EstudiantesController] Error in listar:', error);
      return res.status(500).json({ error: 'Error interno al listar estudiantes' });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const { id, nombre, codigo, email } = req.body;
      
      // Check if code or email exists
      const existing = await sql`
        SELECT id FROM estudiantes
        WHERE codigo = ${codigo} OR email = ${email}
        LIMIT 1
      `;
      
      if (existing.length > 0) {
        return res.status(422).json({ error: 'El código o correo electrónico del alumno ya está registrado.' });
      }

      await sql`
        INSERT INTO estudiantes (id, nombre, codigo, email)
        VALUES (${id}, ${nombre}, ${codigo}, ${email})
      `;

      return res.status(201).json({ id, nombre, codigo, email });
    } catch (error: any) {
      console.error('[EstudiantesController] Error in crear:', error);
      return res.status(500).json({ error: 'Error interno al crear estudiante' });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await sql`
        DELETE FROM estudiantes
        WHERE id = ${id}
      `;

      return res.status(200).json({ message: 'Estudiante eliminado con éxito' });
    } catch (error: any) {
      console.error('[EstudiantesController] Error in eliminar:', error);
      return res.status(500).json({ error: 'Error interno al eliminar estudiante' });
    }
  }
}
