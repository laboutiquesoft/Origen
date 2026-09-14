import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

export interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'py-1.5 pl-8 pr-3 text-xs',
  md: 'py-2 pl-9 pr-3.5 text-sm',
  lg: 'py-2.5 pl-10 pr-4 text-base',
};

const iconSizes = {
  sm: 'text-xs left-2.5',
  md: 'text-sm left-3',
  lg: 'text-base left-3.5',
};

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder,
  min,
  max,
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <FontAwesomeIcon
        icon={faCalendarAlt}
        className={`absolute text-gray-400 pointer-events-none ${iconSizes[size]}`}
      />
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full bg-white border border-gray-300 rounded-xl text-gray-800
          transition-all duration-200 outline-none cursor-pointer shadow-sm
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          ${sizeClasses[size]}
        `}
      />
    </div>
  );
};

export { DateInput };