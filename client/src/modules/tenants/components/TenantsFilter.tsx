import React from 'react';
import { SearchInput, FilterSelect, DateInput, CleanFiltersButton } from '../../../shared/components';

export interface TenantsFilterValues {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface TenantsFilterProps {
  filters: TenantsFilterValues;
  onFilterChange: (newFilters: TenantsFilterValues) => void;
  onResetFilters: () => void;
  totalResults?: number;
}

export const TenantsFilter: React.FC<TenantsFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const handleChange = (field: keyof TenantsFilterValues, value: string) => {
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

  // Contador de cuántos filtros están aplicados actualmente
  const activeCount = [
    Boolean(filters.search),
    Boolean(filters.status && filters.status !== 'all'),
    Boolean(filters.startDate),
    Boolean(filters.endDate),
  ].filter(Boolean).length;

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-sm space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Búsqueda general */}
        <SearchInput
          value={filters.search}
          onChange={(val) => handleChange('search', val)}
          placeholder="Buscar por Nombre, NIT o Código..."
        />

        {/* Filtro por Estado */}
        <FilterSelect
          value={filters.status}
          onChange={(val) => handleChange('status', val)}
          options={statusOptions}
          placeholder="Filtrar por estado"
        />

        {/* Fecha de Inicio */}
        <DateInput
          value={filters.startDate}
          onChange={(val) => handleChange('startDate', val)}
          placeholder="Fecha creación inicio"
        />

        {/* Fecha Fin */}
        <DateInput
          value={filters.endDate}
          onChange={(val) => handleChange('endDate', val)}
          placeholder="Fecha creación fin"
        />
      </div>

      {/* Barra de estado y botón de limpieza */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
        <div>
          {typeof totalResults === 'number' && (
            <span>
   
            </span>
          )}
        </div>

        {/* Integración correcta de CleanFiltersButton */}
        <CleanFiltersButton
          onClean={onResetFilters}
          activeCount={activeCount}
          disabled={activeCount === 0}
        />
      </div>
    </div>
  );
};

export default TenantsFilter;