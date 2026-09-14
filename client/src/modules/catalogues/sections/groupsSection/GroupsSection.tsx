import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import type { CatalogSectionProps } from '../../types/catalogue.types';
import { cataloguesApi } from '../../../../core/config/api';
import { useToast, ConfirmationModal } from '../../../../shared/components';

// Subcomponentes específicos
import { GroupsSectionStats } from './components/GroupsSectionStats';
import { GroupsSectionFilter, type GroupsSectionFilterValues } from './components/GroupsSectionFilter';
import { GroupsSectionDataTable, type ServiceGroup } from './components/GroupsSectionDataTable';
import { GroupsSectionDetailModal } from './modals/GroupsSectionDetailModal';

// Modales de Acción
import { CreateGroupModal } from './modals/CreateGroupModal';
import { EditGroupModal } from './modals/EditGroupModal';

const initialFilters: GroupsSectionFilterValues = {
  search: '',
  status: 'all',
  startDate: '',
  endDate: '',
};

export const GroupsSection: React.FC<CatalogSectionProps> = ({
  isCreateModalOpen,
  onCloseCreateModal,
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [filters, setFilters] = useState<GroupsSectionFilterValues>(initialFilters);
  const [viewingGroup, setViewingGroup] = useState<ServiceGroup | null>(null);
  const [editingGroup, setEditingGroup] = useState<ServiceGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<ServiceGroup | null>(null);

  // Fetching de datos
  const { data: groupsResponse, isLoading, isError } = useQuery({
    queryKey: ['catalogues', 'groups'],
    queryFn: async () => {
      const res = await axios.get(`${cataloguesApi.baseUrl}/service-groups`, {
        withCredentials: true,
      });
      return res.data;
    },
  });

  const groupsList: ServiceGroup[] = groupsResponse?.data || groupsResponse || [];

  // Mutación para Eliminar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${cataloguesApi.baseUrl}/service-groups/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Grupo Eliminado',
        message: 'El grupo ha sido eliminado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['catalogues', 'groups'] });
      setDeletingGroup(null);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'No se pudo eliminar el grupo.';
      showToast({
        type: 'error',
        title: 'Error',
        message: msg,
      });
    },
  });

  // Filtrado reactivo directo sobre los campos de ServiceGroup
  const filteredGroups = useMemo(() => {
    return groupsList.filter((group) => {
      const search = filters.search.toLowerCase().trim();
      
      const matchesSearch =
        !search ||
        group.service_group_name.toLowerCase().includes(search) ||
        group.code.toLowerCase().includes(search) ||
        group.description?.toLowerCase().includes(search);

      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && group.status === true) ||
        (filters.status === 'inactive' && group.status === false);

      let matchesDate = true;
      if (group.created_at) {
        const createdAt = new Date(group.created_at).getTime();

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
  }, [groupsList, filters]);

  // Handlers
  const handleConfirmDelete = () => {
    if (deletingGroup?.id_service_group) {
      deleteMutation.mutate(deletingGroup.id_service_group);
    }
  };

  return (
    <div className="space-y-6">
      <GroupsSectionStats
        groups={filteredGroups}
        isLoading={isLoading}
        isError={isError}
      />

      <GroupsSectionFilter
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(initialFilters)}
        totalResults={filteredGroups.length}
      />

      <GroupsSectionDataTable
        groups={filteredGroups}
        isLoading={isLoading}
        onViewGroup={(group) => setViewingGroup(group)}
        onEditGroup={(group) => setEditingGroup(group)}
        onDeleteGroup={(group) => setDeletingGroup(group)}
      />

      {/* Modal Crear */}
      {isCreateModalOpen && (
        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={onCloseCreateModal}
        />
      )}

      {/* Modal Editar */}
      <EditGroupModal
        group={editingGroup}
        isOpen={Boolean(editingGroup)}
        onClose={() => setEditingGroup(null)}
      />

      {/* Modal Detalle */}
      <GroupsSectionDetailModal
        group={viewingGroup}
        isOpen={Boolean(viewingGroup)}
        onClose={() => setViewingGroup(null)}
      />

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={Boolean(deletingGroup)}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar Grupo?"
        description={`¿Estás seguro de que deseas eliminar permanentemente el grupo "${
          deletingGroup?.service_group_name || ''
        }"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        disabled={deleteMutation.isPending}
      />
    </div>
  );
};