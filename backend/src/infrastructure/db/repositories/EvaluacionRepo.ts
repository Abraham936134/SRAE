import sql from '../neon';
import { Evaluacion, RespuestaCriterio } from '../../../domain/entities/Evaluacion';

export class EvaluacionRepo {
  async save(evaluacion: Evaluacion): Promise<void> {
    try {
      await sql`
        INSERT INTO evaluaciones (id, rubrica_id, rubrica_version, estudiante, evaluador_id, nota_final, respuestas, fecha)
        VALUES (
          ${evaluacion.id}, 
          ${evaluacion.rubricaId}, 
          ${evaluacion.rubricaVersion}, 
          ${evaluacion.estudiante}, 
          ${evaluacion.evaluadorId}, 
          ${evaluacion.notaFinal}, 
          ${JSON.stringify(evaluacion.respuestas)}, 
          ${evaluacion.fecha}
        )
        ON CONFLICT (id) DO UPDATE SET
          nota_final = EXCLUDED.nota_final,
          respuestas = EXCLUDED.respuestas,
          fecha = EXCLUDED.fecha,
          estudiante = EXCLUDED.estudiante
      `;
    } catch (error) {
      console.error('Error en EvaluacionRepo.save:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await sql`
        DELETE FROM evaluaciones 
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Error en EvaluacionRepo.delete:', error);
      throw error;
    }
  }

  async hasEvaluaciones(rubricaId: string): Promise<boolean> {
    try {
      const rows = await sql`
        SELECT 1 
        FROM evaluaciones 
        WHERE rubrica_id = ${rubricaId} 
        LIMIT 1
      `;
      return rows.length > 0;
    } catch (error) {
      console.error('Error en EvaluacionRepo.hasEvaluaciones:', error);
      throw error;
    }
  }

  async findByRubrica(rubricaId: string): Promise<Evaluacion[]> {
    try {
      const rows = await sql`
        SELECT id, rubrica_id, rubrica_version, estudiante, evaluador_id, nota_final, respuestas, fecha 
        FROM evaluaciones 
        WHERE rubrica_id = ${rubricaId}
        ORDER BY fecha DESC
      `;
      return rows.map((row: any) => {
        const respuestas = typeof row.respuestas === 'string' 
          ? JSON.parse(row.respuestas) 
          : row.respuestas;
        
        return new Evaluacion(
          row.id,
          row.rubrica_id,
          row.rubrica_version,
          row.estudiante,
          row.evaluador_id,
          respuestas as RespuestaCriterio[],
          Number(row.nota_final),
          new Date(row.fecha)
        );
      });
    } catch (error) {
      console.error('Error en EvaluacionRepo.findByRubrica:', error);
      throw error;
    }
  }
}
