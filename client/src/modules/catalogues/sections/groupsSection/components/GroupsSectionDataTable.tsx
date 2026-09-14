import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faEdit,
  faTrash,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { DataTable } from '../../../../../shared/components/index';
import type { Column, Action } from '../../../../../shared/components/index';

// Entidad idéntica a la clase ServiceGroup del backend
export interface ServiceGroup {
  id_service_group?: string;
  code: string;
  service_group_name: string;
  description?: string;
  status: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

interface GroupsSectionDataTableProps {
  groups: ServiceGroup[];
  isLoading?: boolean;
  onViewGroup?: (group: ServiceGroup) => void;
  onEditGroup: (group: ServiceGroup) => void;
  onDeleteGroup: (group: ServiceGroup) => void;
}

export const GroupsSectionDataTable: React.FC<GroupsSectionDataTableProps> = ({
  groups,
  isLoading = false,
  onViewGroup,
  onEditGroup,
  onDeleteGroup,
}) => {
  const columns: Column<ServiceGroup>[] = useMemo(
    () => [
      {
        key: 'service_group_name',
        header: 'Grupos de Servicios / Sección',
        render: (group) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white text-sm font-bold shadow-xs shrink-0">
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm hover:text-indigo-600 transition-colors">
                {group.service_group_name}
              </div>
              {/* {group.description && (
                <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                  {group.description}
                </div>
              )} */}
            </div>
          </div>
        ),
      },
      {
        key: 'code',
        header: 'Código',
        render: (group) => (
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md w-fit">            
            <span>{group.code}</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Estado',
        render: (group) => (
          <span
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${
              group.status
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                group.status ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {group.status ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
    ],
    []
  );

  const actions: Action<ServiceGroup>[] = useMemo(
    () => [
      {
        icon: faEye,
        title: 'Ver Detalles',
        variant: 'blue',
        onClick: (group) => onViewGroup && onViewGroup(group),
      },
      {
        icon: faEdit,
        title: 'Editar',
        variant: 'amber',
        onClick: (group) => onEditGroup(group),
      },
      {
        icon: faTrash,
        title: 'Eliminar',
        variant: 'red',
        onClick: (group) => onDeleteGroup(group),
      },
    ],
    [onViewGroup, onEditGroup, onDeleteGroup]
  );

  return (
    <DataTable<ServiceGroup>
      data={groups}
      columns={columns}
      actions={actions}
      keyExtractor={(group) => group.id_service_group || group.code}
      isLoading={isLoading}
      emptyMessage="No se encontraron grupos o secciones registrados."
      initialPageSize={10}
    />
  );
};

export default GroupsSectionDataTable;