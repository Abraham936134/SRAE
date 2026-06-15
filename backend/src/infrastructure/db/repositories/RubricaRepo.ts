import sql from '../neon';
import { Rubrica } from '../../../domain/entities/Rubrica';
import { Criterio } from '../../../domain/entities/Criterio';
import { Nivel } from '../../../domain/entities/Nivel';

export class RubricaRepo {
  async findById(id: string): Promise<Rubrica | null> {
    try {
      // 1. Fetch rubric details
      const rubricRows = await sql`
        SELECT id, titulo, descripcion, version, activa, creado_por, id_original, fecha_creacion 
        FROM rubricas 
        WHERE id = ${id} LIMIT 1
      `;
      if (rubricRows.length === 0) return null;
      const rRow = rubricRows[0];

      // 2. Fetch criteria
      const criteriaRows = await sql`
        SELECT id, descripcion, ponderacion 
        FROM criterios 
        WHERE rubrica_id = ${id}
      `;

      const criterios: Criterio[] = [];

      for (const cRow of criteriaRows) {
        // 3. Fetch levels for this criterion
        const levelRows = await sql`
          SELECT id, descripcion, puntos 
          FROM niveles 
          WHERE criterio_id = ${cRow.id}
          ORDER BY puntos ASC
        `;

        const niveles = levelRows.map((nRow: any) =>
          Nivel.create(nRow.id, cRow.id, nRow.descripcion, Number(nRow.puntos))
        );

        criterios.push(
          Criterio.create(cRow.id, id, cRow.descripcion, Number(cRow.ponderacion), niveles)
        );
      }

      return Rubrica.create(
        rRow.id,
        rRow.titulo,
        rRow.descripcion,
        rRow.version,
        rRow.activa,
        rRow.creado_por,
        criterios,
        rRow.id_original,
        new Date(rRow.fecha_creacion)
      );
    } catch (error) {
      console.error('Error en RubricaRepo.findById:', error);
      throw error;
    }
  }

  async findAllActive(): Promise<Rubrica[]> {
    try {
      const rubricRows = await sql`
        SELECT id, titulo, descripcion, version, activa, creado_por, id_original, fecha_creacion 
        FROM rubricas 
        WHERE activa = TRUE
        ORDER BY fecha_creacion DESC
      `;

      const rubricas: Rubrica[] = [];
      for (const rRow of rubricRows) {
        // Fetch criteria for each active rubric
        const criteriaRows = await sql`
          SELECT id, descripcion, ponderacion 
          FROM criterios 
          WHERE rubrica_id = ${rRow.id}
        `;

        const criterios: Criterio[] = [];
        for (const cRow of criteriaRows) {
          const levelRows = await sql`
            SELECT id, descripcion, puntos 
            FROM niveles 
            WHERE criterio_id = ${cRow.id}
            ORDER BY puntos ASC
          `;
          const niveles = levelRows.map((nRow: any) =>
            Nivel.create(nRow.id, cRow.id, nRow.descripcion, Number(nRow.puntos))
          );
          criterios.push(
            Criterio.create(cRow.id, rRow.id, cRow.descripcion, Number(cRow.ponderacion), niveles)
          );
        }

        rubricas.push(
          Rubrica.create(
            rRow.id,
            rRow.titulo,
            rRow.descripcion,
            rRow.version,
            rRow.activa,
            rRow.creado_por,
            criterios,
            rRow.id_original,
            new Date(rRow.fecha_creacion)
          )
        );
      }
      return rubricas;
    } catch (error) {
      console.error('Error en RubricaRepo.findAllActive:', error);
      throw error;
    }
  }

  async save(rubrica: Rubrica): Promise<void> {
    try {
      // 1. Insert or update the rubrica record
      await sql`
        INSERT INTO rubricas (id, titulo, descripcion, version, activa, creado_por, id_original, fecha_creacion, actualizado_en)
        VALUES (${rubrica.id}, ${rubrica.titulo}, ${rubrica.descripcion}, ${rubrica.version}, ${rubrica.activa}, ${rubrica.creadoPor}, ${rubrica.idOriginal}, ${rubrica.fechaCreacion}, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE
        SET titulo = EXCLUDED.titulo,
            descripcion = EXCLUDED.descripcion,
            version = EXCLUDED.version,
            activa = EXCLUDED.activa,
            actualizado_en = CURRENT_TIMESTAMP
      `;

      // 2. Clean old criteria/levels to insert new ones (re-sync)
      // Since criteria references rubricas via ON DELETE CASCADE, deleting criteria cascades to levels.
      await sql`DELETE FROM criterios WHERE rubrica_id = ${rubrica.id}`;

      // 3. Re-insert criteria and levels
      for (const c of rubrica.criterios) {
        await sql`
          INSERT INTO criterios (id, rubrica_id, descripcion, ponderacion)
          VALUES (${c.id}, ${rubrica.id}, ${c.descripcion}, ${c.ponderacion})
        `;

        for (const n of c.niveles) {
          await sql`
            INSERT INTO niveles (id, criterio_id, descripcion, puntos)
            VALUES (${n.id}, ${c.id}, ${n.descripcion}, ${n.puntos})
          `;
        }
      }

      // 4. Generate history snapshot
      const snapshot = {
        id: rubrica.id,
        titulo: rubrica.titulo,
        descripcion: rubrica.descripcion,
        version: rubrica.version,
        creadoPor: rubrica.creadoPor,
        fechaCreacion: rubrica.fechaCreacion,
        idOriginal: rubrica.idOriginal,
        criterios: rubrica.criterios.map((c) => ({
          id: c.id,
          descripcion: c.descripcion,
          ponderacion: c.ponderacion,
          niveles: c.niveles.map((n) => ({
            id: n.id,
            descripcion: n.descripcion,
            puntos: n.puntos,
          })),
        })),
      };

      await sql`
        INSERT INTO rubricas_historial (rubrica_id, version, snapshot)
        VALUES (${rubrica.id}, ${rubrica.version}, ${JSON.stringify(snapshot)})
      `;
    } catch (error) {
      console.error('Error en RubricaRepo.save:', error);
      throw error;
    }
  }

  async archive(id: string): Promise<void> {
    try {
      await sql`
        UPDATE rubricas 
        SET activa = FALSE, actualizado_en = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Error en RubricaRepo.archive:', error);
      throw error;
    }
  }

  async findHistory(rubricaId: string): Promise<any[]> {
    try {
      const rows = await sql`
        SELECT version, snapshot, creado_en 
        FROM rubricas_historial 
        WHERE rubrica_id = ${rubricaId} 
        ORDER BY version DESC
      `;
      return rows.map((row: any) => ({
        version: row.version,
        snapshot: typeof row.snapshot === 'string' ? JSON.parse(row.snapshot) : row.snapshot,
        fecha: new Date(row.creado_en),
      }));
    } catch (error) {
      console.error('Error en RubricaRepo.findHistory:', error);
      throw error;
    }
  }
}
