// src/shared/components/header/SectionHeader.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface HeaderAction {
    label: string;
    icon?: IconDefinition;
    onClick: () => void;
    variant?: 'primary' | 'excel' | 'emerald' | 'outline' | 'danger';
    disabled?: boolean;
}

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    /** Icono opcional de FontAwesome o elemento React para enmarcar a la izquierda */
    icon?: IconDefinition | React.ReactNode;
    actions?: HeaderAction[];
    children?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    icon,
    actions = [],
    children,
}) => {
    const variantStyles: Record<NonNullable<HeaderAction['variant']>, string> = {
        primary:
            'gradient-button shadow-md',
        excel:
            'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-2 focus:ring-emerald-500/20',
        emerald:
            'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-2 focus:ring-emerald-500/20',
        outline:
            'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs focus:ring-2 focus:ring-slate-200',
        danger:
            'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-2 focus:ring-red-500/20',
    };

    // Helper para verificar si el icono pasado es un IconDefinition de FontAwesome
    const isFontAwesomeIcon = (iconObj: any): iconObj is IconDefinition => {
        return iconObj && typeof iconObj === 'object' && 'prefix' in iconObj && 'iconName' in iconObj;
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            {/* Bloque Izquierdo: Icono Premium + Textos */}
            <div className="flex items-center gap-4">
                {icon && (
                    <div 
                        className="group relative flex items-center justify-center shrink-0 w-12 h-12 rounded-xl text-white shadow-lg shadow-[var(--main-color)]/25 transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--main-color)]/40 cursor-pointer overflow-hidden"
                        style={{ background: 'var(--main-gradient)' }}
                    >
                        {/* Brillo interno de acento */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Icono con animación suave al hacer hover */}
                        <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            {isFontAwesomeIcon(icon) ? (
                                <FontAwesomeIcon icon={icon} className="text-xl" />
                            ) : (
                                (icon as React.ReactNode)
                            )}
                        </div>
                    </div>
                )}

                {/* Título y Subtítulo */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Acciones a la derecha */}
            {(actions.length > 0 || children) && (
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                    {actions.map((action, index) => {
                        const variant = action.variant || 'primary';

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={action.onClick}
                                disabled={action.disabled}
                                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]}`}
                            >
                                {action.icon && (
                                    <FontAwesomeIcon
                                        icon={action.icon}
                                        className="text-base shrink-0"
                                    />
                                )}
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                    {children}
                </div>
            )}
        </div>
    );
};