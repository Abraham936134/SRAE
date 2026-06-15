import React from 'react';
import { Criterio, Nivel } from '../types';

interface NivelSelectorProps {
  criterio: Criterio;
  selectedNivelId: string | null;
  onSelect: (nivel: Nivel) => void;
}

export const NivelSelector: React.FC<NivelSelectorProps> = ({
  criterio,
  selectedNivelId,
  onSelect,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6 hover:shadow-lg transition-shadow duration-200">
      {/* Title */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
        <h3 className="font-bold text-[#1E3A5F] text-base leading-tight">
          {criterio.descripcion}
        </h3>
        <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-100 shrink-0 ml-4">
          Ponderación: {criterio.ponderacion}%
        </span>
      </div>

      {/* Levels list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {criterio.niveles.map((nivel) => {
          const isSelected = selectedNivelId === nivel.id;
          return (
            <button
              key={nivel.id}
              type="button"
              onClick={() => onSelect(nivel)}
              className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {nivel.puntos} {nivel.puntos === 1 ? 'punto' : 'puntos'}
                  </span>
                  {isSelected && (
                    <span className="text-blue-600 font-bold text-sm">✓ Selected</span>
                  )}
                </div>
                <p className={`text-xs leading-relaxed ${
                  isSelected ? 'text-blue-900 font-medium' : 'text-gray-650'
                }`}>
                  {nivel.descripcion}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default NivelSelector;
