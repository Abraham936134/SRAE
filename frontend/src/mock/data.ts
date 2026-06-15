import { Rubrica, Evaluacion } from '../types';

export const mockRubricas: Rubrica[] = [
  {
    id: 'rubrica-1111-1111-1111',
    titulo: 'Exposición Oral de Proyecto',
    descripcion: 'Evalúa las competencias comunicativas y de síntesis técnica en exposiciones finales.',
    version: 2,
    activa: true,
    creadoPor: 'docente-uuid-1',
    idOriginal: null,
    fechaCreacion: '2026-05-10T12:00:00.000Z',
    criterios: [
      {
        id: 'crit-1',
        rubricaId: 'rubrica-1111-1111-1111',
        descripcion: 'Claridad en la comunicación y dominio del tema',
        ponderacion: 40,
        niveles: [
          { id: 'niv-1-1', criterioId: 'crit-1', descripcion: 'Excelente: Domina la presentación sin leer y responde con solvencia.', puntos: 20 },
          { id: 'niv-1-2', criterioId: 'crit-1', descripcion: 'Bueno: Exposición clara pero con algunas lecturas de diapositivas.', puntos: 15 },
          { id: 'niv-1-3', criterioId: 'crit-1', descripcion: 'Regular: Exposición aceptable, comete errores conceptuales menores.', puntos: 10 },
          { id: 'niv-1-4', criterioId: 'crit-1', descripcion: 'Deficiente: Lee todo el tiempo o no domina el tema.', puntos: 5 },
        ]
      },
      {
        id: 'crit-2',
        rubricaId: 'rubrica-1111-1111-1111',
        descripcion: 'Uso de material didáctico y soporte visual',
        ponderacion: 35,
        niveles: [
          { id: 'niv-2-1', criterioId: 'crit-2', descripcion: 'Excelente: Diapositivas dinámicas, claras y gráficos de alto nivel.', puntos: 20 },
          { id: 'niv-2-2', criterioId: 'crit-2', descripcion: 'Bueno: Diapositivas organizadas pero con sobrecarga de texto.', puntos: 15 },
          { id: 'niv-2-3', criterioId: 'crit-2', descripcion: 'Regular: Material visual básico o poco claro.', puntos: 10 },
          { id: 'niv-2-4', criterioId: 'crit-2', descripcion: 'Deficiente: Sin material de apoyo o diseño inapropiado.', puntos: 0 },
        ]
      },
      {
        id: 'crit-3',
        rubricaId: 'rubrica-1111-1111-1111',
        descripcion: 'Manejo del tiempo y organización',
        ponderacion: 25,
        niveles: [
          { id: 'niv-3-1', criterioId: 'crit-3', descripcion: 'Excelente: Exposición completada en el tiempo establecido exacto.', puntos: 20 },
          { id: 'niv-3-2', criterioId: 'crit-3', descripcion: 'Bueno: Se pasa o le falta tiempo por menos de 2 minutos.', puntos: 15 },
          { id: 'niv-3-3', criterioId: 'crit-3', descripcion: 'Regular: Organización deficiente del tiempo asignado.', puntos: 10 },
          { id: 'niv-3-4', criterioId: 'crit-3', descripcion: 'Deficiente: No concluye la presentación por falta de tiempo.', puntos: 5 },
        ]
      }
    ]
  },
  {
    id: 'rubrica-2222-2222-2222',
    titulo: 'Informe Escrito de Algoritmos (Borrador)',
    descripcion: 'Borrador para evaluar la redacción del paper técnico de fin de curso.',
    version: 1,
    activa: true,
    creadoPor: 'docente-uuid-1',
    idOriginal: null,
    fechaCreacion: '2026-06-01T15:30:00.000Z',
    criterios: [
      {
        id: 'crit-b1',
        rubricaId: 'rubrica-2222-2222-2222',
        descripcion: 'Rigurosidad del Algoritmo y Pseudocódigo',
        ponderacion: 50,
        niveles: [
          { id: 'niv-b1-1', criterioId: 'crit-b1', descripcion: 'Completo', puntos: 20 },
          { id: 'niv-b1-2', criterioId: 'crit-b1', descripcion: 'Incompleto', puntos: 10 },
        ]
      },
      {
        id: 'crit-b2',
        rubricaId: 'rubrica-2222-2222-2222',
        descripcion: 'Análisis de Complejidad Temporal',
        ponderacion: 50,
        niveles: [
          { id: 'niv-b2-1', criterioId: 'crit-b2', descripcion: 'Excelente', puntos: 20 },
          { id: 'niv-b2-2', criterioId: 'crit-b2', descripcion: 'Deficiente', puntos: 5 },
        ]
      }
    ]
  },
  {
    id: 'rubrica-3333-3333-3333',
    titulo: 'Evaluación de Ensayo Literario (Archivada)',
    descripcion: 'Rúbrica antigua para ensayos de humanidades (soft deleted).',
    version: 1,
    activa: false, // Soft deleted / archived
    creadoPor: 'docente-uuid-1',
    idOriginal: null,
    fechaCreacion: '2025-09-15T09:00:00.000Z',
    criterios: [
      {
        id: 'crit-c1',
        rubricaId: 'rubrica-3333-3333-3333',
        descripcion: 'Argumentación Teórica',
        ponderacion: 100,
        niveles: [
          { id: 'niv-c1-1', criterioId: 'crit-c1', descripcion: 'Excelente', puntos: 20 },
          { id: 'niv-c1-2', criterioId: 'crit-c1', descripcion: 'Insuficiente', puntos: 5 },
        ]
      }
    ]
  }
];

export const mockEstudiantes: string[] = [
  'Abraham Alva',
  'María Quispe',
  'Juan Pérez',
  'Ana Torres',
  'Carlos Mendoza',
  'Sofía Rodríguez'
];

export const mockActividades: string[] = [
  'Proyecto Final - Arquitectura de Software',
  'Exposición Oral - Tesis I',
  'Ensayo de Análisis de Complejidad',
  'Práctica Dirigida 3'
];

export const mockEvaluaciones: Evaluacion[] = [
  {
    id: 'eval-1',
    rubricaId: 'rubrica-1111-1111-1111',
    rubricaVersion: 2,
    estudiante: 'María Quispe',
    evaluadorId: 'docente-uuid-1',
    respuestas: [
      { criterioId: 'crit-1', ponderacionCriterio: 40, nivelId: 'niv-1-1', puntosNivel: 20 }, // 20 * 40 / 100 = 8.0
      { criterioId: 'crit-2', ponderacionCriterio: 35, nivelId: 'niv-2-2', puntosNivel: 15 }, // 15 * 35 / 100 = 5.25
      { criterioId: 'crit-3', ponderacionCriterio: 25, nivelId: 'niv-3-1', puntosNivel: 20 }, // 20 * 25 / 100 = 5.0
      // Total = 8.0 + 5.25 + 5.0 = 18.25
    ],
    notaFinal: 18.25,
    fecha: '2026-06-11T14:22:00.000Z'
  },
  {
    id: 'eval-2',
    rubricaId: 'rubrica-1111-1111-1111',
    rubricaVersion: 2,
    estudiante: 'Juan Pérez',
    evaluadorId: 'docente-uuid-1',
    respuestas: [
      { criterioId: 'crit-1', ponderacionCriterio: 40, nivelId: 'niv-1-3', puntosNivel: 10 }, // 10 * 40 / 100 = 4.0
      { criterioId: 'crit-2', ponderacionCriterio: 35, nivelId: 'niv-2-3', puntosNivel: 10 }, // 10 * 35 / 100 = 3.5
      { criterioId: 'crit-3', ponderacionCriterio: 25, nivelId: 'niv-3-2', puntosNivel: 15 }, // 15 * 25 / 100 = 3.75
      // Total = 4.0 + 3.5 + 3.75 = 11.25
    ],
    notaFinal: 11.25,
    fecha: '2026-06-11T16:45:00.000Z'
  },
  {
    id: 'eval-3',
    rubricaId: 'rubrica-1111-1111-1111',
    rubricaVersion: 2,
    estudiante: 'Abraham Alva',
    evaluadorId: 'docente-uuid-1',
    respuestas: [
      { criterioId: 'crit-1', ponderacionCriterio: 40, nivelId: 'niv-1-1', puntosNivel: 20 }, // 20 * 40 / 100 = 8.0
      { criterioId: 'crit-2', ponderacionCriterio: 35, nivelId: 'niv-2-1', puntosNivel: 20 }, // 20 * 35 / 100 = 7.0
      { criterioId: 'crit-3', ponderacionCriterio: 25, nivelId: 'niv-3-1', puntosNivel: 20 }, // 20 * 25 / 100 = 5.0
      // Total = 8.0 + 7.0 + 5.0 = 20.00
    ],
    notaFinal: 20.00,
    fecha: '2026-06-12T02:00:00.000Z'
  }
];
