import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { CARD_GRADIENTS } from '../../../shared/constants/Gradients';
import type { CardGradientKey } from '../../../shared/constants/Gradients';

export interface AnimatedStatsCardProps {
  /** Título principal de la métrica */
  title: string;
  /** Valor numérico o texto a mostrar */
  value: string | number;
  /** Icono de FontAwesome */
  icon: IconDefinition;
  /** Variante basada en la constante CARD_GRADIENTS */
  variant?: CardGradientKey;
  /** Gradiente CSS directo o fallback */
  gradient?: string;
  /** Retardo de la animación en ms */
  delay?: number;
  /** Texto secundario explicatorio */
  subtitle?: string;
  /** Indicador de tendencia */
  trend?: {
    value: string | number;
    isPositive?: boolean;
  };
  /** Callback opcional */
  onClick?: () => void;
  /** Clases adicionales */
  className?: string;
}

export const AnimatedStatsCard: React.FC<AnimatedStatsCardProps> = ({
  title,
  value,
  icon,
  variant,
  gradient,
  delay = 0,
  subtitle,
  trend,
  onClick,
  className = '',
}) => {
  const isClickable = Boolean(onClick);

  // Resuelve el fondo utilizando el variant de tus constantes o el prop gradient
  const backgroundStyle = variant 
    ? CARD_GRADIENTS[variant] 
    : (gradient || CARD_GRADIENTS.purpleIndigo);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`relative overflow-hidden rounded-xl px-4 py-3.5 text-white shadow-md 
        transform transition-all duration-300 ease-out 
        hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg group 
        animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards
        ${isClickable ? 'cursor-pointer select-none' : ''} 
        ${className}`}
      style={{
        background: backgroundStyle,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Orbes decorativos reducidos */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      {/* Contenido principal */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Título */}
            <p className="text-white/80 text-[11px] font-semibold mb-0.5 tracking-wider uppercase truncate">
              {title}
            </p>
            {/* Valor */}
            <h3 className="text-2xl font-bold tracking-tight truncate leading-tight">
              {value}
            </h3>

            {/* Subtítulo / Tendencia compacta */}
            {(trend || subtitle) && (
              <div className="flex items-center gap-1.5 mt-1">
                {trend && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold backdrop-blur-md ${
                      trend.isPositive !== false
                        ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/30'
                        : 'bg-rose-500/25 text-rose-100 border border-rose-400/30'
                    }`}
                  >
                    {trend.isPositive !== false ? '↑' : '↓'} {trend.value}
                  </span>
                )}
                {subtitle && (
                  <p className="text-white/75 text-[11px] font-medium truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Contenedor del Icono */}
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform duration-300 shrink-0 border border-white/20">
            <FontAwesomeIcon icon={icon} className="text-base text-white drop-shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedStatsCard;