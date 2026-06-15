export type UserRole = 'docente' | 'administrador' | 'auxiliar';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface Nivel {
  id: string;
  criterioId: string;
  descripcion: string;
  puntos: number;
}

export interface Criterio {
  id: string;
  rubricaId: string;
  descripcion: string;
  ponderacion: number;
  niveles: Nivel[];
}

export interface Rubrica {
  id: string;
  titulo: string;
  descripcion: string;
  version: number;
  activa: boolean;
  creadoPor: string;
  criterios: Criterio[];
  idOriginal: string | null;
  fechaCreacion: string;
}

export interface RespuestaCriterio {
  criterioId: string;
  ponderacionCriterio: number;
  nivelId: string;
  puntosNivel: number;
}

export interface Evaluacion {
  id: string;
  rubricaId: string;
  rubricaVersion: number;
  estudiante: string;
  evaluadorId: string;
  respuestas: RespuestaCriterio[];
  notaFinal: number;
  fecha: string;
}

export interface CriterioStat {
  criterioId: string;
  descripcion: string;
  ponderacion: number;
  promedioPuntos: number;
}

export interface ReporteGrupal {
  rubricaId: string;
  tituloRubrica: string;
  totalEvaluaciones: number;
  promedioGeneral: number;
  notaMaxima: number;
  notaMinima: number;
  criteriosStats: CriterioStat[];
}
