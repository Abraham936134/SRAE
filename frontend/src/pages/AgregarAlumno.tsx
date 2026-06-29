/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Hash, CheckCircle, Trash2, GraduationCap } from 'lucide-react';
import { getEstudiantes, createEstudiante, deleteEstudiante } from '../api/estudiantes';


interface AlumnoItem {
  id: string;
  nombre: string;
  codigo: string;
  email: string;
}

const INITIAL_ALUMNOS: AlumnoItem[] = [
  { id: 'est-1', nombre: 'Abraham Alva', codigo: '202310123', email: 'abraham.alva@urp.edu.pe' },
  { id: 'est-2', nombre: 'María Quispe', codigo: '202320456', email: 'maria.quispe@urp.edu.pe' },
  { id: 'est-3', nombre: 'Juan Pérez', codigo: '202410987', email: 'juan.perez@urp.edu.pe' },
  { id: 'est-4', nombre: 'Ana Torres', codigo: '202420321', email: 'ana.torres@urp.edu.pe' },
  { id: 'est-5', nombre: 'Carlos Mendoza', codigo: '202210888', email: 'carlos.mendoza@urp.edu.pe' },
  { id: 'est-6', nombre: 'Sofía Rodríguez', codigo: '202220777', email: 'sofia.rodriguez@urp.edu.pe' }
];

export const AgregarAlumno: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [alumnos, setAlumnos] = useState<AlumnoItem[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        const data = await getEstudiantes();
        setAlumnos(data);
      } catch (err: any) {
        console.warn("Error fetching students from server, falling back to local list.", err);
        const stored = localStorage.getItem('alumnos_list');
        if (stored) {
          setAlumnos(JSON.parse(stored));
        } else {
          setAlumnos(INITIAL_ALUMNOS);
          localStorage.setItem('alumnos_list', JSON.stringify(INITIAL_ALUMNOS));
          const namesOnly = INITIAL_ALUMNOS.map(a => a.nombre);
          localStorage.setItem('estudiantes', JSON.stringify(namesOnly));
        }
      }
    };
    fetchAlumnos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !codigo.trim() || !email.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    const nuevoAlumno: AlumnoItem = {
      id: `est-${Date.now()}`,
      nombre: nombre.trim(),
      codigo: codigo.trim(),
      email: email.trim()
    };

    try {
      await createEstudiante(nuevoAlumno);
      
      const updatedList = [...alumnos, nuevoAlumno];
      setAlumnos(updatedList);
      localStorage.setItem('alumnos_list', JSON.stringify(updatedList));

      // Update names-only list for Evaluacion dropdown
      const namesOnly = updatedList.map(a => a.nombre);
      localStorage.setItem('estudiantes', JSON.stringify(namesOnly));

      // Clear form
      setNombre('');
      setCodigo('');
      setEmail('');

      setSuccessMsg(`Alumno ${nuevoAlumno.nombre} agregado con éxito.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Error al guardar el alumno en la base de datos');
    }
  };

  const handleRemove = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este alumno?')) {
      try {
        await deleteEstudiante(id);
        
        const updatedList = alumnos.filter(a => a.id !== id);
        setAlumnos(updatedList);
        localStorage.setItem('alumnos_list', JSON.stringify(updatedList));

        const namesOnly = updatedList.map(a => a.nombre);
        localStorage.setItem('estudiantes', JSON.stringify(namesOnly));
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.error || 'Error al eliminar el alumno de la base de datos');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in w-full text-base">
      
      {/* Page Header */}
      <div className="bg-surface border border-borderLight px-8 py-6 rounded-lg shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-secondary/40">
            SRAE / ESTUDIANTES / AGREGAR NUEVO
          </div>
          <h3 className="text-2xl font-bold text-secondary tracking-tight">Gestionar Alumnos</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Form Column */}
        <div className="xl:col-span-1 bg-surface rounded-lg border border-borderLight p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-borderLight pb-3">
            <GraduationCap className="text-primary" size={20} />
            <h4 className="font-bold text-secondary text-base uppercase tracking-wider">
              Registrar Alumno
            </h4>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded p-4 text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Sofía Rodríguez"
                className="w-full px-4 py-2.5 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-secondary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2">
                Código de Estudiante
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-secondary/40">
                  <Hash size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ej: 202410333"
                  className="w-full pl-10 pr-4 py-2.5 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-secondary font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-secondary/40">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@urp.edu.pe"
                  className="w-full pl-10 pr-4 py-2.5 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-secondary"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-md shadow-sm transition-all text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              Agregar Alumno
            </button>
          </form>
        </div>

        {/* List Table Column */}
        <div className="xl:col-span-2 bg-surface rounded-lg border border-borderLight overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-borderLight bg-bgLight/50 flex justify-between items-center">
            <h4 className="font-bold text-secondary text-base uppercase tracking-wider">
              Alumnos Registrados
            </h4>
            <span className="bg-primary/10 text-primary text-xs font-mono font-bold px-2 py-0.5 rounded">
              {alumnos.length} Alumno(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bgLight text-secondary text-xs font-bold uppercase tracking-wider border-b border-borderLight">
                  <th className="px-6 py-4">Alumno</th>
                  <th className="px-6 py-4">Código URP</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight text-sm">
                {alumnos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-secondary/50">
                      No hay alumnos registrados.
                    </td>
                  </tr>
                ) : (
                  alumnos.map((est) => (
                    <tr key={est.id} className="hover:bg-bgLight/25 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm border border-emerald-100 shadow-sm">
                            {est.nombre.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-secondary">{est.nombre}</p>
                            <p className="text-xs text-secondary/50 font-mono">{est.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-secondary/80">{est.codigo}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemove(est.id)}
                          className="p-1.5 text-danger hover:bg-danger/10 rounded-md transition-colors inline-flex items-center justify-center"
                          title="Eliminar alumno"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgregarAlumno;
