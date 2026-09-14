import React, { useState, type ReactNode } from 'react';
import { Tabs, type TabItem } from '../../../shared/components/index';
import { 
  FolderTree, 
  Stethoscope, 
  Activity, 
  FileCode2, 
  Layers, 
  Sliders, 
  Award, 
  UserCheck, 
  Building2 
} from 'lucide-react';

export type CatalogTabId = 
  | 'grupos'
  | 'servicios'
  | 'procedimientos'
  | 'cups'
  | 'complejidades'
  | 'modalidades'
  | 'especialidades'
  | 'profesionales'
  | 'eps';

interface TabNavigatorProps {
  defaultTab?: CatalogTabId;
  onTabChange?: (tabId: CatalogTabId) => void;
  childrenViews?: Partial<Record<CatalogTabId, ReactNode>>;
}

export const TabNavigator: React.FC<TabNavigatorProps> = ({
  defaultTab = 'grupos',
  onTabChange,
  childrenViews,
}) => {
  const [activeTab, setActiveTab] = useState<CatalogTabId>(defaultTab);

  const catalogTabs: TabItem[] = [
    { id: 'grupos', label: 'Grupos', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'servicios', label: 'Servicios', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'procedimientos', label: 'Procedimientos', icon: <Activity className="w-4 h-4" /> },
    { id: 'cups', label: 'CUPS', icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'complejidades', label: 'Complejidades', icon: <Layers className="w-4 h-4" /> },
    { id: 'modalidades', label: 'Modalidades', icon: <Sliders className="w-4 h-4" /> },
    { id: 'especialidades', label: 'Especialidades', icon: <Award className="w-4 h-4" /> },
    { id: 'profesionales', label: 'Profesionales', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'eps', label: 'EPS', icon: <Building2 className="w-4 h-4" /> },
  ];

  const handleTabChange = (tabId: string) => {
    const selectedTab = tabId as CatalogTabId;
    setActiveTab(selectedTab);
    if (onTabChange) {
      onTabChange(selectedTab);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Navegación limpia de Pestañas sin tarjeta contenedora */}
      <Tabs
        tabs={catalogTabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Área de Contenido Dinámico */}
      <div className="w-full pt-2">
        {childrenViews && childrenViews[activeTab] ? (
          childrenViews[activeTab]
        ) : (
          <div className="p-8 border border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500">
              Contenido para el catálogo de <span className="font-semibold capitalize text-[var(--accent-color)]">{activeTab}</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};