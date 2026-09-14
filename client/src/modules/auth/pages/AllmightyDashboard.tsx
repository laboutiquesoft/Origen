import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { faBuilding, faUsers, faServer, faChartPie } from '@fortawesome/free-solid-svg-icons';
import { SectionHeader, AnimatedStatsCard } from '../../../shared/components';
import { authApi } from '../../../core/config/api';

function AllmightyDashboard() {
    // 1. Petición para obtener el conteo de Tenants (Instituciones)
    const { data: tenantsData, isLoading: tenantsLoading } = useQuery({
        queryKey: ['tenants-count'],
        queryFn: async () => {
            const res = await axios.get(`${authApi.baseUrl}/tenants?page=1&limit=1`);
            return res.data;
        }
    });

    // 2. Petición para obtener el conteo de Usuarios
    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['users-count'],
        queryFn: async () => {
            const res = await axios.get(`${authApi.baseUrl}/users?page=1&limit=1`);
            return res.data;
        }
    });

    // Extraer totales de los metadatos de las respuestas
    const totalTenants = tenantsData?.meta?.total || 0;
    const totalUsers = usersData?.meta?.total || 0;

    return (
        <div className="space-y-6">
            <SectionHeader 
                icon={faChartPie}
                title="Bienvenido Almighty"
                subtitle="Panel de Control General del Sistema"
            />

            {/* Grid de tarjetas con datos consumidos en tiempo real */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatedStatsCard
                    title="Instituciones"
                    value={tenantsLoading ? '...' : totalTenants}
                    icon={faBuilding}
                    gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    delay={0}
                    subtitle="Clínicas registradas"
                />

                <AnimatedStatsCard
                    title="Usuarios"
                    value={usersLoading ? '...' : totalUsers}
                    icon={faUsers}
                    gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    delay={100}
                    subtitle="Usuarios en el sistema"
                />

                <AnimatedStatsCard
                    title="Módulos Activos"
                    value="4"
                    icon={faServer}
                    gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                    delay={200}
                    subtitle="Microservicios disponibles"
                />
            </div>
        </div>
    );
}

export { AllmightyDashboard };