import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FilterSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'py-1.5 pl-3 pr-8 text-xs',
  md: 'py-2 pl-3.5 pr-9 text-sm',
  lg: 'py-2.5 pl-4 pr-10 text-base',
};

const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full bg-white border border-gray-300 rounded-xl text-gray-800 
          appearance-none transition-all duration-200 outline-none cursor-pointer
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm
          ${sizeClasses[size]}
        `}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FontAwesomeIcon
        icon={faChevronDown}
        className="absolute right-3 text-xs text-gray-400 pointer-events-none"
      />
    </div>
  );
};

export { FilterSelect };