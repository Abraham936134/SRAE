import sql from './neon';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

async function init() {
  console.log('[InitDb] Starting database re-initialization with baseline data...');

  try {
    // 1. Drop existing tables
    console.log('[InitDb] Dropping existing public tables if they exist...');
    await sql`
      DROP TABLE IF EXISTS 
        calificaciones_criterio, 
        versiones_rubrica, 
        actividades, 
        evaluaciones, 
        niveles, 
        criterios, 
        rubricas_historial,
        rubricas, 
        estudiantes,
        usuarios 
      CASCADE;
    `;
    console.log('[InitDb] Incompatible tables dropped.');

    // 2. Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`[InitDb] Reading schema SQL from: ${schemaPath}`);
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Remove single line comments
    schemaSql = schemaSql.replace(/--.*$/gm, '');

    // 3. Split and execute DDL statements
    console.log('[InitDb] Splitting and executing schema.sql statements...');
    const statements = schemaSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await sql(stmt);
    }
    console.log('[InitDb] Schema successfully applied.');

    // 4. Seed Users
    console.log('[InitDb] Seeding users...');
    const adminId = 'c2c1dc6c-dd9b-4362-bab4-bca28330d43e';
    const docenteId = '3d352315-a2fc-48c4-963a-4cc8e033abea';
    const auxiliarId = 'dcea976a-72d9-4589-8916-251af133ae5b';

    const seedUsers = [
      { id: adminId, nombre: 'Administrador General', email: 'admin@urp.edu.pe', password: 'secret123', rol: 'administrador' },
      { id: docenteId, nombre: 'Abraham Alva (Docente)', email: 'abraham.alva@urp.edu.pe', password: 'secret123', rol: 'docente' },
      { id: auxiliarId, nombre: 'Coordinador de Escuela (Auxiliar)', email: 'auxiliar@urp.edu.pe', password: 'secret123', rol: 'auxiliar' }
    ];

    for (const u of seedUsers) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await sql`
        INSERT INTO usuarios (id, nombre, email, password, rol)
        VALUES (${u.id}, ${u.nombre}, ${u.email}, ${hashedPassword}, ${u.rol})
      `;
      console.log(`[InitDb] Seeded user: ${u.nombre} (${u.rol})`);
    }

    // 4.5. Seed Estudiantes
    console.log('[InitDb] Seeding students...');
    const seedStudents = [
      { id: 'est-1', nombre: 'Abraham Alva', codigo: '202310123', email: 'abraham.alva@urp.edu.pe' },
      { id: 'est-2', nombre: 'María Quispe', codigo: '202320456', email: 'maria.quispe@urp.edu.pe' },
      { id: 'est-3', nombre: 'Juan Pérez', codigo: '202410987', email: 'juan.perez@urp.edu.pe' },
      { id: 'est-4', nombre: 'Ana Torres', codigo: '202420321', email: 'ana.torres@urp.edu.pe' },
      { id: 'est-5', nombre: 'Carlos Mendoza', codigo: '202210888', email: 'carlos.mendoza@urp.edu.pe' },
      { id: 'est-6', nombre: 'Sofía Rodríguez', codigo: '202220777', email: 'sofia.rodriguez@urp.edu.pe' }
    ];

    for (const s of seedStudents) {
      await sql`
        INSERT INTO estudiantes (id, nombre, codigo, email)
        VALUES (${s.id}, ${s.nombre}, ${s.codigo}, ${s.email})
      `;
      console.log(`[InitDb] Seeded student: ${s.nombre} (${s.codigo})`);
    }

    // 5. Seed Rubrics
    console.log('[InitDb] Seeding rubrics...');
    
    // Rubric 1: Exposición Oral de Proyecto
    const rubric1Id = '11111111-1111-1111-1111-111111111111';
    await sql`
      INSERT INTO rubricas (id, titulo, descripcion, version, activa, creado_por, id_original, fecha_creacion)
      VALUES (${rubric1Id}, 'Exposición Oral de Proyecto', 'Evalúa las competencias comunicativas y de síntesis técnica en exposiciones finales.', 2, TRUE, ${docenteId}, NULL, '2026-05-10 12:00:00')
    `;

    // Rubric 1 - Criterion 1
    const crit1Id = '22222222-1111-1111-1111-111111111111';
    await sql`INSERT INTO criterios (id, rubrica_id, descripcion, ponderacion) VALUES (${crit1Id}, ${rubric1Id}, 'Claridad en la comunicación y dominio del tema', 40)`;
    const levels1 = [
      { id: '33333333-1111-1111-1111-111111111111', desc: 'Excelente: Domina la presentación sin leer y responde con solvencia.', pts: 20 },
      { id: '33333333-1111-1111-1111-222222222222', desc: 'Bueno: Exposición clara pero con algunas lecturas de diapositivas.', pts: 15 },
      { id: '33333333-1111-1111-1111-333333333333', desc: 'Regular: Exposición aceptable, comete errores conceptuales menores.', pts: 10 },
      { id: '33333333-1111-1111-1111-444444444444', desc: 'Deficiente: Lee todo el tiempo o no domina el tema.', pts: 5 }
    ];
    for (const l of levels1) {
      await sql`INSERT INTO niveles (id, criterio_id, descripcion, puntos) VALUES (${l.id}, ${crit1Id}, ${l.desc}, ${l.pts})`;
    }

    // Rubric 1 - Criterion 2
    const crit2Id = '22222222-2222-2222-2222-111111111111';
    await sql`INSERT INTO criterios (id, rubrica_id, descripcion, ponderacion) VALUES (${crit2Id}, ${rubric1Id}, 'Uso de material didáctico y soporte visual', 35)`;
    const levels2 = [
      { id: '33333333-2222-2222-2222-111111111111', desc: 'Excelente: Diapositivas dinámicas, claras y gráficos de alto nivel.', pts: 20 },
      { id: '33333333-2222-2222-2222-222222222222', desc: 'Bueno: Diapositivas organizadas pero con sobrecarga de texto.', pts: 15 },
      { id: '33333333-2222-2222-2222-333333333333', desc: 'Regular: Material visual básico o poco claro.', pts: 10 },
      { id: '33333333-2222-2222-2222-444444444444', desc: 'Deficiente: Sin material de apoyo o diseño inapropiado.', pts: 0 }
    ];
    for (const l of levels2) {
      await sql`INSERT INTO niveles (id, criterio_id, descripcion, puntos) VALUES (${l.id}, ${crit2Id}, ${l.desc}, ${l.pts})`;
    }

    // Rubric 1 - Criterion 3
    const crit3Id = '22222222-3333-3333-3333-111111111111';
    await sql`INSERT INTO criterios (id, rubrica_id, descripcion, ponderacion) VALUES (${crit3Id}, ${rubric1Id}, 'Manejo del tiempo y organización', 25)`;
    const levels3 = [
      { id: '33333333-3333-3333-3333-111111111111', desc: 'Excelente: Exposición completada en el tiempo establecido exacto.', pts: 20 },
      { id: '33333333-3333-3333-3333-222222222222', desc: 'Bueno: Se pasa o le falta tiempo por menos de 2 minutos.', pts: 15 },
      { id: '33333333-3333-3333-3333-333333333333', desc: 'Regular: Organización deficiente del tiempo asignado.', pts: 10 },
      { id: '33333333-3333-3333-3333-444444444444', desc: 'Deficiente: No concluye la presentación por falta de tiempo.', pts: 5 }
    ];
    for (const l of levels3) {
      await sql`INSERT INTO niveles (id, criterio_id, descripcion, puntos) VALUES (${l.id}, ${crit3Id}, ${l.desc}, ${l.pts})`;
    }

    // Rubric 2: Informe Escrito de Algoritmos (Borrador)
    const rubric2Id = '22222222-2222-2222-2222-222222222222';
    await sql`
      INSERT INTO rubricas (id, titulo, descripcion, version, activa, creado_por, id_original, fecha_creacion)
      VALUES (${rubric2Id}, 'Informe Escrito de Algoritmos (Borrador)', 'Borrador para evaluar la redacción del paper técnico de fin de curso.', 1, TRUE, ${docenteId}, NULL, '2026-06-01 15:30:00')
    `;
    // Rubric 2 - Crit 1
    const critB1Id = '55555555-1111-1111-1111-111111111111';
    await sql`INSERT INTO criterios (id, rubrica_id, descripcion, ponderacion) VALUES (${critB1Id}, ${rubric2Id}, 'Rigurosidad del Algoritmo y Pseudocódigo', 50)`;
    await sql`INSERT INTO niveles (id, criterio_id, descripcion, puntos) VALUES ('55555555-1111-1111-1111-222222222222', ${critB1Id}, 'Completo', 20)`;
    await sql`INSERT INTO niveles (id, criterio_id, descripcion, puntos) VALUES ('55555555-1111-1111-1111-333333333333', ${critB1Id}, 'Incompleto', 10)`;

    // Rubric 2 - Crit 2
    const critB2Id = '55555555-2222-2222-2222-111111111111';
    await sql`INSERT INTO criterios (id, rubrica_id, descripcion, ponderacion) VALUES (${critB2Id}, ${rubric2Id}, 'Análisis de Complejidad Temporal', 50)`;
    await sql`INSERT INTO niveles (id, criterio_id, descripcion, puntos) VALUES ('55555555-2222-2222-2222-222222222222', ${critB2Id}, 'Excelente', 20)`;
    await sql`INSERT INTO niveles (id, criterio_id, descripcion, puntos) VALUES ('55555555-2222-2222-2222-333333333333', ${critB2Id}, 'Deficiente', 5)`;

    // Rubric 3: Evaluación de Ensayo Literario (Archivada)
    const rubric3Id = '33333333-3333-3333-3333-333333333333';
    await sql`
      INSERT INTO rubricas (id, titulo, descripcion, version, activa, creado_por, id_original, fecha_creacion)
      VALUES (${rubric3Id}, 'Evaluación de Ensayo Literario (Archivada)', 'Rúbrica antigua para ensayos de humanidades (soft deleted).', 1, FALSE, ${docenteId}, NULL, '2025-09-15 09:00:00')
    `;
    const critC1Id = '66666666-1111-1111-1111-111111111111';
    await sql`INSERT INTO criterios (id, rubrica_id, descripcion, ponderacion) VALUES (${critC1Id}, ${rubric3Id}, 'Argumentación Teórica', 100)`;
    await sql`INSERT INTO niveles (id, criterio_id, descripcion, puntos) VALUES ('66666666-1111-1111-1111-222222222222', ${critC1Id}, 'Excelente', 20)`;
    await sql`INSERT INTO niveles (id, criterio_id, descripcion, puntos) VALUES ('66666666-1111-1111-1111-333333333333', ${critC1Id}, 'Insuficiente', 5)`;

    console.log('[InitDb] Rubrics and criteria seeded.');

    // 6. Seed Evaluations
    console.log('[InitDb] Seeding evaluations...');

    // Evaluation 1 (María Quispe)
    const eval1Id = 'e1111111-1111-1111-1111-111111111111';
    const respuestas1 = [
      { criterioId: crit1Id, ponderacionCriterio: 40, nivelId: '33333333-1111-1111-1111-111111111111', puntosNivel: 20 },
      { criterioId: crit2Id, ponderacionCriterio: 35, nivelId: '33333333-2222-2222-2222-222222222222', puntosNivel: 15 },
      { criterioId: crit3Id, ponderacionCriterio: 25, nivelId: '33333333-3333-3333-3333-111111111111', puntosNivel: 20 }
    ];
    await sql`
      INSERT INTO evaluaciones (id, rubrica_id, rubrica_version, estudiante, evaluador_id, nota_final, respuestas, fecha)
      VALUES (${eval1Id}, ${rubric1Id}, 2, 'María Quispe', ${docenteId}, 18.25, ${JSON.stringify(respuestas1)}, '2026-06-11 14:22:00')
    `;

    // Evaluation 2 (Juan Pérez)
    const eval2Id = 'e2222222-2222-2222-2222-222222222222';
    const respuestas2 = [
      { criterioId: crit1Id, ponderacionCriterio: 40, nivelId: '33333333-1111-1111-1111-333333333333', puntosNivel: 10 },
      { criterioId: crit2Id, ponderacionCriterio: 35, nivelId: '33333333-2222-2222-2222-333333333333', puntosNivel: 10 },
      { criterioId: crit3Id, ponderacionCriterio: 25, nivelId: '33333333-3333-3333-3333-222222222222', puntosNivel: 15 }
    ];
    await sql`
      INSERT INTO evaluaciones (id, rubrica_id, rubrica_version, estudiante, evaluador_id, nota_final, respuestas, fecha)
      VALUES (${eval2Id}, ${rubric1Id}, 2, 'Juan Pérez', ${docenteId}, 11.25, ${JSON.stringify(respuestas2)}, '2026-06-11 16:45:00')
    `;

    // Evaluation 3 (Abraham Alva)
    const eval3Id = 'e3333333-3333-3333-3333-333333333333';
    const respuestas3 = [
      { criterioId: crit1Id, ponderacionCriterio: 40, nivelId: '33333333-1111-1111-1111-111111111111', puntosNivel: 20 },
      { criterioId: crit2Id, ponderacionCriterio: 35, nivelId: '33333333-2222-2222-2222-111111111111', puntosNivel: 20 },
      { criterioId: crit3Id, ponderacionCriterio: 25, nivelId: '33333333-3333-3333-3333-111111111111', puntosNivel: 20 }
    ];
    await sql`
      INSERT INTO evaluaciones (id, rubrica_id, rubrica_version, estudiante, evaluador_id, nota_final, respuestas, fecha)
      VALUES (${eval3Id}, ${rubric1Id}, 2, 'Abraham Alva', ${docenteId}, 20.00, ${JSON.stringify(respuestas3)}, '2026-06-12 02:00:00')
    `;

    console.log('[InitDb] Seeded 3 mock evaluations.');

    // 7. Seed Rubrics History Snapshots
    console.log('[InitDb] Seeding rubrics history...');
    
    // History snapshot for Rubric 1 Version 1
    const snapshotV1 = {
      id: rubric1Id,
      titulo: 'Exposición Oral de Proyecto',
      descripcion: 'Evalúa las competencias comunicativas y de síntesis técnica en exposiciones finales.',
      version: 1,
      creadoPor: docenteId,
      fechaCreacion: '2026-05-10T12:00:00.000Z',
      idOriginal: null,
      criterios: [
        {
          id: crit1Id,
          descripcion: 'Claridad en la comunicación y dominio del tema',
          ponderacion: 50,
          niveles: [
            { id: '33333333-1111-1111-1111-111111111111', descripcion: 'Excelente: Domina la presentación sin leer.', puntos: 20 },
            { id: '33333333-1111-1111-1111-444444444444', descripcion: 'Deficiente: Lee todo el tiempo.', puntos: 5 }
          ]
        },
        {
          id: crit2Id,
          descripcion: 'Uso de material didáctico y soporte visual',
          ponderacion: 50,
          niveles: [
            { id: '33333333-2222-2222-2222-111111111111', descripcion: 'Excelente: Diapositivas dinámicas.', puntos: 20 },
            { id: '33333333-2222-2222-2222-444444444444', descripcion: 'Deficiente: Sin material.', puntos: 0 }
          ]
        }
      ]
    };
    await sql`
      INSERT INTO rubricas_historial (rubrica_id, version, snapshot, creado_en)
      VALUES (${rubric1Id}, 1, ${JSON.stringify(snapshotV1)}, '2026-05-10 12:00:00')
    `;

    // History snapshot for Rubric 1 Version 2 (Current)
    const snapshotV2 = {
      id: rubric1Id,
      titulo: 'Exposición Oral de Proyecto',
      descripcion: 'Evalúa las competencias comunicativas y de síntesis técnica en exposiciones finales.',
      version: 2,
      creadoPor: docenteId,
      fechaCreacion: '2026-05-10T12:00:00.000Z',
      idOriginal: null,
      criterios: [
        {
          id: crit1Id,
          descripcion: 'Claridad en la comunicación y dominio del tema',
          ponderacion: 40,
          niveles: levels1.map(l => ({ id: l.id, descripcion: l.desc, puntos: l.pts }))
        },
        {
          id: crit2Id,
          descripcion: 'Uso de material didáctico y soporte visual',
          ponderacion: 35,
          niveles: levels2.map(l => ({ id: l.id, descripcion: l.desc, puntos: l.pts }))
        },
        {
          id: crit3Id,
          descripcion: 'Manejo del tiempo y organización',
          ponderacion: 25,
          niveles: levels3.map(l => ({ id: l.id, descripcion: l.desc, puntos: l.pts }))
        }
      ]
    };
    await sql`
      INSERT INTO rubricas_historial (rubrica_id, version, snapshot, creado_en)
      VALUES (${rubric1Id}, 2, ${JSON.stringify(snapshotV2)}, '2026-06-11 14:00:00')
    `;
    
    console.log('[InitDb] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[InitDb] Database seeding failed:', error);
    process.exit(1);
  }
}

init();
