// src/shared/components/sidebar/sidebar.types.ts
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface NavItemConfig {
    to: string;
    icon: IconDefinition;
    label: string;
    end?: boolean;
    badge?: string | number;
    /** Si requiere un rol o condición específica para renderizarse */
    showIf?: boolean; 
}

export interface NavSectionConfig {
    /** Título opcional de la sección (ej. "MÓDULOS", "CONFIGURACIÓN") */
    title?: string;
    items: NavItemConfig[];
    showIf?: boolean;
}