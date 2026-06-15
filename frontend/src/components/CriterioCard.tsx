/* eslint-disable */
import React, { useState } from 'react';
import { CriterioInput, NivelInput } from '../pages/RubricaForm';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';

interface CriterioCardProps {
  index: number;
  criterio: CriterioInput;
  onChange: (index: number, updated: CriterioInput) => void;
  onRemove: (index: number) => void;
}

export const CriterioCard: React.FC<CriterioCardProps> = ({
  index,
  criterio,
  onChange,
  onRemove,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCriterioFieldChange = (field: keyof CriterioInput, value: any) => {
    onChange(index, { ...criterio, [field]: value });
  };

  const handleNivelChange = (nIndex: number, field: keyof NivelInput, value: any) => {
    const updatedNiveles = [...criterio.niveles];
    updatedNiveles[nIndex] = { ...updatedNiveles[nIndex], [field]: value };
    onChange(index, { ...criterio, niveles: updatedNiveles });
  };

  const addNivel = () => {
    const defaultNewNivel: NivelInput = { descripcion: '', puntos: 0 };
    onChange(index, { ...criterio, niveles: [...criterio.niveles, defaultNewNivel] });
  };

  const removeNivel = (nIndex: number) => {
    const updatedNiveles = criterio.niveles.filter((_, idx) => idx !== nIndex);
    onChange(index, { ...criterio, niveles: updatedNiveles });
  };

  return (
    <div className="bg-surface rounded-lg border border-borderLight p-5 relative hover-card-tactile transition-shadow duration-200 mb-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-borderLight">
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 cursor-pointer select-none flex-1 py-1"
        >
          <span className="text-secondary/50 transition-colors hover:text-primary">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
          <h4 className="font-bold text-secondary text-sm">
            Criterio #{index + 1} {criterio.descripcion ? `- ${criterio.descripcion}` : ''}
          </h4>
          <span className="bg-primary/10 text-primary text-xs font-mono font-bold px-2 py-0.5 rounded ml-2">
            {criterio.ponderacion || 0}%
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-danger hover:text-red-750 hover:bg-danger/10 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
        >
          <Trash2 size={13} /> Eliminar
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4 animate-fade-in">
          {/* Description and weight fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-secondary/60 uppercase tracking-wider mb-1">Descripción del Criterio</label>
              <input
                type="text"
                required
                value={criterio.descripcion}
                onChange={(e) => handleCriterioFieldChange('descripcion', e.target.value)}
                placeholder="Ej: Redacción y ortografía, Comprensión de conceptos..."
                className="w-full px-3 py-2 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white text-secondary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary/60 uppercase tracking-wider mb-1">Ponderación (%)</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="1"
                value={criterio.ponderacion || ''}
                onChange={(e) => handleCriterioFieldChange('ponderacion', Number(e.target.value))}
                placeholder="Ej: 30"
                className="w-full px-3 py-2 border border-borderLight rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white text-secondary font-mono"
              />
            </div>
          </div>

          {/* Levels table */}
          <div className="bg-bgLight rounded-lg p-4 border border-borderLight">
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-[10px] font-bold uppercase text-secondary/60 tracking-widest">Niveles de Desempeño</h5>
              <button
                type="button"
                onClick={addNivel}
                className="px-2.5 py-1 bg-white hover:bg-bgLight text-primary border border-borderLight text-xs font-semibold rounded-md transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus size={14} /> Agregar Nivel
              </button>
            </div>

            {criterio.niveles.length === 0 ? (
              <p className="text-xs text-secondary/50 text-center py-4 bg-white rounded-md border border-dashed border-borderLight">
                No hay niveles agregados. Debe tener al menos uno.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-borderLight bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-bgLight border-b border-borderLight text-secondary/70">
                      <th className="p-3 font-semibold">Descripción del Nivel</th>
                      <th className="p-3 font-semibold w-28 text-center">Puntos</th>
                      <th className="p-3 font-semibold w-20 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderLight">
                    {criterio.niveles.map((nivel, nIdx) => (
                      <tr key={nIdx} className="hover:bg-bgLight/40 transition-colors">
                        <td className="p-2">
                          <input
                            type="text"
                            required
                            value={nivel.descripcion}
                            onChange={(e) => handleNivelChange(nIdx, 'descripcion', e.target.value)}
                            placeholder="Descripción del nivel (ej: Excelente)"
                            className="w-full px-2.5 py-1.5 border border-borderLight rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white text-secondary"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.5"
                            value={nivel.puntos || 0}
                            onChange={(e) => handleNivelChange(nIdx, 'puntos', Number(e.target.value))}
                            placeholder="Pts"
                            className="w-20 mx-auto px-2.5 py-1.5 border border-borderLight rounded-sm text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white text-secondary font-mono"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeNivel(nIdx)}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded-md transition-colors inline-flex items-center justify-center"
                            title="Eliminar nivel"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
