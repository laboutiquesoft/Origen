// src/shared/components/sidebar/Sidebar.tsx
import React from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SidebarItem } from './SidebarItem';
import type { NavSectionConfig } from './sidebar.types';
import logoImg from '../../../assets/logo.png';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    /** Arreglo flexible de secciones e ítems de navegación */
    sections: NavSectionConfig[];
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    sections = [],
}) => {
    return (
        <>
            {/* Backdrop Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Drawer */}
            <aside     
                className={`bg-main-gradient fixed top-0 bottom-0 left-0 z-50 w-64 text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header / Brand */}
                <div className="flex items-center justify-between h-18 px-6 border-b border-white/10 bg-white">
                    <div className="flex-1 flex items-center justify-center">
                        <img src={logoImg} alt="Logo" className="h-9 sm:h-11 w-auto object-contain" />
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Cerrar menú"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar shadow-xl">
                    {sections.map((section, sIndex) => {
                        // Omitir sección si showIf es false
                        if (section.showIf === false) return null;

                        const visibleItems = section.items.filter(item => item.showIf !== false);
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={sIndex} className="space-y-1">
                                {section.title && (
                                    <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-white/60">
                                        {section.title}
                                    </div>
                                )}
                                {visibleItems.map((item, iIndex) => (
                                    <SidebarItem
                                        key={iIndex}
                                        to={item.to}
                                        icon={item.icon}
                                        label={item.label}
                                        end={item.end}
                                        badge={item.badge}
                                        onClick={onClose}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer del Sidebar */}
                <div className="p-4 border-t border-white/10">
                    <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                        <p className="text-xs text-white/70 font-medium">
                            &copy; 2026 ©Origen
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-white/10 rounded-full text-white/60 font-mono">
                            v1.0.0
                        </span>
                    </div>
                </div>
            </aside>
        </>
    );
};