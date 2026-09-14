import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/sidebar/Sidebar';
import { TopBar } from '../components/index'; 
import { useAuth } from '../../modules/auth/context/AuthContext';
import { getAllMightyNavigation, getTenantNavigation } from '../constants/navigation';

export const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);    
    const { user, currentTenant, isAllMighty, isAdmin, logout, switchTenant, clearTenant } = useAuth();

    // Determinar qué secciones del menú mostrar según el rol / contexto activo
    const navSections = isAllMighty 
        ? getAllMightyNavigation(isAdmin) 
        : getTenantNavigation();

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Menú Lateral Reutilizable y Dinámico */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                sections={navSections}
            />

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <TopBar className='bg-white'
                    currentTenant={currentTenant}
                    user={user}
                    onLogout={logout}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    isSidebarOpen={sidebarOpen}
                    onSwitchTenant={(tenant) => switchTenant(tenant)}
                    onClearTenant={clearTenant}
                />

                <main className="bg-page-secondary flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;