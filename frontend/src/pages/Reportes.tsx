/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { mockEvaluaciones, mockActividades, mockRubricas } from '../mock/data';
import { 
  BarChart3, 
  FileSpreadsheet, 
  FileText, 
  TrendingUp, 
  Users, 
  Award, 
  Filter, 
  Download, 
  AlertTriangle, 
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getReporteStats, exportReportePDF, exportReporteExcel } from '../api/reportes';
import { getRubricas } from '../api/rubricas';
import { Rubrica } from '../types';

type TabType = 'stats' | 'pdf' | 'excel';

export const Reportes: React.FC = () => {
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [actividades, setActividades] = useState<string[]>([]);
  const [selectedActividad, setSelectedActividad] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  const [rubricas, setRubricas] = useState<Rubrica[]>([]);
  const [selectedRubricaId, setSelectedRubricaId] = useState('');
  const [backendStats, setBackendStats] = useState<any | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Load from local storage or mock data
  useEffect(() => {
    const loadData = async () => {
      // 1. Load rubrics
      let rubricsList: Rubrica[] = [];
      try {
        rubricsList = await getRubricas();
        localStorage.setItem('rubricas', JSON.stringify(rubricsList));
      } catch (err) {
        console.warn('Backend offline or failed to fetch rubrics for reports. Loading local storage.', err);
        const stored = localStorage.getItem('rubricas');
        rubricsList = stored ? JSON.parse(stored) : mockRubricas;
      }
      setRubricas(rubricsList);
      if (rubricsList.length > 0) {
        setSelectedRubricaId(rubricsList[0].id);
      }

      // 2. Load evaluations
      const storedEvals = localStorage.getItem('evaluaciones');
      const evalsList: any[] = storedEvals ? JSON.parse(storedEvals) : mockEvaluaciones;

      // Map each evaluation to its activity
      const mapped = evalsList.map((e) => {
        const storedActivity = localStorage.getItem(`eval-actividad-${e.id}`);
        return {
          ...e,
          actividad: storedActivity || mockActividades[Math.floor(Math.random() * mockActividades.length)],
        };
      });

      setEvaluaciones(mapped);

      // Get unique list of activities
      const uniqueActs = Array.from(new Set(mapped.map((e) => e.actividad)));
      setActividades(uniqueActs);
    };

    loadData();
  }, []);

  // Fetch backend statistics when rubric selection changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedRubricaId) {
        setBackendStats(null);
        setBackendError(null);
        setIsBackendOnline(false);
        return;
      }

      try {
        setBackendError(null);
        const stats = await getReporteStats(selectedRubricaId);
        setBackendStats(stats);
        setIsBackendOnline(true);
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setBackendError(err.response.data.error || 'La rúbrica no tiene evaluaciones registradas en el servidor.');
          setIsBackendOnline(true);
          setBackendStats(null);
        } else {
          console.warn('Backend server offline or failed to fetch report stats.', err);
          setIsBackendOnline(false);
          setBackendStats(null);
          setBackendError(null);
        }
      }
    };

    fetchStats();
  }, [selectedRubricaId]);

  const handleDownloadPDF = async () => {
    if (!selectedRubricaId) return;
    try {
      const blob = await exportReportePDF(selectedRubricaId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-grupal-${selectedRubricaId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al descargar el reporte PDF.');
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedRubricaId) return;
    try {
      const blob = await exportReporteExcel(selectedRubricaId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-grupal-${selectedRubricaId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error al descargar la matriz Excel.');
    }
  };

  // Filter evaluations based on activity selection
  const filtered = selectedActividad
    ? evaluaciones.filter((e) => e.actividad === selectedActividad)
    : evaluaciones;

  // Calculate statistics (uses backendStats if available and online, otherwise local storage fallback)
  const totalEvals = isBackendOnline && backendStats
    ? backendStats.totalEvaluaciones
    : filtered.length;

  const promedioGeneral = isBackendOnline && backendStats
    ? backendStats.promedioGeneral
    : (totalEvals > 0 ? filtered.reduce((sum, e) => sum + e.notaFinal, 0) / totalEvals : 0);

  const notaMaxima = isBackendOnline && backendStats
    ? backendStats.notaMaxima
    : (totalEvals > 0 ? Math.max(...filtered.map((e) => e.notaFinal)) : 0);

  const notaMinima = isBackendOnline && backendStats
    ? backendStats.notaMinima
    : (totalEvals > 0 ? Math.min(...filtered.map((e) => e.notaFinal)) : 0);

  // Calculate histogram data (Distribution of grades in Buckets)
  const getHistogramData = () => {
    const buckets = [
      { range: '00 - 05', count: 0, color: '#EF4444' }, // Danger
      { range: '05 - 10', count: 0, color: '#F59E0B' }, // Warning
      { range: '10 - 12', count: 0, color: '#F59E0B' }, // Warning
      { range: '12 - 14', count: 0, color: '#2563EB' }, // Primary
      { range: '14 - 16', count: 0, color: '#2563EB' }, // Primary
      { range: '16 - 18', count: 0, color: '#10B981' }, // Accent
      { range: '18 - 20', count: 0, color: '#10B981' }, // Accent
    ];

    filtered.forEach((ev) => {
      const nota = ev.notaFinal;
      if (nota < 5) buckets[0].count++;
      else if (nota < 10) buckets[1].count++;
      else if (nota < 12) buckets[2].count++;
      else if (nota < 14) buckets[3].count++;
      else if (nota < 16) buckets[4].count++;
      else if (nota < 18) buckets[5].count++;
      else buckets[6].count++;
    });

    return buckets;
  };

  const histogramData = getHistogramData();

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-surface border border-borderLight px-6 py-4 rounded-lg shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-secondary/40">
            SRAE / REPORTES Y RENDIMIENTO
          </div>
          <h3 className="text-xl font-bold text-secondary tracking-tight">Reportes y Calificaciones</h3>
        </div>
      </div>

      {/* Tabs System Navigation */}
      <div className="border-b border-borderLight flex gap-2">
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'stats'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-secondary/60 hover:text-secondary hover:bg-bgLight'
          }`}
        >
          <BarChart3 size={16} />
          Estadísticas y Rendimiento
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pdf'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-secondary/60 hover:text-secondary hover:bg-bgLight'
          }`}
        >
          <FileText size={16} />
          Exportar PDF
        </button>
        <button
          onClick={() => setActiveTab('excel')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'excel'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-secondary/60 hover:text-secondary hover:bg-bgLight'
          }`}
        >
          <FileSpreadsheet size={16} />
          Exportar Excel
        </button>
      </div>

      {/* Tab Contents: STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* KPI Statistics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-surface p-5 border border-borderLight rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider block">Total Evaluaciones</span>
                <span className="text-2xl font-bold text-secondary mt-1 block">{totalEvals}</span>
              </div>
              <div className="bg-primary/10 text-primary p-3 rounded-full">
                <Users size={20} />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface p-5 border border-borderLight rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider block">Promedio General</span>
                <span className="text-2xl font-bold text-secondary mt-1 block font-mono">
                  {promedioGeneral.toFixed(2)}
                </span>
              </div>
              <div className={`p-3 rounded-full ${promedioGeneral >= 11 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-danger'}`}>
                <TrendingUp size={20} />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface p-5 border border-borderLight rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider block">Nota Máxima</span>
                <span className="text-2xl font-bold text-emerald-600 mt-1 block font-mono">
                  {notaMaxima.toFixed(2)}
                </span>
              </div>
              <div className="bg-emerald-50 text-emerald-500 p-3 rounded-full border border-emerald-100">
                <Award size={20} />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-surface p-5 border border-borderLight rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider block">Nota Mínima</span>
                <span className="text-2xl font-bold text-danger mt-1 block font-mono">
                  {notaMinima.toFixed(2)}
                </span>
              </div>
              <div className="bg-red-50 text-danger p-3 rounded-full border border-red-100">
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>

          {/* Filter Panel & Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Filter & Activity Selection */}
            <div className="lg:col-span-1 bg-surface rounded-lg border border-borderLight p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-borderLight pb-2">
                <Filter size={16} className="text-primary" />
                <h4 className="font-bold text-secondary text-sm">Filtros y Búsqueda</h4>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-secondary/60 uppercase tracking-wider mb-2">
                  Seleccionar Rúbrica
                </label>
                <select
                  value={selectedRubricaId}
                  onChange={(e) => setSelectedRubricaId(e.target.value)}
                  className="w-full px-3 py-2 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white text-secondary"
                >
                  {rubricas.map((rubric) => (
                    <option key={rubric.id} value={rubric.id}>
                      {rubric.titulo} (v{rubric.version})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-secondary/60 uppercase tracking-wider mb-2">
                  Seleccionar Actividad (Vista Local)
                </label>
                <select
                  value={selectedActividad}
                  onChange={(e) => setSelectedActividad(e.target.value)}
                  className="w-full px-3 py-2 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white text-secondary"
                  disabled={isBackendOnline && !backendError}
                >
                  <option value="">-- Todas las Actividades --</option>
                  {actividades.map((act) => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>

              <div className="bg-bgLight rounded p-4 text-xs text-secondary/70 border border-borderLight">
                <h5 className="font-bold text-secondary mb-1 flex items-center gap-1">
                  <Sparkles size={12} className="text-primary" /> Distribución
                </h5>
                <p className="leading-relaxed">
                  Filtre por actividades académicas específicas para examinar el histograma de distribución de notas y medir el desempeño promedio del alumnado.
                </p>
              </div>
            </div>

            {/* Recharts Histogram Chart */}
            <div className="lg:col-span-2 bg-surface rounded-lg border border-borderLight p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-borderLight pb-2">
                <h4 className="font-bold text-secondary text-sm">Histograma de Distribución de Notas</h4>
                <span className="text-[10px] text-secondary/50 font-mono">INTERVALOS DE CALIFICACIÓN</span>
              </div>

              {totalEvals === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-secondary/50 border border-dashed border-borderLight rounded-md">
                  No hay suficientes datos de evaluación para generar la gráfica.
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="range" 
                        tick={{ fill: '#0F172A', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                        stroke="#E2E8F0"
                      />
                      <YAxis 
                        allowDecimals={false}
                        tick={{ fill: '#0F172A', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                        stroke="#E2E8F0"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          border: 'none', 
                          borderRadius: '6px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontFamily: 'Inter'
                        }}
                        labelFormatter={(label) => `Rango: ${label}`}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {histogramData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>

          {/* Data Table */}
          <div className="bg-surface rounded-lg border border-borderLight overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-borderLight bg-bgLight/50 flex justify-between items-center">
              <h4 className="font-bold text-secondary text-sm uppercase tracking-wider">Historial de Evaluaciones</h4>
              <span className="bg-primary/10 text-primary text-xs font-mono font-bold px-2 py-0.5 rounded">
                {filtered.length} Registro(s)
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bgLight text-secondary text-[10px] uppercase font-bold tracking-widest border-b border-borderLight">
                    <th className="px-6 py-4">Estudiante</th>
                    <th className="px-6 py-4">Actividad Académica</th>
                    <th className="px-6 py-4 text-center">Nota Final</th>
                    <th className="px-6 py-4">Fecha de Calificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-xs text-secondary/50">
                        No se encontraron evaluaciones registradas para este filtro.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e) => (
                      <tr key={e.id} className="hover:bg-bgLight/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase border border-primary/10">
                              {e.estudiante.charAt(0)}
                            </span>
                            <span className="text-xs font-bold text-secondary">{e.estudiante}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-secondary/70">{e.actividad}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                            e.notaFinal >= 11
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-250'
                              : 'bg-red-50 text-danger border-red-250'
                          }`}>
                            {e.notaFinal.toFixed(2)} / 20.00
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-secondary/50 font-mono">
                          {new Date(e.fecha).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab Contents: PDF */}
      {activeTab === 'pdf' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-surface rounded-lg border border-borderLight p-8 shadow-sm max-w-2xl mx-auto text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full border border-red-100 flex items-center justify-center text-red-500">
              <FileText size={32} />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-bold text-secondary text-lg">Exportar Reporte Académico en formato PDF</h4>
              <p className="text-xs text-secondary/60 max-w-md mx-auto leading-relaxed">
                Genere boletas individuales de calificación académica firmadas y reportes consolidados del rendimiento del aula listos para su impresión y archivo institucional.
              </p>
            </div>

            {isBackendOnline && !backendError ? (
              <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-lg text-left text-xs flex gap-3 max-w-lg mx-auto">
                <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-600" />
                <div className="space-y-1">
                  <span className="font-bold block">Servidor Conectado</span>
                  <span className="block leading-relaxed">
                    El backend está en línea. Puede descargar el reporte consolidado directo del servidor para la rúbrica seleccionada.
                  </span>
                </div>
              </div>
            ) : backendError ? (
              <div className="p-4 bg-amber-50 border border-amber-250 text-amber-800 rounded-lg text-left text-xs flex gap-3 max-w-lg mx-auto">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1">
                  <span className="font-bold block">Sin Evaluaciones Registradas</span>
                  <span className="block leading-relaxed">
                    {backendError}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-250 text-amber-850 rounded-lg text-left text-xs flex gap-3 max-w-lg mx-auto">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1">
                  <span className="font-bold block">Conectividad de Backend Requerida</span>
                  <span className="block leading-relaxed">
                    Las exportaciones PDF utilizan bibliotecas de servidor para compilar documentos validados a partir del motor de base de datos Neon. Actualmente el servidor backend se encuentra desconectado.
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                disabled={!isBackendOnline || !!backendError}
                onClick={handleDownloadPDF}
                className={`px-5 py-2.5 font-bold rounded-md text-xs flex items-center gap-2 border shadow-sm transition-all duration-150 ${
                  isBackendOnline && !backendError
                    ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer border-red-200'
                    : 'bg-secondary/10 text-secondary/40 cursor-not-allowed border-borderLight opacity-50'
                }`}
              >
                <Download size={14} /> Descargar Reporte Completo (PDF)
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Tab Contents: EXCEL */}
      {activeTab === 'excel' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-surface rounded-lg border border-borderLight p-8 shadow-sm max-w-2xl mx-auto text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-500">
              <FileSpreadsheet size={32} />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-bold text-secondary text-lg">Exportar Matriz de Calificaciones en Excel</h4>
              <p className="text-xs text-secondary/60 max-w-md mx-auto leading-relaxed">
                Descargue la sábana completa de notas con todos los criterios y ponderaciones en formato tabular para facilitar la migración directa al sistema principal de actas de la Universidad.
              </p>
            </div>

            {isBackendOnline && !backendError ? (
              <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-lg text-left text-xs flex gap-3 max-w-lg mx-auto">
                <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-600" />
                <div className="space-y-1">
                  <span className="font-bold block">Servidor Conectado</span>
                  <span className="block leading-relaxed">
                    El backend está en línea. Puede descargar el consolidado tabular en CSV/Excel directo del servidor.
                  </span>
                </div>
              </div>
            ) : backendError ? (
              <div className="p-4 bg-amber-50 border border-amber-250 text-amber-800 rounded-lg text-left text-xs flex gap-3 max-w-lg mx-auto">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1">
                  <span className="font-bold block">Sin Evaluaciones Registradas</span>
                  <span className="block leading-relaxed">
                    {backendError}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-250 text-amber-850 rounded-lg text-left text-xs flex gap-3 max-w-lg mx-auto">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1">
                  <span className="font-bold block">Conectividad de Backend Requerida</span>
                  <span className="block leading-relaxed">
                    Las exportaciones Excel utilizan bibliotecas de servidor para compilar hojas de cálculo validadas a partir de la base de datos Neon. Actualmente el servidor backend se encuentra desconectado.
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                disabled={!isBackendOnline || !!backendError}
                onClick={handleDownloadExcel}
                className={`px-5 py-2.5 font-bold rounded-md text-xs flex items-center gap-2 border shadow-sm transition-all duration-150 ${
                  isBackendOnline && !backendError
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer border-emerald-200'
                    : 'bg-secondary/10 text-secondary/40 cursor-not-allowed border-borderLight opacity-50'
                }`}
              >
                <Download size={14} /> Descargar Matriz de Notas (XLSX)
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Reportes;
