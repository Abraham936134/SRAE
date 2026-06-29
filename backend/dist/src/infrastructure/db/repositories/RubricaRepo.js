"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubricaRepo = void 0;
const neon_1 = __importDefault(require("../neon"));
const Rubrica_1 = require("../../../domain/entities/Rubrica");
const Criterio_1 = require("../../../domain/entities/Criterio");
const Nivel_1 = require("../../../domain/entities/Nivel");
class RubricaRepo {
    async findById(id) {
        try {
            // 1. Fetch rubric details
            const rubricRows = await (0, neon_1.default) `
        SELECT id, titulo, descripcion, version, activa, creado_por, id_original, fecha_creacion 
        FROM rubricas 
        WHERE id = ${id} LIMIT 1
      `;
            if (rubricRows.length === 0)
                return null;
            const rRow = rubricRows[0];
            // 2. Fetch criteria
            const criteriaRows = await (0, neon_1.default) `
        SELECT id, descripcion, ponderacion 
        FROM criterios 
        WHERE rubrica_id = ${id}
      `;
            const criterios = [];
            for (const cRow of criteriaRows) {
                // 3. Fetch levels for this criterion
                const levelRows = await (0, neon_1.default) `
          SELECT id, descripcion, puntos 
          FROM niveles 
          WHERE criterio_id = ${cRow.id}
          ORDER BY puntos ASC
        `;
                const niveles = levelRows.map((nRow) => Nivel_1.Nivel.create(nRow.id, cRow.id, nRow.descripcion, Number(nRow.puntos)));
                criterios.push(Criterio_1.Criterio.create(cRow.id, id, cRow.descripcion, Number(cRow.ponderacion), niveles));
            }
            return Rubrica_1.Rubrica.create(rRow.id, rRow.titulo, rRow.descripcion, rRow.version, rRow.activa, rRow.creado_por, criterios, rRow.id_original, new Date(rRow.fecha_creacion));
        }
        catch (error) {
            console.error('Error en RubricaRepo.findById:', error);
            throw error;
        }
    }
    async findAllActive() {
        try {
            const rubricRows = await (0, neon_1.default) `
        SELECT id, titulo, descripcion, version, activa, creado_por, id_original, fecha_creacion 
        FROM rubricas 
        WHERE activa = TRUE
        ORDER BY fecha_creacion DESC
      `;
            const rubricas = [];
            for (const rRow of rubricRows) {
                // Fetch criteria for each active rubric
                const criteriaRows = await (0, neon_1.default) `
          SELECT id, descripcion, ponderacion 
          FROM criterios 
          WHERE rubrica_id = ${rRow.id}
        `;
                const criterios = [];
                for (const cRow of criteriaRows) {
                    const levelRows = await (0, neon_1.default) `
            SELECT id, descripcion, puntos 
            FROM niveles 
            WHERE criterio_id = ${cRow.id}
            ORDER BY puntos ASC
          `;
                    const niveles = levelRows.map((nRow) => Nivel_1.Nivel.create(nRow.id, cRow.id, nRow.descripcion, Number(nRow.puntos)));
                    criterios.push(Criterio_1.Criterio.create(cRow.id, rRow.id, cRow.descripcion, Number(cRow.ponderacion), niveles));
                }
                rubricas.push(Rubrica_1.Rubrica.create(rRow.id, rRow.titulo, rRow.descripcion, rRow.version, rRow.activa, rRow.creado_por, criterios, rRow.id_original, new Date(rRow.fecha_creacion)));
            }
            return rubricas;
        }
        catch (error) {
            console.error('Error en RubricaRepo.findAllActive:', error);
            throw error;
        }
    }
    async save(rubrica) {
        try {
            // 1. Insert or update the rubrica record
            await (0, neon_1.default) `
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
            await (0, neon_1.default) `DELETE FROM criterios WHERE rubrica_id = ${rubrica.id}`;
            // 3. Re-insert criteria and levels
            for (const c of rubrica.criterios) {
                await (0, neon_1.default) `
          INSERT INTO criterios (id, rubrica_id, descripcion, ponderacion)
          VALUES (${c.id}, ${rubrica.id}, ${c.descripcion}, ${c.ponderacion})
        `;
                for (const n of c.niveles) {
                    await (0, neon_1.default) `
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
            await (0, neon_1.default) `
        INSERT INTO rubricas_historial (rubrica_id, version, snapshot)
        VALUES (${rubrica.id}, ${rubrica.version}, ${JSON.stringify(snapshot)})
      `;
        }
        catch (error) {
            console.error('Error en RubricaRepo.save:', error);
            throw error;
        }
    }
    async archive(id) {
        try {
            await (0, neon_1.default) `
        UPDATE rubricas 
        SET activa = FALSE, actualizado_en = CURRENT_TIMESTAMP 
        WHERE id = ${id}
      `;
        }
        catch (error) {
            console.error('Error en RubricaRepo.archive:', error);
            throw error;
        }
    }
    async findHistory(rubricaId) {
        try {
            const rows = await (0, neon_1.default) `
        SELECT version, snapshot, creado_en 
        FROM rubricas_historial 
        WHERE rubrica_id = ${rubricaId} 
        ORDER BY version DESC
      `;
            return rows.map((row) => ({
                version: row.version,
                snapshot: typeof row.snapshot === 'string' ? JSON.parse(row.snapshot) : row.snapshot,
                fecha: new Date(row.creado_en),
            }));
        }
        catch (error) {
            console.error('Error en RubricaRepo.findHistory:', error);
            throw error;
        }
    }
}
exports.RubricaRepo = RubricaRepo;
