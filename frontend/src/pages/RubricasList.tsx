/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rubrica } from '../types';
import { mockRubricas } from '../mock/data';
import { 
  Eye, 
  Pencil, 
  Copy, 
  Archive, 
  Search,
  Plus,
  Filter,
  X
} from 'lucide-react';

export const RubricasList: React.FC = () => {
  const [rubricas, setRubricas] = useState<Rubrica[]>([]);
  const [selectedRubrica, setSelectedRubrica] = useState<Rubrica | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'archived', 'draft'
  const [authorFilter, setAuthorFilter] = useState('all'); // 'all', 'docente-uuid-1'

  useEffect(() => {
    const stored = localStorage.getItem('rubricas');
    if (stored) {
      setRubricas(JSON.parse(stored));
    } else {
      setRubricas(mockRubricas);
      localStorage.setItem('rubricas', JSON.stringify(mockRubricas));
    }
  }, []);

  const getStatusBadge = (r: Rubrica) => {
    if (!r.activa) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 select-none">
          Archivada
        </span>
      );
    }
    if (r.titulo.toLowerCase().includes('borrador')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 select-none">
          Borrador
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 select-none">
        Activa
      </span>
    );
  };

  const handleClone = (r: Rubrica) => {
    const cloned: Rubrica = {
      ...r,
      id: `rubrica-clon-${Date.now()}`,
      titulo: `${r.titulo.replace(' (Clonada)', '')} (Clonada)`,
      version: 1.0,
      activa: true,
      idOriginal: r.id,
      fechaCreacion: new Date().toISOString(),
      criterios: r.criterios.map((c) => ({
        ...c,
        id: `crit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        rubricaId: `rubrica-clon-${Date.now()}`,
        niveles: c.niveles.map((n) => ({
          ...n,
          id: `niv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        })),
      })),
    };

    const newList = [cloned, ...rubricas];
    setRubricas(newList);
    localStorage.setItem('rubricas', JSON.stringify(newList));
  };

  const handleArchive = (id: string) => {
    const newList = rubricas.map((r) => {
      if (r.id === id) {
        return { ...r, activa: false };
      }
      return r;
    });
    setRubricas(newList);
    localStorage.setItem('rubricas', JSON.stringify(newList));
  };

  // Filter computation
  const filteredRubricas = rubricas.filter((r) => {
    const matchesSearch = 
      r.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = r.activa && !r.titulo.toLowerCase().includes('borrador');
    } else if (statusFilter === 'archived') {
      matchesStatus = !r.activa;
    } else if (statusFilter === 'draft') {
      matchesStatus = r.activa && r.titulo.toLowerCase().includes('borrador');
    }

    const matchesAuthor = authorFilter === 'all' || r.creadoPor === authorFilter;

    return matchesSearch && matchesStatus && matchesAuthor;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header section with Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface border border-borderLight px-6 py-4 rounded-lg shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Catálogo de Rúbricas</h3>
          <p className="text-xs text-slate-400 mt-0.5">Administra y crea rúbricas para la evaluación de competencias.</p>
        </div>
        <Link
          to="/rubricas/nueva"
          className="px-4 py-2 bg-primary hover:bg-blue-700 text-white font-bold rounded-md transition-colors flex items-center gap-2 text-xs shadow-sm w-fit self-end sm:self-center"
        >
          <Plus size={14} /> Nueva Rúbrica
        </Link>
      </div>

      {/* Filters bar */}
      <div className="bg-surface rounded-lg border border-borderLight p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-borderLight pb-2">
          <Filter size={16} className="text-primary" />
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Filtros de búsqueda</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by name */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-800"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-800"
            >
              <option value="all">-- Todos los Estados --</option>
              <option value="active">Activa</option>
              <option value="draft">Borrador</option>
              <option value="archived">Archivada</option>
            </select>
          </div>

          {/* Author filter */}
          <div>
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-800"
            >
              <option value="all">-- Todos los Autores --</option>
              <option value="docente-uuid-1">Abraham Alva</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-surface rounded-lg shadow-sm border border-borderLight overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-borderLight text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th scope="col" className="px-6 py-4">Nombre</th>
                <th scope="col" className="px-6 py-4 text-center">Versión</th>
                <th scope="col" className="px-6 py-4 text-center">Criterios</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4">Autor</th>
                <th scope="col" className="px-6 py-4">Fecha</th>
                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight">
              {filteredRubricas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                    No se encontraron rúbricas que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRubricas.map((r) => (
                  <tr key={r.id} className="hover:bg-bgLight transition-colors duration-150">
                    <td className="px-6 py-4 text-left">
                      <p className="text-sm font-semibold text-slate-800">{r.titulo}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{r.descripcion}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-mono font-bold text-slate-500">
                      v{Number(r.version).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-slate-650">
                      {r.criterios?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left">{getStatusBadge(r)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-left">
                      {r.creadoPor === 'docente-uuid-1' ? 'Abraham Alva' : 'Sistema'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-450 text-left">
                      {new Date(r.fechaCreacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-1.5">
                      {/* View details */}
                      <button
                        onClick={() => setSelectedRubrica(r)}
                        className="p-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-secondary rounded transition-colors duration-150 inline-flex items-center"
                        title="Ver detalle"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Edit option */}
                      {r.activa ? (
                        <Link
                          to={`/rubricas/${r.id}/editar`}
                          className="p-1.5 bg-white text-primary border border-blue-200 hover:bg-blue-50 rounded transition-colors duration-150 inline-flex items-center"
                          title="Editar rúbrica"
                        >
                          <Pencil size={14} />
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="p-1.5 bg-slate-50 text-slate-300 border border-slate-200 rounded cursor-not-allowed opacity-50 inline-flex items-center"
                          title="No se puede editar una rúbrica archivada"
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      {/* Clone option */}
                      <button
                        onClick={() => handleClone(r)}
                        className="p-1.5 bg-white text-accent border border-green-200 hover:bg-green-50 rounded transition-colors duration-150 inline-flex items-center"
                        title="Clonar rúbrica"
                      >
                        <Copy size={14} />
                      </button>

                      {/* Archive option */}
                      {r.activa && (
                        <button
                          onClick={() => handleArchive(r.id)}
                          className="p-1.5 bg-white text-danger border border-red-200 hover:bg-red-50 rounded transition-colors duration-150 inline-flex items-center"
                          title="Archivar rúbrica"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details View Modal */}
      {selectedRubrica && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col border border-borderLight animate-fade-in">
            {/* Modal Header */}
            <div className="bg-secondary text-white p-6 flex justify-between items-center shrink-0">
              <div>
                <h4 className="text-base font-bold">{selectedRubrica.titulo}</h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Versión {Number(selectedRubrica.version).toFixed(1)} | Creado: {new Date(selectedRubrica.fechaCreacion).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedRubrica(null)}
                className="text-slate-400 hover:text-white transition-colors p-2"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Descripción</h5>
                <p className="text-sm text-slate-700 bg-bgLight p-4 rounded border border-borderLight leading-relaxed">
                  {selectedRubrica.descripcion || 'Sin descripción registrada.'}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Criterios y Niveles de Desempeño</h5>
                <div className="space-y-4">
                  {selectedRubrica.criterios.map((c, idx) => (
                    <div key={c.id} className="border border-borderLight rounded overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-borderLight flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-800">Criterio {idx + 1}: {c.descripcion}</span>
                        <span className="bg-blue-50 text-primary text-xs font-bold font-mono px-2 py-0.5 rounded border border-blue-100">
                          {c.ponderacion}%
                        </span>
                      </div>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white">
                        {c.niveles.map((n) => (
                          <div key={n.id} className="border border-borderLight rounded p-3 bg-bgLight/40">
                            <span className="inline-block px-2 py-0.5 bg-secondary text-white font-mono font-bold text-[10px] rounded mb-1">
                              {n.puntos} pts
                            </span>
                            <p className="text-xs text-slate-650 leading-tight">{n.descripcion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-borderLight p-4 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedRubrica(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-md text-xs transition-colors shadow-sm"
              >
                Cerrar Rúbrica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RubricasList;
