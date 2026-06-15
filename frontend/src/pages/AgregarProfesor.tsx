/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Building, Shield, CheckCircle, Trash2 } from 'lucide-react';

interface DocenteItem {
  id: string;
  nombre: string;
  email: string;
  departamento: string;
  rol: string;
}

const INITIAL_DOCENTES: DocenteItem[] = [
  { id: 'doc-1', nombre: 'Dr. Abraham Alva', email: 'abraham.alva@urp.edu.pe', departamento: 'Ingeniería Informática', rol: 'administrador' },
  { id: 'doc-2', nombre: 'Ing. María Quispe', email: 'maria.quispe@urp.edu.pe', departamento: 'Ingeniería de Sistemas', rol: 'docente' },
  { id: 'doc-3', nombre: 'Mg. Juan Pérez', email: 'juan.perez@urp.edu.pe', departamento: 'Ciencias Básicas', rol: 'docente' },
  { id: 'doc-4', nombre: 'Dra. Ana Torres', email: 'ana.torres@urp.edu.pe', departamento: 'Arquitectura', rol: 'auxiliar' }
];

export const AgregarProfesor: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [rol, setRol] = useState('docente');
  const [docentes, setDocentes] = useState<DocenteItem[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('docentes_list');
    if (stored) {
      setDocentes(JSON.parse(stored));
    } else {
      setDocentes(INITIAL_DOCENTES);
      localStorage.setItem('docentes_list', JSON.stringify(INITIAL_DOCENTES));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !departamento.trim()) {
      alert('Por favor complete todos los campos');
      return;
    }

    const nuevoDocente: DocenteItem = {
      id: `doc-${Date.now()}`,
      nombre: nombre.trim(),
      email: email.trim(),
      departamento: departamento.trim(),
      rol
    };

    const updatedList = [...docentes, nuevoDocente];
    setDocentes(updatedList);
    localStorage.setItem('docentes_list', JSON.stringify(updatedList));

    // Clear form
    setNombre('');
    setEmail('');
    setDepartamento('');
    setRol('docente');

    setSuccessMsg(`Profesor ${nuevoDocente.nombre} agregado con éxito.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleRemove = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este profesor?')) {
      const updatedList = docentes.filter(d => d.id !== id);
      setDocentes(updatedList);
      localStorage.setItem('docentes_list', JSON.stringify(updatedList));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in w-full text-base">
      
      {/* Page Header */}
      <div className="bg-surface border border-borderLight px-8 py-6 rounded-lg shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-secondary/40">
            SRAE / PROFESORES / AGREGAR NUEVO
          </div>
          <h3 className="text-2xl font-bold text-secondary tracking-tight">Gestionar Profesores</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Form Column */}
        <div className="xl:col-span-1 bg-surface rounded-lg border border-borderLight p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-borderLight pb-3">
            <UserPlus className="text-primary" size={20} />
            <h4 className="font-bold text-secondary text-base uppercase tracking-wider">
              Registrar Profesor
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
                placeholder="Ej: Ing. Carlos Mendoza"
                className="w-full px-4 py-2.5 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-secondary"
              />
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

            <div>
              <label className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2">
                Departamento / Facultad
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-secondary/40">
                  <Building size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  placeholder="Ej: Ingeniería Electrónica"
                  className="w-full pl-10 pr-4 py-2.5 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2">
                Rol del Sistema
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-secondary/40">
                  <Shield size={16} />
                </span>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-secondary"
                >
                  <option value="docente">Docente</option>
                  <option value="administrador">Administrador</option>
                  <option value="auxiliar">Auxiliar</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 bg-primary hover:bg-primary/95 text-white font-bold rounded-md shadow-sm transition-all text-sm uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              Agregar Profesor
            </button>
          </form>
        </div>

        {/* List Table Column */}
        <div className="xl:col-span-2 bg-surface rounded-lg border border-borderLight overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-borderLight bg-bgLight/50 flex justify-between items-center">
            <h4 className="font-bold text-secondary text-base uppercase tracking-wider">
              Profesores Registrados
            </h4>
            <span className="bg-primary/10 text-primary text-xs font-mono font-bold px-2 py-0.5 rounded">
              {docentes.length} Profesor(es)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bgLight text-secondary text-xs font-bold uppercase tracking-wider border-b border-borderLight">
                  <th className="px-6 py-4">Profesor</th>
                  <th className="px-6 py-4">Departamento</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight text-sm">
                {docentes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-secondary/50">
                      No hay profesores registrados.
                    </td>
                  </tr>
                ) : (
                  docentes.map((doc) => (
                    <tr key={doc.id} className="hover:bg-bgLight/25 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/5">
                            {doc.nombre.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-secondary">{doc.nombre}</p>
                            <p className="text-xs text-secondary/50 font-mono">{doc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-secondary/80">{doc.departamento}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                          doc.rol === 'administrador'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : doc.rol === 'auxiliar'
                            ? 'bg-amber-50 text-amber-700 border border-amber-250'
                            : 'bg-blue-50 text-primary border border-primary/20'
                        }`}>
                          {doc.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemove(doc.id)}
                          className="p-1.5 text-danger hover:bg-danger/10 rounded-md transition-colors inline-flex items-center justify-center"
                          title="Eliminar profesor"
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

export default AgregarProfesor;
