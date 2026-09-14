// src/modules/catalogues/pages/GlobalCataloguePage.tsx
import { useState } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { SectionHeader } from '../../../shared/components';
import { TabNavigator, type CatalogTabId } from '../components/TabNavigator';
import { CATALOG_TABS_CONFIG } from '../constants/catalogTabsConfig';

import { GroupsSection } from '../sections/groupsSection/GroupsSection';
import { ServiciosSection } from '../sections/ServiciosSection';
import { ProcedimientosSection } from '../sections/ProcedimientosSection';
import { CupsSection } from '../sections/CupsSection';
import { ComplexitiesSection } from '../sections/complexitiesSection/ComplexitiesSection';
import { ModalidadesSection } from '../sections/ModalidadesSection';
import { EspecialidadesSection } from '../sections/EspecialidadesSection';
import { ProfesionalesSection } from '../sections/ProfesionalesSection';
import { EpsSection } from '../sections/epsSection/EpsSection';

function GlobalCataloguePage() {
    const [activeTab, setActiveTab] = useState<CatalogTabId>('grupos');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Configuración dinámica de la pestaña seleccionada
    const currentConfig = CATALOG_TABS_CONFIG[activeTab];

    // Acciones dinámicas enviadas al SectionHeader
    const headerActions = [
        {
            label: currentConfig.createButtonLabel,
            icon: faPlus,
            variant: 'primary' as const,
            onClick: () => setIsCreateModalOpen(true),
        },
    ];

    const handleCloseModal = () => setIsCreateModalOpen(false);

    return (
        <div className="space-y-6">
            {/* Header reactivo que cambia título, icono, subtítulo y botón según la pestaña activa */}
            <SectionHeader
                icon={currentConfig.icon}
                title={currentConfig.title}
                subtitle={currentConfig.subtitle}
                actions={headerActions}
            />

            {/* Navegador de Pestañas */}
            <TabNavigator
                defaultTab={activeTab}
                onTabChange={(tabId) => {
                    setActiveTab(tabId);
                    setIsCreateModalOpen(false);
                }}
                childrenViews={{
                    grupos: (
                        <GroupsSection
                            isCreateModalOpen={isCreateModalOpen && activeTab === 'grupos'}
                            onCloseCreateModal={handleCloseModal}
                        />
                    ),
                    servicios: (
                        <ServiciosSection
                            // isCreateModalOpen={isCreateModalOpen && activeTab === 'servicios'}
                            // onCloseCreateModal={handleCloseModal}
                        />
                    ),
                    procedimientos: (
                        <ProcedimientosSection
                            // isCreateModalOpen={isCreateModalOpen && activeTab === 'procedimientos'}
                            // onCloseCreateModal={handleCloseModal}
                        />
                    ),
                    cups: (
                        <CupsSection
                            // isCreateModalOpen={isCreateModalOpen && activeTab === 'cups'}
                            // onCloseCreateModal={handleCloseModal}
                        />
                    ),
                    complejidades: (
                        <ComplexitiesSection
                            // isCreateModalOpen={isCreateModalOpen && activeTab === 'complejidades'}
                            // onCloseCreateModal={handleCloseModal}
                        />
                    ),
                    modalidades: (
                        <ModalidadesSection
                            // isCreateModalOpen={isCreateModalOpen && activeTab === 'modalidades'}
                            // onCloseCreateModal={handleCloseModal}
                        />
                    ),
                    especialidades: (
                        <EspecialidadesSection
                            // isCreateModalOpen={isCreateModalOpen && activeTab === 'especialidades'}
                            // onCloseCreateModal={handleCloseModal}
                        />
                    ),
                    profesionales: (
                        <ProfesionalesSection
                            // isCreateModalOpen={isCreateModalOpen && activeTab === 'profesionales'}
                            // onCloseCreateModal={handleCloseModal}
                        />
                    ),
                    eps: (
                        <EpsSection
                            isCreateModalOpen={isCreateModalOpen && activeTab === 'eps'}
                            onCloseCreateModal={handleCloseModal}
                        />
                    ),
                }}
            />
        </div>
    );
}

export { GlobalCataloguePage };