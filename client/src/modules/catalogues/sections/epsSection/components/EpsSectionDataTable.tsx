import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeartPulse,
  faEdit,
  faTrash,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { DataTable } from '../../../../../shared/components/index';
import type { Column, Action } from '../../../../../shared/components/index';

// Entidad idéntica al modelo EPS del backend
export interface Eps {
  id_eps?: string;
  code?: string;
  eps_name: string;
  status: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

interface EpsSectionDataTableProps {
  epsList: Eps[];
  isLoading?: boolean;
  onViewEps?: (eps: Eps) => void;
  onEditEps: (eps: Eps) => void;
  onDeleteEps: (eps: Eps) => void;
}

export const EpsSectionDataTable: React.FC<EpsSectionDataTableProps> = ({
  epsList,
  isLoading = false,
  onViewEps,
  onEditEps,
  onDeleteEps,
}) => {
  const columns: Column<Eps>[] = useMemo(
    () => [
      {
        key: 'eps_name',
        header: 'Nombre EPS',
        render: (eps) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white text-sm font-bold shadow-xs shrink-0">
              <FontAwesomeIcon icon={faHeartPulse} />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm hover:text-indigo-600 transition-colors">
                {eps.eps_name}
              </div>
            </div>
          </div>
        ),
      },
      // {
      //   key: 'code',
      //   header: 'Código',
      //   render: (eps) => (
      //     <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md w-fit">
      //       <span>{eps.code || 'N/A'}</span>
      //     </div>
      //   ),
      // },
      {
        key: 'status',
        header: 'Estado',
        render: (eps) => (
          <span
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${
              eps.status
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                eps.status ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {eps.status ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
    ],
    []
  );

  const actions: Action<Eps>[] = useMemo(
    () => [
      {
        icon: faEye,
        title: 'Ver Detalles',
        variant: 'blue',
        onClick: (eps) => onViewEps && onViewEps(eps),
      },
      {
        icon: faEdit,
        title: 'Editar',
        variant: 'amber',
        onClick: (eps) => onEditEps(eps),
      },
      {
        icon: faTrash,
        title: 'Eliminar',
        variant: 'red',
        onClick: (eps) => onDeleteEps(eps),
      },
    ],
    [onViewEps, onEditEps, onDeleteEps]
  );

  return (
    <DataTable<Eps>
      data={epsList}
      columns={columns}
      actions={actions}
      keyExtractor={(eps) => eps.id_eps || eps.eps_name}
      isLoading={isLoading}
      emptyMessage="No se encontraron registros de EPS."
      initialPageSize={10}
    />
  );
};

export default EpsSectionDataTable;