import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeartPulse, 
  faCheckCircle, 
  faTimesCircle, 
  faChartPie, 
  faSpinner 
} from '@fortawesome/free-solid-svg-icons';

import { AnimatedStatsCard } from '../../../../../shared/components/index';
import type { Eps } from './EpsSectionDataTable';

interface EpsSectionStatsProps {
  epsList: Eps[];
  isLoading?: boolean;
  isError?: boolean;
}

export const EpsSectionStats: React.FC<EpsSectionStatsProps> = ({ 
  epsList = [], 
  isLoading = false, 
  isError = false 
}) => {
  const totalEps = epsList.length;

  const activeEps = epsList.filter((e) => e.status === true).length;
  const inactiveEps = epsList.filter((e) => e.status === false).length;

  const activePercentage = totalEps > 0 
    ? Math.round((activeEps / totalEps) * 100) 
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
        Ocurrió un error al cargar las estadísticas de las EPS.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <AnimatedStatsCard
        title="Total EPS"
        value={totalEps}
        icon={faHeartPulse}
        variant="blue-indigo"
        delay={100}
        subtitle="Según filtros aplicados"
      />

      <AnimatedStatsCard
        title="EPS Activas"
        value={activeEps}
        icon={faCheckCircle}
        variant="emeraldTeal"
        delay={200}
        subtitle="Disponibles en catálogo"
      />

      <AnimatedStatsCard
        title="EPS Inactivas"
        value={inactiveEps}
        icon={faTimesCircle}
        variant="sunsetRed"
        delay={300}
        subtitle="Deshabilitadas temporalmente"
      />

      <AnimatedStatsCard
        title="% EPS Activas"
        value={`${activePercentage}%`}
        icon={faChartPie}
        variant="violetFuchsia"
        delay={400}
        subtitle="Tasa de disponibilidad"
        trend={{
          value: `${activePercentage}% activas`,
          isPositive: activePercentage >= 50,
        }}
      />
    </div>
  );
};

export default EpsSectionStats;