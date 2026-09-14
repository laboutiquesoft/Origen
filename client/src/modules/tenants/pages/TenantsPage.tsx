import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast, SectionHeader, ConfirmationModal } from "../../../shared/components";
import { faPlus, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authApi } from "../../../core/config/api";

import CreateTenantModal from "../modals/CreateTenantModal";
import TenantDetailModal from "../components/TenantDetailModal";
import EditTenantModal from "../modals/EditTenantModal";
// import TenantMicroservicesModal from "../modals/TenantMicroservicesModal";
import TenantStats from "../components/TenantStats";
import TenantsDataTable from "../components/TenantsDataTable";
import { TenantsFilter } from "../components/TenantsFilter";
import type { TenantsFilterValues } from "../components/TenantsFilter";
import type { Tenant } from "../components/TenantsDataTable";

// Estado inicial para los filtros
const initialFilters: TenantsFilterValues = {
  search: "",
  status: "all",
  startDate: "",
  endDate: "",
};

function TenantsPage() {
  const { selectTenant } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Estado de Filtros
  const [filters, setFilters] = useState<TenantsFilterValues>(initialFilters);

  // Estados de control de Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [managingServicesTenant, setManagingServicesTenant] = useState<Tenant | null>(null);

  // Consulta de Tenants desde el backend
  const { data: tenantsResponse, isLoading, isError } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await axios.get(`${authApi.baseUrl}/tenants`);
      return res.data;
    },
  });

  // Mutación para Eliminar Tenant
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${authApi.baseUrl}/tenants/${id}`);
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Tenant Eliminado',
        message: 'El tenant ha sido eliminado correctamente.',
      });
      
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setDeletingTenant(null);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'No se pudo eliminar el tenant.';
      showToast({
        type: 'error',
        title: 'Error',
        message: msg,
      });
    },
  });

  // Lista base obtenida de la API
  const tenantsList: Tenant[] = tenantsResponse?.data || tenantsResponse || [];

  // Filtrado reactivo en tiempo real (onChange)
  const filteredTenants = useMemo(() => {
    return tenantsList.filter((tenant) => {
      const search = filters.search.toLowerCase().trim();
      const matchesSearch =
        !search ||
        tenant.tenant_name?.toLowerCase().includes(search) ||
        tenant.nit?.toLowerCase().includes(search) ||
        tenant.enablement_code?.toLowerCase().includes(search);

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" && tenant.status === true) ||
        (filters.status === "inactive" && tenant.status === false);

      let matchesDate = true;
      if (tenant.created_at) {
        const createdAt = new Date(tenant.created_at).getTime();

        if (filters.startDate) {
          const start = new Date(filters.startDate).getTime();
          if (createdAt < start) matchesDate = false;
        }

        if (filters.endDate) {
          const end = new Date(`${filters.endDate}T23:59:59`).getTime();
          if (createdAt > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [tenantsList, filters]);

  // Handlers de Acciones
  const handleSelectTenant = (tenant: Tenant) => {
    const normalizedTenant = {
      id: tenant.id_tenant,
      name: tenant.tenant_name,
      tenant_name: tenant.tenant_name,
      nit: tenant.nit,
      initials: tenant.initials || '',
      logoUrl: tenant.logoUrl || '',
    };
    
    selectTenant(normalizedTenant);
    navigate("/tenant-dashboard");
  };

  // Abre el modal de confirmación seleccionando el tenant
  const handleDeleteTenant = (tenant: Tenant) => {
    setDeletingTenant(tenant);
  };

  // Ejecuta la mutación al hacer clic en "Sí, eliminar" dentro del modal
  const handleConfirmDelete = () => {
    if (deletingTenant) {
      deleteMutation.mutate(deletingTenant.id_tenant);
    }
  };

  const headerActions = [
    {
      label: "Nuevo Tenant",
      icon: faPlus,
      variant: "primary" as const,
      onClick: () => setIsCreateModalOpen(true),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <SectionHeader 
        icon={faBuilding}
        title="Gestión de Tenants"
        subtitle="Administración y control centralizado de las instituciones registradas."
        actions={headerActions}
      />

      {/* Tarjetas de Estadísticas Reacciones a los Filtros */}
      <div>
        <TenantStats 
          tenants={filteredTenants} 
          isLoading={isLoading} 
          isError={isError} 
        />
      </div>

      {/* Filtros de Búsqueda, Estado y Fechas */}
      <TenantsFilter
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(initialFilters)}
        totalResults={filteredTenants.length}
      />

      {/* Tabla de Datos */}
      <div>
        <TenantsDataTable
          tenants={filteredTenants}
          isLoading={isLoading}
          onSelectTenant={handleSelectTenant}
          onViewTenant={(tenant) => setViewingTenant(tenant)}
          onEditTenant={(tenant) => setEditingTenant(tenant)}
          onDeleteTenant={handleDeleteTenant}
          onManageServices={(tenant) => setManagingServicesTenant(tenant)}
        />
      </div>

      {/* Modal de Creación */}
      {isCreateModalOpen && (
        <CreateTenantModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}

      {/* Modal de Detalles */}
      <TenantDetailModal
        tenant={viewingTenant}
        isOpen={Boolean(viewingTenant)}
        onClose={() => setViewingTenant(null)}
        onSelectTenant={handleSelectTenant}
      />

      {/* Modal de Edición */}
      <EditTenantModal 
        tenant={editingTenant} 
        isOpen={Boolean(editingTenant)}
        onClose={() => setEditingTenant(null)} 
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmationModal
        isOpen={Boolean(deletingTenant)}
        onClose={() => setDeletingTenant(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Institución?"
        description={`¿Estás seguro de que deseas eliminar permanentemente el tenant "${
          deletingTenant?.tenant_name || ''
        }"? Esta acción no se puede deshacer y podría afectar el acceso de los usuarios vinculados.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        disabled={deleteMutation.isPending}
      />

      {/* {managingServicesTenant && (
        <TenantMicroservicesModal 
          tenant={managingServicesTenant} 
          onClose={() => setManagingServicesTenant(null)} 
        />
      )} */}
    </div>
  );
}

export { TenantsPage };