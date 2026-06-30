/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Rubrica, Nivel, Evaluacion as IEvaluacion, RespuestaCriterio } from '../types';
import { mockRubricas, mockEstudiantes, mockActividades, mockEvaluaciones } from '../mock/data';
import { Save, User, BookOpen, Award, CheckCircle, AlertTriangle, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { applyEvaluacion, updateEvaluacion } from '../api/evaluaciones';
import { getRubricas } from '../api/rubricas';
import { getEstudiantes } from '../api/estudiantes';

export const Evaluacion: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [rubricas, setRubricas] = useState<Rubrica[]>([]);
  const [selectedRubricaId, setSelectedRubricaId] = useState('');
  const [selectedRubrica, setSelectedRubrica] = useState<Rubrica | null>(null);

  const [estudiante, setEstudiante] = useState('');
  const [actividad, setActividad] = useState('');
  const [estudiantes, setEstudiantes] = useState<string[]>([]);
  const [existingEvaluation, setExistingEvaluation] = useState<IEvaluacion | null>(null);
  
  // Maps criterion ID to selected Nivel object
  const [seleccionados, setSeleccionados] = useState<Record<string, Nivel>>({});

  useEffect(() => {
    const loadData = async () => {
      let activeOnes: Rubrica[] = [];
      try {
        const backendRubrics = await getRubricas();
        activeOnes = backendRubrics.filter((r) => r.activa);
        localStorage.setItem('rubricas', JSON.stringify(backendRubrics));
      } catch (err) {
        console.warn('Backend offline or failed to fetch rubrics. Loading from localStorage instead.', err);
        const stored = localStorage.getItem('rubricas');
        const rubricasList: Rubrica[] = stored ? JSON.parse(stored) : mockRubricas;
        activeOnes = rubricasList.filter((r) => r.activa);
      }
      setRubricas(activeOnes);

      // Load dynamic students from backend
      try {
        const data = await getEstudiantes();
        setEstudiantes(data.map(d => d.nombre));
      } catch (err: any) {
        console.warn("Error fetching students from server, falling back to local list.", err);
        const storedEstudiantes = localStorage.getItem('estudiantes');
        if (storedEstudiantes) {
          setEstudiantes(JSON.parse(storedEstudiantes));
        } else {
          setEstudiantes(mockEstudiantes);
          localStorage.setItem('estudiantes', JSON.stringify(mockEstudiantes));
        }
      }

      // If in edit mode, load the existing evaluation details
      if (id) {
        const storedEvals = localStorage.getItem('evaluaciones');
        const evalsList: IEvaluacion[] = storedEvals ? JSON.parse(storedEvals) : mockEvaluaciones;
        const foundEval = evalsList.find((e) => e.id === id);
        if (foundEval) {
          setExistingEvaluation(foundEval);
          setEstudiante(foundEval.estudiante);
          setSelectedRubricaId(foundEval.rubricaId);
          
          const storedActivity = localStorage.getItem(`eval-actividad-${id}`);
          setActividad(storedActivity || '');
        }
      } else if (activeOnes.length > 0) {
        setSelectedRubricaId(activeOnes[0].id);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    if (selectedRubricaId) {
      const stored = localStorage.getItem('rubricas');
      const rubricasList: Rubrica[] = stored ? JSON.parse(stored) : mockRubricas;
      const found = rubricasList.find((r) => r.id === selectedRubricaId);
      if (found) {
        setSelectedRubrica(found);
        
        // Restore criteria level selections if we are editing the loaded rubric
        if (existingEvaluation && found.id === existingEvaluation.rubricaId) {
          const initialSelections: Record<string, Nivel> = {};
          for (const resp of existingEvaluation.respuestas) {
            const criterion = found.criterios.find((c) => c.id === resp.criterioId);
            if (criterion) {
              const level = criterion.niveles.find((n) => n.id === resp.nivelId);
              if (level) {
                initialSelections[resp.criterioId] = level;
              }
            }
          }
          setSeleccionados(initialSelections);
        } else {
          setSeleccionados({});
        }
      }
    } else {
      setSelectedRubrica(null);
      setSeleccionados({});
    }
  }, [selectedRubricaId, existingEvaluation]);

  const handleSelectNivel = (criterioId: string, nivel: Nivel) => {
    setSeleccionados({
      ...seleccionados,
      [criterioId]: nivel,
    });
  };

  const calculateFinalGrade = (): number => {
    if (!selectedRubrica || selectedRubrica.criterios.length === 0) return 0;
    
    let sum = 0;
    let criteriaCount = 0;

    for (const c of selectedRubrica.criterios) {
      const nivel = seleccionados[c.id];
      if (nivel) {
        sum += (nivel.puntos * c.ponderacion) / 100;
        criteriaCount++;
      }
    }

    if (criteriaCount === 0) return 0;

    // Matches backend calculation logic
    return Math.round((sum + Number.EPSILON) * 100) / 100;
  };

  const finalGrade = calculateFinalGrade();

  // Helper to determine gradient background of cell based on max points
  const getGradientCellClass = (puntos: number, maxPuntos: number, isSelected: boolean) => {
    if (isSelected) {
      return 'border-2 border-primary bg-[#EFF6FF] text-primary font-bold shadow-sm ring-1 ring-primary/20 z-10';
    }
    const ratio = maxPuntos > 0 ? puntos / maxPuntos : 0;
    if (ratio <= 0.25) {
      return 'bg-red-50/40 hover:bg-red-100/60 text-red-900 border-red-100/80';
    } else if (ratio <= 0.5) {
      return 'bg-orange-50/40 hover:bg-orange-100/60 text-orange-950 border-orange-100/80';
    } else if (ratio <= 0.75) {
      return 'bg-amber-50/40 hover:bg-amber-100/60 text-amber-950 border-amber-100/80';
    } else {
      return 'bg-emerald-50/40 hover:bg-emerald-100/60 text-emerald-950 border-emerald-100/80';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!estudiante) {
      alert('Por favor selecciona un estudiante');
      return;
    }
    if (!actividad) {
      alert('Por favor selecciona una actividad académica');
      return;
    }
    if (!selectedRubrica) {
      alert('Por favor selecciona una rúbrica');
      return;
    }

    const allCriteriosEvaluados = selectedRubrica.criterios.every((c) => !!seleccionados[c.id]);
    if (!allCriteriosEvaluados) {
      alert('Por favor evalúa todos los criterios de la rúbrica antes de guardar');
      return;
    }

    // Backend payload format
    const respuestasApi = selectedRubrica.criterios.map((c) => {
      const nivel = seleccionados[c.id];
      return {
        criterioId: c.id,
        nivelId: nivel.id,
      };
    });

    const payload = {
      rubricaId: selectedRubrica.id,
      estudiante,
      respuestas: respuestasApi,
    };

    // Construct local object for frontend compatibility/reporting
    const respuestasLocal: RespuestaCriterio[] = selectedRubrica.criterios.map((c) => {
      const nivel = seleccionados[c.id];
      return {
        criterioId: c.id,
        ponderacionCriterio: c.ponderacion,
        nivelId: nivel.id,
        puntosNivel: nivel.puntos,
      };
    });

    const evalId = id || `eval-${Date.now()}`;

    const newEval: IEvaluacion = {
      id: evalId,
      rubricaId: selectedRubrica.id,
      rubricaVersion: selectedRubrica.version,
      estudiante,
      evaluadorId: existingEvaluation?.evaluadorId || 'mock-docente-uuid-1',
      respuestas: respuestasLocal,
      notaFinal: finalGrade,
      fecha: existingEvaluation?.fecha || new Date().toISOString(),
    };

    // Save locally first to guarantee persistence in case backend connection fails
    const saveLocally = () => {
      const storedEvals = localStorage.getItem('evaluaciones');
      const evalsList: IEvaluacion[] = storedEvals ? JSON.parse(storedEvals) : mockEvaluaciones;
      
      let updatedList: IEvaluacion[];
      if (isEditMode) {
        updatedList = evalsList.map((item) => (item.id === evalId ? newEval : item));
      } else {
        updatedList = [newEval, ...evalsList];
      }
      
      localStorage.setItem('evaluaciones', JSON.stringify(updatedList));
      localStorage.setItem(`eval-actividad-${newEval.id}`, actividad);
    };

    try {
      if (isEditMode) {
        // Call backend PUT endpoint
        await updateEvaluacion(evalId, payload);
        saveLocally();
        alert(`[CONECTADO AL SERVIDOR] Evaluación actualizada con éxito en la base de datos para ${estudiante}. Nueva nota: ${finalGrade.toFixed(2)}`);
      } else {
        // Call backend POST endpoint
        await applyEvaluacion(payload);
        saveLocally();
        alert(`[CONECTADO AL SERVIDOR] Evaluación guardada con éxito en la base de datos para ${estudiante}. Nota obtenida: ${finalGrade.toFixed(2)}`);
      }
    } catch (err) {
      console.warn('Backend offline or error occurred. Saving locally to browser localStorage instead:', err);
      saveLocally();
      alert(`[MODO OFFLINE] Servidor desconectado. La evaluación de ${estudiante} fue guardada/actualizada localmente en el navegador con éxito. Nota obtenida: ${finalGrade.toFixed(2)}`);
    }

    navigate('/reportes');
  };

  const totalCriterios = selectedRubrica ? selectedRubrica.criterios.length : 0;
  const evaluadosCount = selectedRubrica
    ? selectedRubrica.criterios.filter((c) => !!seleccionados[c.id]).length
    : 0;

  const maxLevels = selectedRubrica
    ? selectedRubrica.criterios.reduce((max, c) => Math.max(max, c.niveles.length), 0)
    : 0;

  // Percentage for score ring indicator (grade / 20)
  const scorePercent = Math.min(100, Math.max(0, (finalGrade / 20) * 100));

  return (
    <div className="space-y-8 animate-fade-in w-full text-base">
      
      {/* Title Header / Breadcrumbs */}
      <div className="bg-surface border border-borderLight px-8 py-5 rounded-lg shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-secondary/40 tracking-wider">
            SRAE / EVALUACIONES / {isEditMode ? 'EDITAR' : 'NUEVA'} CALIFICACIÓN
          </div>
          <h3 className="text-2xl font-bold text-secondary tracking-tight">
            {isEditMode ? 'Editar Calificación' : 'Calificar Estudiante'}
          </h3>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Main content grid left column */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Step 1: Select student & activity */}
            <div className="bg-surface rounded-lg border border-borderLight p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-borderLight pb-4 mb-6">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-mono font-bold">01</span>
                <h4 className="font-bold text-secondary text-base uppercase tracking-wider">
                  Parámetros del Estudiante y Actividad
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={14} className="text-primary" /> Estudiante
                                <select
                    required
                    value={estudiante}
                    onChange={(e) => setEstudiante(e.target.value)}
                    disabled={isEditMode}
                    className="w-full px-4 py-3 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-secondary font-medium disabled:opacity-75 disabled:bg-slate-50"
                  >
                    <option value="">-- Seleccione un Estudiante --</option>
                    {estudiantes.map((est) => (
                       <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-primary" /> Actividad Académica
                  </label>
                  <select
                    required
                    value={actividad}
                    onChange={(e) => setActividad(e.target.value)}
                    className="w-full px-4 py-3 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-secondary font-medium"
                  >
                    <option value="">-- Seleccione una Actividad --</option>
                    {mockActividades.map((act) => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award size={14} className="text-primary" /> Rúbrica a Aplicar
                  </label>
                  <select
                    required
                    value={selectedRubricaId}
                    onChange={(e) => setSelectedRubricaId(e.target.value)}
                    disabled={isEditMode}
                    className="w-full px-4 py-3 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-secondary font-medium disabled:opacity-75 disabled:bg-slate-50"
                  >
                    <option value="">-- Seleccione una Rúbrica --</option>
                    {rubricas.map((rub) => (
                      <option key={rub.id} value={rub.id}>
                        {rub.titulo} (v{rub.version})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Rubric Assessment Grid Table */}
            {selectedRubrica ? (
              <div className="bg-surface rounded-lg border border-borderLight overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-borderLight bg-primary/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-mono font-bold">02</span>
                    <h4 className="font-bold text-secondary text-base uppercase tracking-wider">
                      Matriz de Evaluación Analítica
                    </h4>
                  </div>
                  <span className="text-sm text-secondary/60 italic flex items-center gap-1.5">
                    <HelpCircle size={14} /> Haga clic en la celda correspondiente para calificar
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary text-white text-xs uppercase font-bold tracking-wider">
                        <th className="px-6 py-4 border-r border-secondary/20">Criterio / Ponderación</th>
                        {Array.from({ length: maxLevels }).map((_, idx) => (
                          <th key={idx} className="px-6 py-4 text-center border-r border-secondary/20 last:border-r-0">
                            Nivel {idx + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderLight">
                      {selectedRubrica.criterios.map((c) => {
                        const maxPts = Math.max(...c.niveles.map((n) => n.puntos), 1);
                        return (
                          <tr key={c.id} className="hover:bg-bgLight/20 transition-colors">
                            {/* Criterion info */}
                            <td className="px-6 py-5 bg-bgLight/40 align-top border-r border-borderLight min-w-[240px]">
                              <p className="text-sm font-bold text-secondary leading-tight">{c.descripcion}</p>
                              <div className="mt-3 inline-flex items-center">
                                <span className="bg-primary/10 text-primary text-xs font-mono font-bold px-2 py-0.5 rounded">
                                  Ponderación: {c.ponderacion}%
                                </span>
                              </div>
                            </td>

                            {/* Levels selection cells */}
                            {c.niveles.map((nivel) => {
                              const isSelected = seleccionados[c.id]?.id === nivel.id;
                              const cellStyle = getGradientCellClass(nivel.puntos, maxPts, isSelected);
                              return (
                                <td
                                  key={nivel.id}
                                  onClick={() => handleSelectNivel(c.id, nivel)}
                                  className={`px-6 py-5 align-top border-r border-borderLight last:border-r-0 cursor-pointer transition-all duration-150 select-none min-w-[190px] relative ${cellStyle}`}
                                >
                                  <div className="flex justify-between items-center w-full mb-3">
                                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                                      isSelected 
                                        ? 'bg-primary text-white' 
                                        : 'bg-secondary/10 text-secondary'
                                    }`}>
                                      {nivel.puntos} pts
                                    </span>
                                    {isSelected && (
                                      <span className="text-xs text-primary font-bold bg-white w-5 h-5 rounded-full border border-primary/20 flex items-center justify-center shadow-sm">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs leading-relaxed mt-1 font-medium text-secondary/90">
                                    {nivel.descripcion}
                                  </p>
                                </td>
                              );
                            })}
                            {/* Fill empty cells if criterion has fewer levels than maxLevels */}
                            {Array.from({ length: maxLevels - c.niveles.length }).map((_, idx) => (
                              <td key={idx} className="bg-bgLight/20 border-r border-borderLight last:border-r-0" />
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-dashed border-borderLight p-12 text-center text-secondary/50 shadow-sm">
                <AlertCircle size={36} className="mx-auto text-secondary/30 mb-3" />
                <p className="text-base font-semibold">Seleccione una rúbrica activa para cargar la matriz de evaluación.</p>
              </div>
            )}
          </div>

          {/* Sticky Panel - Right Column */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-8">
            
            {/* Sticky Grade Card */}
            <div className="bg-surface border border-borderLight rounded-lg p-6 shadow-md space-y-6">
              <h4 className="font-bold text-secondary text-sm uppercase tracking-wider border-b border-borderLight pb-3">
                Resumen de Calificación
              </h4>

              {/* SVG Radial Gauge */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background track circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-borderLight"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Active progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-primary transition-all duration-300"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * scorePercent) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-secondary tracking-tight font-sans">
                      {finalGrade.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-secondary/50 uppercase tracking-widest font-mono">
                      / 20.00 Pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker Checklist */}
              {selectedRubrica && (
                <div className="bg-bgLight rounded-md p-4 border border-borderLight space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-secondary uppercase tracking-wider">
                    <span>Criterios Calificados</span>
                    <span className="font-mono text-sm">{evaluadosCount} / {totalCriterios}</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-borderLight rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full progress-bar-transition" 
                      style={{ width: `${totalCriterios > 0 ? (evaluadosCount / totalCriterios) * 100 : 0}%` }}
                    />
                  </div>

                  {evaluadosCount < totalCriterios ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold mt-1">
                      <AlertTriangle size={14} />
                      <span>Falta evaluar {totalCriterios - evaluadosCount} criterio(s)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
                      <CheckCircle size={14} />
                      <span>¡Listo para guardar!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata Details */}
              <div className="space-y-4 text-sm border-t border-borderLight pt-4">
                <div className="flex justify-between">
                  <span className="text-secondary/50">Estudiante:</span>
                  <span className="font-bold text-secondary text-right truncate max-w-[140px]" title={estudiante || 'Ninguno'}>
                    {estudiante || <span className="text-red-500 italic">No seleccionado</span>}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary/50">Actividad:</span>
                  <span className="font-bold text-secondary text-right truncate max-w-[140px]" title={actividad || 'Ninguna'}>
                    {actividad || <span className="text-red-500 italic">No seleccionada</span>}
                  </span>
                </div>
                {selectedRubrica && (
                  <div className="flex justify-between">
                    <span className="text-secondary/50">Rúbrica:</span>
                    <span className="font-bold text-secondary text-right truncate max-w-[140px] font-mono" title={`${selectedRubrica.titulo} (v${selectedRubrica.version})`}>
                      {selectedRubrica.titulo} (v{selectedRubrica.version})
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={evaluadosCount < totalCriterios || !estudiante || !actividad}
                className="w-full py-4 bg-secondary hover:bg-secondary/95 disabled:bg-secondary/40 disabled:cursor-not-allowed text-white font-bold rounded-md shadow-sm transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Save size={16} />
                Guardar Evaluación
              </button>
            </div>

            {/* Quick tips box */}
            <div className="bg-primary/5 border border-primary/15 rounded-lg p-5 text-sm text-secondary/80 flex gap-2.5">
              <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-primary mb-1">Tip del Evaluador</h5>
                <p className="leading-relaxed text-xs">
                  Las ponderaciones de cada criterio se aplican proporcionalmente sobre el puntaje seleccionado para obtener el promedio final ponderado sobre un máximo de 20 puntos.
                </p>
              </div>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
};

export default Evaluacion;
