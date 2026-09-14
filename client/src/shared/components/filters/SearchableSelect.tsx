import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faSearch, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

export interface SearchableOption {
  value: string | number;
  label: string;
}

export interface SearchableSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SearchableOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'py-1.5 px-3 text-xs',
  md: 'py-2 px-3.5 text-sm',
  lg: 'py-2.5 px-4 text-base',
};

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Buscar opción...',
  size = 'md',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Botón Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-white border border-gray-300 rounded-xl text-left 
          flex items-center justify-between transition-all duration-200 shadow-sm
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none
          ${sizeClasses[size]}
        `}
      >
        <span className={`truncate ${selectedOption ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1.5 ml-2">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </span>
          )}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-xs text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Popover / Menú Desplegable */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Buscador interno */}
          <div className="p-2 border-b border-gray-100 flex items-center bg-gray-50/50">
            <FontAwesomeIcon icon={faSearch} className="text-xs text-gray-400 ml-2 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escribe para buscar..."
              className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder-gray-400"
              autoFocus
            />
          </div>

          {/* Lista de opciones */}
          <ul className="max-h-48 overflow-y-auto py-1 text-xs sm:text-sm">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`
                      px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors
                      ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <FontAwesomeIcon icon={faCheck} className="text-xs text-blue-600" />}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-3 text-xs text-gray-400 text-center">
                No se encontraron resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export { SearchableSelect };