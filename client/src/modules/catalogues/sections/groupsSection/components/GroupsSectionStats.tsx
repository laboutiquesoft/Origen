import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLayerGroup, 
  faCheckCircle, 
  faTimesCircle, 
  faChartPie, 
  faSpinner 
} from '@fortawesome/free-solid-svg-icons';

import { AnimatedStatsCard } from '../../../../../shared/components/index';
import type { ServiceGroup } from './GroupsSectionDataTable';

interface GroupsSectionStatsProps {
  groups: ServiceGroup[];
  isLoading?: boolean;
  isError?: boolean;
}

export const GroupsSectionStats: React.FC<GroupsSectionStatsProps> = ({ 
  groups = [], 
  isLoading = false, 
  isError = false 
}) => {
  const totalGroups = groups.length;

  const activeGroups = groups.filter((g) => g.status === true).length;
  const inactiveGroups = groups.filter((g) => g.status === false).length;

  const activePercentage = totalGroups > 0 
    ? Math.round((activeGroups / totalGroups) * 100) 
    : 0;

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

  if (isError) {
    return (
      <div className="p-4 mb-8 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
        Ocurrió un error al cargar las estadísticas de los grupos/secciones.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <AnimatedStatsCard
        title="Total Grupos"
        value={totalGroups}
        icon={faLayerGroup}
        variant="blue-indigo"
        delay={100}
        subtitle="Según filtros aplicados"
      />

      <AnimatedStatsCard
        title="Grupos Activos"
        value={activeGroups}
        icon={faCheckCircle}
        variant="emeraldTeal"
        delay={200}
        subtitle="Disponibles en catálogo"
      />

      <AnimatedStatsCard
        title="Grupos Inactivos"
        value={inactiveGroups}
        icon={faTimesCircle}
        variant="sunsetRed"
        delay={300}
        subtitle="Deshabilitados temporalmente"
      />

      <AnimatedStatsCard
        title="% Grupos Activos"
        value={`${activePercentage}%`}
        icon={faChartPie}
        variant="violetFuchsia"
        delay={400}
        subtitle="Tasa de disponibilidad"
        trend={{
          value: `${activePercentage}% activos`,
          isPositive: activePercentage >= 50,
        }}
      />
    </div>
  );
};

export default GroupsSectionStats;