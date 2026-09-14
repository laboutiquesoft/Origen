// Interfaz base del objeto EPS
export interface Eps {
  id_eps?: string | number;
  eps_name: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EpsSectionStatsProps {
  total: number;
  active: number;
  inactive: number;
}

export interface EpsSectionFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onResetFilters: () => void;
  onCreateNew: () => void;
}

export interface EpsSectionDataTableProps {
  epsList: Eps[];
  isLoading: boolean;
  onViewDetail: (eps: Eps) => void;
  onEdit: (eps: Eps) => void;
  onDelete: (eps: Eps) => void;
  onToggleStatus: (eps: Eps) => void;
}

export interface EpsDetailModalProps {
  isOpen: boolean;
  eps: Eps | null;
  onClose: () => void;
}