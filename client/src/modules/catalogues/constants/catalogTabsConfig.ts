// src/modules/catalogues/constants/catalogTabsConfig.ts
import {
    faFolderTree,
    faStethoscope,
    faHeartbeat,
    faFileCode,
    faLayerGroup,
    faSliders,
    faAward,
    faUserCheck,
    faBuildingColumns,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import type { CatalogTabId } from '../components/TabNavigator';

export interface CatalogTabConfig {
    id: CatalogTabId;
    title: string;
    subtitle: string;
    icon: IconDefinition;
    createButtonLabel: string;
}

export const CATALOG_TABS_CONFIG: Record<CatalogTabId, CatalogTabConfig> = {
    grupos: {
        id: 'grupos',
        title: 'Grupos de Servicios',
        subtitle: 'Gestión y clasificación de grupos tarifarios y asistenciales.',
        icon: faFolderTree,
        createButtonLabel: 'Nuevo Grupo',
    },
    servicios: {
        id: 'servicios',
        title: 'Servicios de Salud',
        subtitle: 'Administración del portafolio de servicios habilitados.',
        icon: faStethoscope,
        createButtonLabel: 'Nuevo Servicio',
    },
    procedimientos: {
        id: 'procedimientos',
        title: 'Procedimientos Médicos',
        subtitle: 'Catálogo unificado de procedimientos e intervenciones.',
        icon: faHeartbeat,
        createButtonLabel: 'Nuevo Procedimiento',
    },
    cups: {
        id: 'cups',
        title: 'Codificación CUPS',
        subtitle: 'Clasificación Única de Procedimientos en Salud.',
        icon: faFileCode,
        createButtonLabel: 'Nuevo CUPS',
    },
    complejidades: {
        id: 'complejidades',
        title: 'Niveles de Complejidad',
        subtitle: 'Parametrización de niveles de atención y complejidad asistencial.',
        icon: faLayerGroup,
        createButtonLabel: 'Nueva Complejidad',
    },
    modalidades: {
        id: 'modalidades',
        title: 'Modalidades de Atención',
        subtitle: 'Configuración de modalidades intramural, extramural y telemedicina.',
        icon: faSliders,
        createButtonLabel: 'Nueva Modalidad',
    },
    especialidades: {
        id: 'especialidades',
        title: 'Especialidades Médicas',
        subtitle: 'Control centralizado de especialidades y subespecialidades.',
        icon: faAward,
        createButtonLabel: 'Nueva Especialidad',
    },
    profesionales: {
        id: 'profesionales',
        title: 'Tipos de Profesionales',
        subtitle: 'Categorización del talento humano e idoneidad profesional.',
        icon: faUserCheck,
        createButtonLabel: 'Nuevo Profesional',
    },
    eps: {
        id: 'eps',
        title: 'Aseguradoras (EPS)',
        subtitle: 'Catálogo general de Entidades Promotoras de Salud y pagadores.',
        icon: faBuildingColumns,
        createButtonLabel: 'Nueva EPS',
    },
};