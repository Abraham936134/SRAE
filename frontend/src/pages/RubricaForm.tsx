/* eslint-disable */
// Reemplaza a: POST /api/rubricas (para crear) o PUT /api/rubricas/:id (para editar)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Rubrica, Criterio } from '../types';
import { CriterioCard } from '../components/CriterioCard';
import { mockRubricas } from '../mock/data';
import { getRubricaById, createRubrica, updateRubrica } from '../api/rubricas';

export interface NivelInput {
  descripcion: string;
  puntos: number;
}

export interface CriterioInput {
  descripcion: string;
  ponderacion: number;
  niveles: NivelInput[];
}

export const RubricaForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [criterios, setCriterios] = useState<CriterioInput[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRubrica = async () => {
      if (isEditMode && id) {
        try {
          const rubric = await getRubricaById(id);
          if (!rubric.activa) {
            alert('No se puede editar una rúbrica archivada');
            navigate('/rubricas');
            return;
          }

          setTitulo(rubric.titulo);
          setDescripcion(rubric.descripcion);
          setCriterios(
            rubric.criterios.map((c) => ({
              descripcion: c.descripcion,
              ponderacion: c.ponderacion,
              niveles: c.niveles.map((n) => ({
                descripcion: n.descripcion,
                puntos: n.puntos,
              })),
            }))
          );
        } catch (err) {
          console.warn('Backend failed to load rubric by ID. Trying localStorage instead.', err);
          const stored = localStorage.getItem('rubricas');
          const rubricasList: Rubrica[] = stored ? JSON.parse(stored) : mockRubricas;
          const rubric = rubricasList.find((r) => r.id === id);
          if (rubric) {
            if (!rubric.activa) {
              alert('No se puede editar una rúbrica archivada');
              navigate('/rubricas');
              return;
            }

            setTitulo(rubric.titulo);
            setDescripcion(rubric.descripcion);
            setCriterios(
              rubric.criterios.map((c) => ({
                descripcion: c.descripcion,
                ponderacion: c.ponderacion,
                niveles: c.niveles.map((n) => ({
                  descripcion: n.descripcion,
                  puntos: n.puntos,
                })),
              }))
            );
          } else {
            setError('La rúbrica seleccionada no existe');
          }
        }
      } else {
        // Create mode - initialize with one empty criterion
        setCriterios([
          {
            descripcion: '',
            ponderacion: 100,
            niveles: [
              { descripcion: 'Excelente', puntos: 20 },
              { descripcion: 'Bueno', puntos: 15 },
              { descripcion: 'Regular', puntos: 10 },
              { descripcion: 'Deficiente', puntos: 5 },
            ],
          },
        ]);
      }
    };

    loadRubrica();
  }, [id, isEditMode, navigate]);

  const totalWeight = criterios.reduce((sum, c) => sum + (c.ponderacion || 0), 0);
  const isWeightValid = totalWeight === 100;

  const handleCriterioChange = (index: number, updated: CriterioInput) => {
    const updatedList = [...criterios];
    updatedList[index] = updated;
    setCriterios(updatedList);
  };

  const addCriterio = () => {
    setCriterios([
      ...criterios,
      {
        descripcion: '',
        ponderacion: 0,
        niveles: [
          { descripcion: 'Excelente', puntos: 20 },
          { descripcion: 'Bueno', puntos: 15 },
          { descripcion: 'Regular', puntos: 10 },
          { descripcion: 'Deficiente', puntos: 5 },
        ],
      },
    ]);
  };

  const removeCriterio = (index: number) => {
    setCriterios(criterios.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWeightValid) {
      alert('La suma de ponderaciones debe ser exactamente 100%');
      return;
    }

    const payload = {
      titulo,
      descripcion,
      criterios,
    };

    const stored = localStorage.getItem('rubricas');
    const rubricasList: Rubrica[] = stored ? JSON.parse(stored) : mockRubricas;

    const saveLocally = (newOrUpdatedRubric: Rubrica, isEdit: boolean) => {
      let updatedList: Rubrica[] = [];
      if (isEdit) {
        updatedList = rubricasList.map((r) => (r.id === id ? newOrUpdatedRubric : r));
      } else {
        updatedList = [newOrUpdatedRubric, ...rubricasList];
      }
      localStorage.setItem('rubricas', JSON.stringify(updatedList));
    };

    if (isEditMode && id) {
      try {
        const updated = await updateRubrica(id, payload);
        saveLocally(updated, true);
        alert('Rúbrica actualizada con éxito en el backend. Se ha generado una nueva versión.');
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
          alert(`Error del servidor al actualizar: ${err.response.data.error}`);
          return;
        }

        console.warn('Backend failed or offline. Saving rubric locally to localStorage.', err);
        const existing = rubricasList.find((r) => r.id === id);
        const updatedVersion = existing ? existing.version + 1 : 1;
        const mappedCriterios: Criterio[] = criterios.map((cInput, cIdx) => {
          const criterioId = `crit-${id}-${cIdx}-${Date.now()}`;
          return {
            id: criterioId,
            rubricaId: id,
            descripcion: cInput.descripcion,
            ponderacion: cInput.ponderacion,
            niveles: cInput.niveles.map((nInput, nIdx) => ({
              id: `niv-${criterioId}-${nIdx}-${Date.now()}`,
              criterioId,
              descripcion: nInput.descripcion,
              puntos: nInput.puntos,
            })),
          };
        });

        const updatedRubric: Rubrica = {
          id,
          titulo,
          descripcion,
          version: updatedVersion,
          activa: true,
          creadoPor: existing?.creadoPor || 'docente-uuid-1',
          idOriginal: existing?.idOriginal || null,
          fechaCreacion: existing?.fechaCreacion || new Date().toISOString(),
          criterios: mappedCriterios,
        };

        saveLocally(updatedRubric, true);
        alert('Rúbrica actualizada localmente en el navegador (servidor offline). Se ha generado una nueva versión.');
      }
    } else {
      // Create mode
      try {
        const created = await createRubrica(payload);
        saveLocally(created, false);
        alert('Rúbrica creada con éxito en el backend.');
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
          alert(`Error del servidor al crear: ${err.response.data.error}`);
          return;
        }

        console.warn('Backend offline or failed to create rubric. Saving locally to localStorage.', err);

        const newId = `rubrica-new-${Date.now()}`;
        const mappedCriterios: Criterio[] = criterios.map((cInput, cIdx) => {
          const criterioId = `crit-${newId}-${cIdx}-${Date.now()}`;
          return {
            id: criterioId,
            rubricaId: newId,
            descripcion: cInput.descripcion,
            ponderacion: cInput.ponderacion,
            niveles: cInput.niveles.map((nInput, nIdx) => ({
              id: `niv-${criterioId}-${nIdx}-${Date.now()}`,
              criterioId,
              descripcion: nInput.descripcion,
              puntos: nInput.puntos,
            })),
          };
        });

        const newRubrica: Rubrica = {
          id: newId,
          titulo,
          descripcion,
          version: 1,
          activa: true,
          creadoPor: 'docente-uuid-1',
          idOriginal: null,
          fechaCreacion: new Date().toISOString(),
          criterios: mappedCriterios,
        };

        saveLocally(newRubrica, false);
        alert('Rúbrica creada con éxito localmente (servidor offline).');
      }
    }

    navigate('/rubricas');
  };

  const [infoExpanded, setInfoExpanded] = useState(true);
  const [criteriosExpanded, setCriteriosExpanded] = useState(true);

  if (error) {
    return (
      <div className="bg-red-50 text-danger p-4 border border-red-200 rounded max-w-lg mx-auto text-center mt-12">
        <p className="font-bold mb-2">Error</p>
        <p className="text-sm">{error}</p>
        <Link to="/rubricas" className="inline-block mt-4 px-4 py-2 bg-slate-650 hover:bg-slate-700 text-white rounded text-xs font-semibold">
          Volver al Listado
        </Link>
      </div>
    );
  }

  // Weight progress bar color selection
  let progressColor = 'bg-primary'; // Under 100%
  let statusText = 'Suma de ponderación incompleta';
  let statusTextColor = 'text-primary';
  if (isWeightValid) {
    progressColor = 'bg-accent'; // Exactly 100%
    statusText = 'Suma de ponderación completada (100%)';
    statusTextColor = 'text-accent';
  } else if (totalWeight > 100) {
    progressColor = 'bg-danger'; // Exceeds 100%
    statusText = `¡Exceso de ponderación! (${totalWeight}%)`;
    statusTextColor = 'text-danger';
  }

  return (
    <div className="space-y-6 pb-20 relative">
      
      {/* Title Header */}
      <div className="flex justify-between items-center bg-surface border border-borderLight px-6 py-4 rounded-lg shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">
            {isEditMode ? 'Editar Rúbrica Analítica' : 'Crear Rúbrica Analítica'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Define los criterios e indicadores de evaluación.</p>
        </div>
        <Link
          to="/rubricas"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-md text-xs transition-colors shadow-sm"
        >
          Atrás al Catálogo
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Información General (Collapsible) */}
        <div className="bg-surface rounded-lg border border-borderLight shadow-sm overflow-hidden">
          <div 
            onClick={() => setInfoExpanded(!infoExpanded)}
            className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-borderLight cursor-pointer select-none"
          >
            <h4 className="font-bold text-secondary text-sm uppercase tracking-wider">
              1. Información General
            </h4>
            <span className="text-slate-400 text-xs font-bold font-mono">
              {infoExpanded ? 'Ocultar ▲' : 'Mostrar ▼'}
            </span>
          </div>

          {infoExpanded && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="md:col-span-1">
                <label htmlFor="titulo-rubrica" className="block text-xs font-bold text-slate-600 uppercase mb-1.5 font-sans">
                  Título de la Rúbrica
                </label>
                <input
                  id="titulo-rubrica"
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Exposición Oral de Proyecto"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-800"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="descripcion-rubrica" className="block text-xs font-bold text-slate-600 uppercase mb-1.5 font-sans">
                  Descripción / Competencias
                </label>
                <textarea
                  id="descripcion-rubrica"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Indique las competencias y propósitos de esta rúbrica..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Criterios de Evaluación (Collapsible) */}
        <div className="bg-surface rounded-lg border border-borderLight shadow-sm overflow-hidden">
          <div 
            onClick={() => setCriteriosExpanded(!criteriosExpanded)}
            className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-borderLight cursor-pointer select-none"
          >
            <h4 className="font-bold text-secondary text-sm uppercase tracking-wider">
              2. Criterios de Evaluación
            </h4>
            <span className="text-slate-400 text-xs font-bold font-mono">
              {criteriosExpanded ? 'Ocultar ▲' : 'Mostrar ▼'}
            </span>
          </div>

          {criteriosExpanded && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">Agrega criterios y sus respectivos niveles de desempeño.</p>
                <button
                  type="button"
                  onClick={addCriterio}
                  className="px-3 py-1.5 bg-primary hover:bg-blue-700 text-white font-bold rounded-md transition-colors text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>➕</span> Agregar criterio
                </button>
              </div>

              <div className="space-y-4">
                {criterios.map((c, idx) => (
                  <CriterioCard
                    key={idx}
                    index={idx}
                    criterio={c}
                    onChange={handleCriterioChange}
                    onRemove={removeCriterio}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer Bar */}
        <div className="sticky bottom-4 bg-surface border border-borderLight rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md z-30 mt-8">
          
          {/* Progress bar showing sum weights */}
          <div className="flex-1 w-full space-y-1">
            <div className="flex justify-between text-xs font-bold font-sans">
              <span className="text-slate-500 uppercase tracking-widest">Suma de Ponderación</span>
              <span className={`font-mono font-bold ${statusTextColor}`}>
                {totalWeight}% {isWeightValid ? '(Listo)' : ''}
              </span>
            </div>
            
            {/* Real-time progress bar indicator */}
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full progress-bar-transition rounded-full ${progressColor}`}
                style={{ width: `${Math.min(totalWeight, 100)}%` }}
              />
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${statusTextColor}`}>
              {statusText}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
            <Link
              to="/rubricas"
              className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 font-bold rounded-md text-xs transition-colors border border-slate-350 shadow-sm"
            >
              Cancelar
            </Link>
            
            <button
              type="submit"
              disabled={!isWeightValid}
              className={`px-6 py-2.5 font-bold rounded-md text-xs shadow-sm transition-colors ${
                isWeightValid
                  ? 'bg-accent hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              Guardar Rúbrica
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};

export default RubricaForm;
