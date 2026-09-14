import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faCheckCircle, 
  faTimesCircle, 
  faChartPie, 
  faSpinner 
} from '@fortawesome/free-solid-svg-icons';

import { AnimatedStatsCard } from '../../../shared/components/index';

// Interfaz que representa el Tenant/Prestador
export interface Tenant {
  id_tenant?: string;
  id?: string;
  name?: string;
  tenant_name?: string;
  status?: boolean | string;
  is_active?: boolean;
  [key: string]: unknown;
}

interface TenantStatsProps {
  tenants: Tenant[];
  isLoading?: boolean;
  isError?: boolean;
}

export const TenantStats: React.FC<TenantStatsProps> = ({ 
  tenants = [], 
  isLoading = false, 
  isError = false 
}) => {
  // Cálculos estadísticos reactivos a los filtros
  const totalTenants = tenants.length;

  const activeTenants = tenants.filter((t) => {
    return t.status === true || t.status === 'ACTIVE' || t.is_active === true;
  }).length;

  const inactiveTenants = tenants.filter((t) => {
    return t.status === false || t.status === 'INACTIVE' || t.is_active === false;
  }).length;

  // Porcentaje de prestadores activos dentro del subconjunto filtrado
  const activePercentage = totalTenants > 0 
    ? Math.round((activeTenants / totalTenants) * 100) 
    : 0;

  // Estado de Carga (Skeleton Loader)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div 
            key={index} 
            className="h-32 rounded-2xl bg-gray-200/60 dark:bg-gray-800 animate-pulse flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400 text-2xl" />
          </div>
        ))}
      </div>
    );
  }

  // Estado de Error
  if (isError) {
    return (
      <div className="p-4 mb-8 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
        Ocurrió un error al cargar las estadísticas de los prestadores.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Card 1: Total Prestadores (Filtrados) */}
      <AnimatedStatsCard
        title="Total Prestadores"
        value={totalTenants}
        icon={faBuilding}
        variant="blue-indigo"
        delay={100}
        subtitle="Según filtros aplicados"
      />

      {/* Card 2: Prestadores Activos */}
      <AnimatedStatsCard
        title="Prestadores Activos"
        value={activeTenants}
        icon={faCheckCircle}
        variant="emeraldTeal"
        delay={200}
        subtitle="En operación actual"
      />

      {/* Card 3: Prestadores Inactivos */}
      <AnimatedStatsCard
        title="Prestadores Inactivos"
        value={inactiveTenants}
        icon={faTimesCircle}
        variant="sunsetRed"
        delay={300}
        subtitle="Deshabilitados o suspendidos"
      />

      {/* Card 4: Porcentaje de Actividad */}
      <AnimatedStatsCard
        title="% Prestadores Activos"
        value={`${activePercentage}%`}
        icon={faChartPie}
        variant="violetFuchsia"
        delay={400}
        subtitle="Tasa de operatividad"
        trend={{
          value: `${activePercentage}% operando`,
          isPositive: activePercentage >= 50,
        }}
      />
    </div>
  );
};

export default TenantStats;