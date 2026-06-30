/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Rubrica, Evaluacion } from '../types';
import { mockRubricas, mockEvaluaciones, mockActividades } from '../mock/data';
import { 
  ClipboardList, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  BookOpen
} from 'lucide-react';
import { getRubricas } from '../api/rubricas';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [rubricas, setRubricas] = useState<Rubrica[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      let rubricsList: Rubrica[] = [];
      try {
        // Attempt backend connection
        rubricsList = await getRubricas();
        localStorage.setItem('rubricas', JSON.stringify(rubricsList));
      } catch (err) {
        console.warn('Backend server disconnected. Using offline localStorage data for Dashboard.', err);
        const storedRubrics = localStorage.getItem('rubricas');
        rubricsList = storedRubrics ? JSON.parse(storedRubrics) : mockRubricas;
        if (!storedRubrics) {
          localStorage.setItem('rubricas', JSON.stringify(mockRubricas));
        }
      }
      setRubricas(rubricsList);

      // Fetch evaluations locally
      const storedEvals = localStorage.getItem('evaluaciones');
      const evalsList: Evaluacion[] = storedEvals ? JSON.parse(storedEvals) : mockEvaluaciones;
      if (!storedEvals) {
        localStorage.setItem('evaluaciones', JSON.stringify(mockEvaluaciones));
      }

      const storedActs = localStorage.getItem('actividades');
      const actsList = storedActs ? JSON.parse(storedActs) : mockActividades;
      if (!storedActs) {
        localStorage.setItem('actividades', JSON.stringify(mockActividades));
      }

      // Map each evaluation to its activity
      const mapped = evalsList.map((e) => {
        const storedActivity = localStorage.getItem(`eval-actividad-${e.id}`);
        return {
          ...e,
          actividad: storedActivity || actsList[Math.floor(Math.random() * actsList.length)],
        };
      });

      setEvaluaciones(mapped);
    };

    loadDashboardData();
  }, []);

  // Compute metrics
  const totalRubricas = rubricas.length;
  const totalEvaluaciones = evaluaciones.length;

  const uniqueStudents = Array.from(new Set(evaluaciones.map((e) => e.estudiante)));
  const totalEstudiantes = uniqueStudents.length;

  const totalNotas = evaluaciones.reduce((sum, e) => sum + e.notaFinal, 0);
  const promedioGeneral = totalEvaluaciones > 0 ? (totalNotas / totalEvaluaciones) : 0;

  // Grade brackets distribution data for Recharts
  const distributionData = [
    { name: 'Desaprobado [0-10]', count: evaluaciones.filter(e => e.notaFinal <= 10).length, fill: '#EF4444' },
    { name: 'Aprobado [11-14]', count: evaluaciones.filter(e => e.notaFinal >= 11 && e.notaFinal <= 14).length, fill: '#F59E0B' },
    { name: 'Bueno [15-17]', count: evaluaciones.filter(e => e.notaFinal >= 15 && e.notaFinal <= 17).length, fill: '#2563EB' },
    { name: 'Excelente [18-20]', count: evaluaciones.filter(e => e.notaFinal >= 18).length, fill: '#10B981' },
  ];

  // Limit latest evaluations table to first 4 entries
  const latestEvaluations = evaluaciones.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in w-full text-base">
      
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Card 1: Rúbricas creadas */}
        <div className="bg-surface rounded-lg border border-borderLight p-6 flex flex-col justify-between hover-card-tactile shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Rúbricas Creadas</span>
            <ClipboardList className="text-primary" size={22} />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-[56px] font-black text-secondary tracking-tight font-sans leading-none">{totalRubricas}</h3>
            <div className="flex items-center text-accent text-xs font-bold font-sans">
              <ArrowUpRight size={16} />
              <span>+2 este mes</span>
            </div>
          </div>
        </div>

        {/* Card 2: Evaluaciones aplicadas */}
        <div className="bg-surface rounded-lg border border-borderLight p-6 flex flex-col justify-between hover-card-tactile shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Evaluaciones</span>
            <GraduationCap className="text-accent" size={22} />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-[56px] font-black text-secondary tracking-tight font-sans leading-none">{totalEvaluaciones}</h3>
            <div className="flex items-center text-accent text-xs font-bold font-sans">
              <ArrowUpRight size={16} />
              <span>+12% vs anterior</span>
            </div>
          </div>
        </div>

        {/* Card 3: Promedio general */}
        <div className="bg-surface rounded-lg border border-borderLight p-6 flex flex-col justify-between hover-card-tactile shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Promedio General</span>
            <TrendingUp className="text-warning" size={22} />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-[56px] font-black text-secondary tracking-tight font-sans leading-none font-mono">
              {promedioGeneral > 0 ? promedioGeneral.toFixed(1) : '0.0'}
            </h3>
            <div className="flex items-center text-accent text-xs font-bold font-sans">
              <ArrowUpRight size={16} />
              <span>+0.3 pts</span>
            </div>
          </div>
        </div>

        {/* Card 4: Alumnos Evaluados */}
        <div className="bg-surface rounded-lg border border-borderLight p-6 flex flex-col justify-between hover-card-tactile shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Alumnos Evaluados</span>
            <Users className="text-primary" size={22} />
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-[56px] font-black text-secondary tracking-tight font-sans leading-none">{totalEstudiantes}</h3>
            <div className="flex items-center text-accent text-xs font-bold font-sans">
              <ArrowUpRight size={16} />
              <span>+3 esta sem.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Left = Latest evaluations table, Right = Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Table of latest evaluations (8 columns span) */}
        <div className="bg-surface rounded-lg border border-borderLight p-6 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-secondary text-base mb-4 border-b border-borderLight pb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" /> Últimas Evaluaciones
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-borderLight text-sm font-bold text-slate-450 uppercase">
                    <th scope="col" className="pb-3 text-left">Estudiante</th>
                    <th scope="col" className="pb-3 text-left">Actividad Académica</th>
                    <th scope="col" className="pb-3 text-left">Nota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight text-base">
                  {latestEvaluations.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-left text-sm text-slate-400">
                        No hay evaluaciones aplicadas aún.
                      </td>
                    </tr>
                  ) : (
                    latestEvaluations.map((e) => {
                      let gradeBadge = 'bg-red-150 text-danger border border-red-250';
                      if (e.notaFinal >= 15) {
                        gradeBadge = 'bg-emerald-50 text-emerald-600 border border-emerald-250';
                      } else if (e.notaFinal >= 11) {
                        gradeBadge = 'bg-amber-50 text-amber-600 border border-amber-250';
                      }

                      return (
                        <tr key={e.id} className="hover:bg-bgLight transition-colors duration-150">
                          <td className="py-4 font-bold text-slate-700 text-left">{e.estudiante}</td>
                          <td className="py-4 text-slate-500 text-left max-w-[200px] truncate">{e.actividad}</td>
                          <td className="py-4 text-left">
                            <span className={`inline-block px-3 py-1 rounded text-sm font-bold font-mono ${gradeBadge}`}>
                              {e.notaFinal.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart of grades distribution (4 columns span) */}
        <div className="bg-surface rounded-lg border border-borderLight p-6 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-secondary text-base mb-4 border-b border-borderLight pb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" /> Distribución de Notas
            </h4>

            {evaluaciones.length === 0 ? (
              <p className="text-sm text-slate-400 text-left py-12">No hay estadísticas de rendimiento disponibles.</p>
            ) : (
              <div className="h-[320px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#0F172A', fontSize: 11, fontFamily: 'Inter' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#0F172A', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '6px', border: 'none', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
