// src/shared/components/ui/Toggle.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type ToggleSize = 'sm' | 'md' | 'lg';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  isLoading?: boolean;
  size?: ToggleSize;
  activeIcon?: IconDefinition;
  inactiveIcon?: IconDefinition;
  className?: string;
  name?: string;
  id?: string;
}

const sizeConfig = {
  sm: {
    track: 'w-8 h-4.5 p-0.5',
    thumb: 'w-3.5 h-3.5',
    translate: 'translate-x-3.5',
    iconSize: 'text-[9px]',
    text: 'text-xs',
    desc: 'text-[11px]',
  },
  md: {
    track: 'w-11 h-6 p-0.5',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
    iconSize: 'text-[10px]',
    text: 'text-sm',
    desc: 'text-xs',
  },
  lg: {
    track: 'w-14 h-7.5 p-1',
    thumb: 'w-5.5 h-5.5',
    translate: 'translate-x-6.5',
    iconSize: 'text-xs',
    text: 'text-base',
    desc: 'text-xs',
  },
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  isLoading = false,
  size = 'md',
  activeIcon,
  inactiveIcon,
  className = '',
  name,
  id,
}) => {
  const config = sizeConfig[size];
  const toggleId = id || (name ? `toggle-${name}` : undefined);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!disabled && !isLoading) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && !isLoading) {
        onChange(!checked);
      }
    }
  };

  return (
    <div className={`inline-flex items-start gap-3 select-none ${className}`}>
      {/* Botón Switch */}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || isLoading}
        disabled={disabled || isLoading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out
          focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--main-color,#2563eb)] focus-visible:ring-offset-2
          ${config.track}
          ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-700'
              : checked
              ? 'bg-[var(--main-color,#2563eb)] shadow-xs'
              : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400/80'
          }
        `}
      >
        {/* Bolita Deslizable (Thumb) */}
        <span
          className={`
            pointer-events-none flex items-center justify-center rounded-full bg-white shadow-md transform ring-0 transition duration-200 ease-in-out
            ${config.thumb}
            ${checked ? config.translate : 'translate-x-0'}
          `}
        >
          {/* Spinner de Carga */}
          {isLoading ? (
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className={`${config.iconSize} text-slate-400`}
            />
          ) : (
            <>
              {/* Ícono Estado Activo */}
              {checked && activeIcon && (
                <FontAwesomeIcon
                  icon={activeIcon}
                  className={`${config.iconSize} text-[var(--main-color,#2563eb)]`}
                />
              )}

              {/* Ícono Estado Inactivo */}
              {!checked && inactiveIcon && (
                <FontAwesomeIcon
                  icon={inactiveIcon}
                  className={`${config.iconSize} text-slate-400`}
                />
              )}
            </>
          )}
        </span>
      </button>

      {/* Etiquetas Informativas */}
      {(label || description) && (
        <div
          className={`flex flex-col ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
          onClick={() => !disabled && !isLoading && onChange(!checked)}
        >
          {label && (
            <label
              htmlFor={toggleId}
              className={`font-medium leading-none text-slate-800 dark:text-slate-200 ${config.text}`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`mt-1 text-slate-500 dark:text-slate-400 ${config.desc}`}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;