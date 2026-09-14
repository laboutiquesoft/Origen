import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import type { CatalogSectionProps } from '../../types/catalogue.types';
import { cataloguesApi } from '../../../../core/config/api';
import { useToast, ConfirmationModal } from '../../../../shared/components';

// Subcomponentes específicos
import { EpsSectionStats } from './components/EpsSectionStats';
import { EpsSectionFilter, type EpsSectionFilterValues } from './components/EpsSectionFilter';
import { EpsSectionDataTable, type Eps } from './components/EpsSectionDataTable';
import { DetailEpsModal } from './modals/DetailEpsModal';

// Modales de Acción
import { CreateEpsModal } from './modals/CreateEpsModal';
import { EditEpsModal } from './modals/EditEpsModal';

const initialFilters: EpsSectionFilterValues = {
  search: '',
  status: 'all',
  startDate: '',
  endDate: '',
};

export const EpsSection: React.FC<CatalogSectionProps> = ({
  isCreateModalOpen,
  onCloseCreateModal,
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Estados
  const [filters, setFilters] = useState<EpsSectionFilterValues>(initialFilters);
  const [viewingEps, setViewingEps] = useState<Eps | null>(null);
  const [editingEps, setEditingEps] = useState<Eps | null>(null);
  const [deletingEps, setDeletingEps] = useState<Eps | null>(null);

  // Fetching de datos
  const { data: epsResponse, isLoading, isError } = useQuery({
    queryKey: ['catalogues', 'eps'],
    queryFn: async () => {
      const res = await axios.get(`${cataloguesApi.baseUrl}/eps`, {
        withCredentials: true,
      });
      return res.data;
    },
  });

  const epsList: Eps[] = epsResponse?.data || epsResponse || [];

  // Mutación para Eliminar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${cataloguesApi.baseUrl}/eps/${id}`, {
        withCredentials: true,
      });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'EPS Eliminada',
        message: 'La EPS ha sido eliminada correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['catalogues', 'eps'] });
      setDeletingEps(null);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'No se pudo eliminar la EPS.';
      showToast({
        type: 'error',
        title: 'Error',
        message: msg,
      });
    },
  });

  // Filtrado reactivo directo sobre los campos de Eps
  const filteredEps = useMemo(() => {
    return epsList.filter((epsItem) => {
      const search = filters.search.toLowerCase().trim();

      const matchesSearch =
        !search ||
        epsItem.eps_name.toLowerCase().includes(search) ||
        (epsItem.code && epsItem.code.toLowerCase().includes(search));

      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && epsItem.status === true) ||
        (filters.status === 'inactive' && epsItem.status === false);

      let matchesDate = true;
      if (epsItem.created_at) {
        const createdAt = new Date(epsItem.created_at).getTime();

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
  }, [epsList, filters]);

  // Handlers
  const handleConfirmDelete = () => {
    if (deletingEps?.id_eps) {
      deleteMutation.mutate(deletingEps.id_eps);
    }
  };

  return (
    <div className="space-y-6">
      <EpsSectionStats
        epsList={filteredEps}
        isLoading={isLoading}
        isError={isError}
      />

      <EpsSectionFilter
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={() => setFilters(initialFilters)}
        totalResults={filteredEps.length}
      />

      <EpsSectionDataTable
        epsList={filteredEps}
        isLoading={isLoading}
        onViewEps={(eps) => setViewingEps(eps)}
        onEditEps={(eps) => setEditingEps(eps)}
        onDeleteEps={(eps) => setDeletingEps(eps)}
      />

      {/* Modal Crear */}
      {isCreateModalOpen && (
        <CreateEpsModal
          isOpen={isCreateModalOpen}
          onClose={onCloseCreateModal}
        />
      )}

      {/* Modal Editar */}
      <EditEpsModal
        eps={editingEps}
        isOpen={Boolean(editingEps)}
        onClose={() => setEditingEps(null)}
      />

      {/* Modal Detalle */}
      <DetailEpsModal
        eps={viewingEps}
        isOpen={Boolean(viewingEps)}
        onClose={() => setViewingEps(null)}
      />

      {/* Modal Eliminar */}
      <ConfirmationModal
        isOpen={Boolean(deletingEps)}
        onClose={() => setDeletingEps(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar EPS?"
        description={`¿Estás seguro de que deseas eliminar permanentemente la EPS "${
          deletingEps?.eps_name || ''
        }"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        disabled={deleteMutation.isPending}
      />
    </div>
  );
};

export default EpsSection;