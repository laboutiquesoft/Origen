import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faChevronDown, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from './AuthContext';
import { authApi } from '../../../core/config/api';

export const ContextSwitcher: React.FC = () => {
    const { currentTenant, currentSite, selectSite, user } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const roles = user?.roles || [];
    const isGlobalRole = roles.includes('AllMighty') || roles.includes('Admin');

    // Fetch sites for the current tenant
    const { data: sites = [], isLoading } = useQuery({
        queryKey: ['sites', currentTenant?.id],
        queryFn: async () => {
            if (!currentTenant?.id) return [];
            const { data } = await axios.get(`${authApi.baseUrl}/sites`, {
                params: { tenantId: currentTenant.id }
            });

            const allSites = data.data;

            if (isGlobalRole) return allSites;

            // Filter by user's assigned sites
            const userSiteIds = user?.sites?.map(s => s.id_site) || [];
            return allSites.filter((s: any) => userSiteIds.includes(s.id_site));
        },
        enabled: !!currentTenant?.id,
    });

    // Close dropdown on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!currentTenant) return null;

    // Hide switcher if user only has 1 site and is not AllMighty/Admin
    if (!isGlobalRole && sites.length === 1) return null;

    const handleSiteSelect = async (site: any) => {
        await selectSite(site);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all text-sm group"
            >
                <div className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <FontAwesomeIcon icon={currentSite ? faMapMarkerAlt : faGlobe} />
                </div>
                <div className="flex flex-col items-start min-w-[120px]">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold leading-none mb-0.5">Sede Activa</span>
                    <span className="font-semibold text-gray-700 truncate max-w-[150px]">
                        {currentSite?.site_name || (isGlobalRole ? 'Global (Tenant)' : 'Seleccionar sede...')}
                    </span>
                </div>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-gray-400 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top animate-down">
                    <div className="p-3 bg-gray-50 border-b border-gray-100">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Cambiar Sede</h4>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                        {isGlobalRole && (
                            <button
                                onClick={() => handleSiteSelect(null)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-purple-50 ${!currentSite ? 'bg-purple-50/50' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!currentSite ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <FontAwesomeIcon icon={faGlobe} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${!currentSite ? 'text-purple-700' : 'text-gray-700'}`}>Global</span>
                                    <span className="text-[10px] text-gray-400">Acceso a toda la institución</span>
                                </div>
                            </button>
                        )}

                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400 text-sm italic">Cargando sedes...</div>
                        ) : sites.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">No se encontraron sedes.</div>
                        ) : (
                            sites.map((site: any) => (
                                <button
                                    key={site.id_site}
                                    onClick={() => handleSiteSelect(site)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-purple-50 ${currentSite?.id_site === site.id_site ? 'bg-purple-50/50' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentSite?.id_site === site.id_site ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${currentSite?.id_site === site.id_site ? 'text-purple-700' : 'text-gray-700'}`}>{site.site_name || site.name}</span>
                                        <span className="text-[10px] text-gray-400">{site.city}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
