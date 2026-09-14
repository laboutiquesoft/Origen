import React from 'react';
import { 
  SearchInput, 
  FilterSelect, 
  DateInput, 
  CleanFiltersButton 
} from '../../../../../shared/components';

export interface EpsSectionFilterValues {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface EpsSectionFilterProps {
  filters: EpsSectionFilterValues;
  onFilterChange: (newFilters: EpsSectionFilterValues) => void;
  onResetFilters: () => void;
  totalResults?: number;
}

export const EpsSectionFilter: React.FC<EpsSectionFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const handleChange = (field: keyof EpsSectionFilterValues, value: string) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
  ];

  const activeCount = [
    Boolean(filters.search),
    Boolean(filters.status && filters.status !== 'all'),
    Boolean(filters.startDate),
    Boolean(filters.endDate),
  ].filter(Boolean).length;

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-xs space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <SearchInput
          value={filters.search}
          onChange={(val) => handleChange('search', val)}
          placeholder="Buscar por Nombre o Código..."
        />

        <FilterSelect
          value={filters.status}
          onChange={(val) => handleChange('status', val)}
          options={statusOptions}
          placeholder="Filtrar por estado"
        />

        <DateInput
          value={filters.startDate}
          onChange={(val) => handleChange('startDate', val)}
          placeholder="Fecha inicio"
        />

        <DateInput
          value={filters.endDate}
          onChange={(val) => handleChange('endDate', val)}
          placeholder="Fecha fin"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
        <div>
          {typeof totalResults === 'number' && (
            <span>
              Mostrando <strong className="text-gray-700">{totalResults}</strong> registro(s)
            </span>
          )}
        </div>

        <CleanFiltersButton
          onClean={onResetFilters}
          activeCount={activeCount}
          disabled={activeCount === 0}
        />
      </div>
    </div>
  );
};

export default EpsSectionFilter;