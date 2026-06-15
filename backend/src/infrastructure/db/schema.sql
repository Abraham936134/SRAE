-- Schema DDL for Neon PostgreSQL Serverless

-- Enable UUID extension if not enabled (Neon has it by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'docente' CHECK (rol IN ('docente', 'administrador', 'auxiliar')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rubrics Table
CREATE TABLE IF NOT EXISTS rubricas (
  id UUID PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  version INT NOT NULL DEFAULT 1,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  creado_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  id_original UUID REFERENCES rubricas(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criteria Table
CREATE TABLE IF NOT EXISTS criterios (
  id UUID PRIMARY KEY,
  rubrica_id UUID NOT NULL REFERENCES rubricas(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  ponderacion NUMERIC(5, 2) NOT NULL
);

-- 4. Levels Table
CREATE TABLE IF NOT EXISTS niveles (
  id UUID PRIMARY KEY,
  criterio_id UUID NOT NULL REFERENCES criterios(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  puntos NUMERIC(5, 2) NOT NULL
);

-- 5. Rubrics History Table (for snapshots on modifications)
CREATE TABLE IF NOT EXISTS rubricas_historial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rubrica_id UUID NOT NULL REFERENCES rubricas(id) ON DELETE CASCADE,
  version INT NOT NULL,
  snapshot JSONB NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Evaluations Table
CREATE TABLE IF NOT EXISTS evaluaciones (
  id UUID PRIMARY KEY,
  rubrica_id UUID NOT NULL REFERENCES rubricas(id) ON DELETE CASCADE,
  rubrica_version INT NOT NULL,
  estudiante VARCHAR(255) NOT NULL,
  evaluador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  nota_final NUMERIC(5, 2) NOT NULL,
  respuestas JSONB NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_criterios_rubrica ON criterios(rubrica_id);
CREATE INDEX IF NOT EXISTS idx_niveles_criterio ON niveles(criterio_id);
CREATE INDEX IF NOT EXISTS idx_historial_rubrica ON rubricas_historial(rubrica_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_rubrica ON evaluaciones(rubrica_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_evaluador ON evaluaciones(evaluador_id);
