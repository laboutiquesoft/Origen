// src/shared/constants/navigation.ts
import { 
    faChartPie, 
    faBuilding, 
    faServer, 
    faShieldAlt, 
    faUsers, 
    faGlobe,
    faStethoscope,
    faUserInjured,
    faFileInvoiceDollar
} from '@fortawesome/free-solid-svg-icons';
import type { NavSectionConfig } from '../components/sidebar/sidebar.types';

// Menú exclusivo para el SuperAdmin / AllMighty
export const getAllMightyNavigation = (isAdmin: boolean): NavSectionConfig[] => [
    {
        title: 'Administración Global',
        items: [
            { to: '/allmighty-dashboard', icon: faChartPie, label: 'Dashboard', end: true },
            { to: '/allmighty/tenants', icon: faBuilding, label: 'Prestadores' },
            { to: '/allmighty/microservices', icon: faServer, label: 'Microservicios', showIf: isAdmin },
            { to: '/allmighty/roles', icon: faShieldAlt, label: 'Roles y Permisos' },
            { to: '/allmighty/users', icon: faUsers, label: 'Usuarios' },
            { to: '/allmighty/global-catalogue', icon: faGlobe, label: 'Catálogo Global' },
        ],
    },
];

// Menú para una Institución / Prestador de Salud (Tenant)
export const getTenantNavigation = (): NavSectionConfig[] => [
    {
        title: 'Módulo Asistencial',
        items: [
            { to: '/dashboard', icon: faChartPie, label: 'Resumen' },
            { to: '/pacientes', icon: faUserInjured, label: 'Pacientes' },
            { to: '/citas', icon: faStethoscope, label: 'Gestión de Citas' },
            { to: '/facturacion', icon: faFileInvoiceDollar, label: 'Facturación' },
        ],
    },
];