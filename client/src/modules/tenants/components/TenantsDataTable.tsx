import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faEdit,
  faTrash,
  faServer,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { DataTable } from '../../../shared/components/index';
import type { Column, Action } from '../../../shared/components/index';

export interface Tenant {
  id_tenant: string;
  tenant_name: string;
  nit: string;
  initials?: string;
  city?: string;
  country?: string;
  status: boolean;
  logoUrl?: string;
  enablement_code?: string;
  created_at?: string;
  email?: string;
  phone?: string;
  tenant_microservices?: Array<any>;
  [key: string]: any;
}

interface TenantsDataTableProps {
  tenants: Tenant[];
  isLoading?: boolean;
  onSelectTenant: (tenant: Tenant) => void;
  onViewTenant?: (tenant: Tenant) => void;
  onEditTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenant: Tenant) => void;
  onManageServices: (tenant: Tenant) => void;
}

export const TenantsDataTable: React.FC<TenantsDataTableProps> = ({
  tenants,
  isLoading = false,
  onSelectTenant,
  onViewTenant,
  onEditTenant,
  onDeleteTenant,
  onManageServices,
}) => {
  // Configuración de las Columnas de la Tabla
  const columns: Column<Tenant>[] = useMemo(
    () => [
      {
        key: 'tenant_name',
        header: 'Institución',
        render: (tenant) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-main-gradient to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0 overflow-hidden">
              {tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt={tenant.tenant_name} className="w-full h-full object-cover" />
              ) : (
                tenant.initials || tenant.tenant_name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm hover:text-purple-600 transition-colors">
                {tenant.tenant_name}
              </div>
              {(tenant.city || tenant.country) && (
                <div className="text-xs text-gray-400">
                  {tenant.city}
                  {tenant.city && tenant.country ? ', ' : ''}
                  {tenant.country}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'nit',
        header: 'NIT',
        render: (tenant) => (
          <span className="text-sm text-gray-600 font-medium">
            {tenant.nit}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Estado',
        render: (tenant) => (
          <span
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${
              tenant.status
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                tenant.status ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            {tenant.status ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
      {
        key: 'tenant_microservices',
        header: 'Microservicios',
        align: 'center',
        render: (tenant) => (
          <button
            type="button"
            onClick={() => onManageServices(tenant)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Gestionar microservicios"
          >
            <FontAwesomeIcon icon={faServer} />
            <span>{tenant.tenant_microservices?.length || 0}</span>
          </button>
        ),
      },
    ],
    [onManageServices]
  );

  // Definición de las Acciones por Fila
  const actions: Action<Tenant>[] = useMemo(
    () => [
      {
        icon: faBuilding,
        title: 'Ingresar al Dashboard',
        variant: 'emerald',
        onClick: (tenant) => onSelectTenant(tenant),
      },
      {
        icon: faEye,
        title: 'Ver Detalles',
        variant: 'blue',
        onClick: (tenant) => onViewTenant && onViewTenant(tenant),
      },
      {
        icon: faEdit,
        title: 'Editar',
        variant: 'amber',
        onClick: (tenant) => onEditTenant(tenant),
      },
      {
        icon: faTrash,
        title: 'Eliminar',
        variant: 'red',
        onClick: (tenant) => onDeleteTenant(tenant),
      },
    ],
    [onSelectTenant, onViewTenant, onEditTenant, onDeleteTenant]
  );

  return (
    <DataTable<Tenant>
      data={tenants}
      columns={columns}
      actions={actions}
      keyExtractor={(tenant) => tenant.id_tenant}
      isLoading={isLoading}
      emptyMessage="No se encontraron instituciones registradas."
      initialPageSize={10}
    />
  );
};

export default TenantsDataTable;