import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'py-1.5 px-3 text-xs pl-8 pr-7',
  md: 'py-2 px-3.5 text-sm pl-9 pr-8',
  lg: 'py-2.5 px-4 text-base pl-10 pr-9',
};

const iconSizes = {
  sm: 'text-xs left-2.5',
  md: 'text-sm left-3',
  lg: 'text-base left-3.5',
};

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <FontAwesomeIcon
        icon={faSearch}
        className={`absolute text-gray-400 pointer-events-none ${iconSizes[size]}`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full bg-white border border-gray-300 rounded-xl text-gray-800 
          placeholder-gray-400 transition-all duration-200 outline-none
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm
          ${sizeClasses[size]}
        `}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xs" />
        </button>
      )}
    </div>
  );
};

export { SearchInput };