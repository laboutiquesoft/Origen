// src/shared/components/sidebar/SidebarItem.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface SidebarItemProps {
    to: string;
    icon: IconDefinition;
    label: string;
    end?: boolean;
    badge?: string | number;
    onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, end = false, badge, onClick }) => {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                        ? 'bg-white/20 text-white font-semibold shadow-sm backdrop-blur-xs'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
            }
        >
            <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={icon} className="w-5 h-5 shrink-0 opacity-90" />
                <span>{label}</span>
            </div>
            {badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded-full">
                    {badge}
                </span>
            )}
        </NavLink>
    );
};