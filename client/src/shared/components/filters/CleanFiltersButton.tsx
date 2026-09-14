import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilterCircleXmark, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

export interface CleanFiltersButtonProps {
  /** Callback que se ejecuta al presionar el botón */
  onClean: () => void;
  /** Cantidad opcional de filtros activos para mostrar un badge */
  activeCount?: number;
  /** Indica si el botón debe estar deshabilitado (ej. cuando no hay filtros aplicados) */
  disabled?: boolean;
  /** Etiqueta personalizada del botón */
  label?: string;
  /** Variante de estilo visual */
  variant?: 'outline' | 'ghost' | 'soft';
  /** Clases adicionales de Tailwind */
  className?: string;
}

const CleanFiltersButton: React.FC<CleanFiltersButtonProps> = ({
  onClean,
  activeCount = 0,
  disabled = false,
  label = 'Limpiar filtros',
  variant = 'soft',
  className = '',
}) => {
  // Estilos base compartidos
  const baseStyles = `
    inline-flex items-center justify-center gap-2 px-3.5 py-1.5 
    text-xs font-semibold rounded-xl transition-all duration-300 ease-out
    select-none focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  // Estilos según la variante visual
  const variantStyles = {
    soft: `
      bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-700
      dark:bg-gray-300 dark:hover:bg-rose-950/60 dark:text-gray-700 dark:hover:text-rose-300
      border border-gray-200 hover:border-rose-300 dark:border-gray-700 dark:hover:border-rose-800
      shadow-sm hover:shadow focus:ring-rose-500/50
    `,
    outline: `
      bg-transparent hover:bg-rose-50/80 text-gray-600 hover:text-rose-600 
      border border-gray-200 dark:border-gray-700 hover:border-rose-300 
      dark:text-gray-300 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 
      focus:ring-rose-400
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 
      hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 
      focus:ring-gray-400
    `,
  };

  // Estilos cuando está deshabilitado
  const disabledStyles = `
    opacity-45 cursor-not-allowed pointer-events-none grayscale
  `;

  return (
    <button
      type="button"
      onClick={onClean}
      disabled={disabled}
      className={`
        group relative
        ${baseStyles}
        ${variantStyles[variant]}
        ${disabled ? disabledStyles : 'hover:-translate-y-0.5 active:translate-y-0 active:scale-95'}
        ${className}
      `}
      title={disabled ? 'No hay filtros para limpiar' : 'Restablecer todos los filtros'}
    >
      {/* Icono con animación sutil al hacer hover */}
      <FontAwesomeIcon
        icon={activeCount > 0 ? faFilterCircleXmark : faRotateLeft}
        className="text-sm transition-transform duration-300 ease-out group-hover:-rotate-45"
      />

      {/* Texto del botón */}
      <span>{label}</span>

      {/* Badge contador de filtros activos (opcional) */}
      {activeCount > 0 && (
        <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
          {activeCount}
        </span>
      )}
    </button>
  );
};

export { CleanFiltersButton };