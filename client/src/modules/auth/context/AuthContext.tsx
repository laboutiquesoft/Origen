import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../../core/config/api';
import type { User, Tenant, Site, AuthContextType } from '../types/AuthTypes';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [currentSite, setCurrentSite] = useState<Site | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    // 1. Derivar permisos directamente del estado de usuario
    const isAllMighty = user?.roles?.includes('AllMighty') ?? false;
    const isAdmin = isAllMighty || (user?.roles?.includes('Admin') ?? false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data } = await axios.get(`${authApi.baseUrl}/auth/me`, {
                    validateStatus: (status) => (status >= 200 && status < 300) || status === 401
                });

                if (data.status === 'success' && data.data?.user) {
                    const userData = data.data.user;
                    setUser(userData);

                    const storedTenant = localStorage.getItem('currentTenant');
                    if (storedTenant) {
                        const tenant = JSON.parse(storedTenant) as Tenant;
                        const userIsAllMighty = userData.roles?.includes('AllMighty');

                        if (userIsAllMighty || userData.tenants?.some((t: any) => t.id === tenant.id)) {
                            setCurrentTenant(tenant);

                            const userSites = userData.sites || [];
                            const storedSite = localStorage.getItem('currentSite');
                            let siteToSelect: Site | null = null;

                            if (userSites.length === 1 && !userIsAllMighty && !userData.roles?.includes('Admin')) {
                                siteToSelect = userSites[0];
                            } else if (storedSite) {
                                siteToSelect = JSON.parse(storedSite) as Site;
                                if (!userIsAllMighty && !userData.roles?.includes('Admin') && !userSites.some((s: Site) => s.id_site === siteToSelect?.id_site)) {
                                    siteToSelect = userSites.length > 0 ? userSites[0] : null;
                                }
                            }

                            if (siteToSelect) {
                                setCurrentSite(siteToSelect);
                                localStorage.setItem('currentSite', JSON.stringify(siteToSelect));

                                try {
                                    await axios.post(`${authApi.baseUrl}/auth/switch-context`, {
                                        tenantId: tenant.id,
                                        siteId: siteToSelect.id_site
                                    });
                                } catch (error) {
                                    console.log('Failed to silent refresh context:', error);
                                }
                            }
                        }
                    }
                } else {
                    setUser(null);
                    setCurrentTenant(null);
                }
            } catch (err: any) {
                console.error('Auth initialization error:', err);
                setUser(null);
                setCurrentTenant(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (userData: User) => {
        setUser(userData);
        if (userData.tenants && userData.tenants.length > 0) {
            const tenant = userData.tenants[0];
            setCurrentTenant(tenant);
            localStorage.setItem('currentTenant', JSON.stringify(tenant));

            const userIsAllMighty = userData.roles?.includes('AllMighty');
            const userIsAdmin = userData.roles?.includes('Admin');
            const userSites = userData.sites || [];

            let selectedSiteId = null;
            if (userSites.length === 1 && !userIsAllMighty && !userIsAdmin) {
                const site = userSites[0];
                setCurrentSite(site);
                localStorage.setItem('currentSite', JSON.stringify(site));
                selectedSiteId = site.id_site;
            } else {
                setCurrentSite(null);
                localStorage.removeItem('currentSite');
            }

            try {
                await axios.post(`${authApi.baseUrl}/auth/switch-context`, {
                    tenantId: tenant.id,
                    siteId: selectedSiteId
                });
            } catch (error) {
                console.error('Failed to set context on login:', error);
            }
            queryClient.invalidateQueries();
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${authApi.baseUrl}/auth/logout`);
        } catch (err) {
            console.error('Error during logout request:', err);
        }
        setUser(null);
        setCurrentTenant(null);
        setCurrentSite(null);
        localStorage.removeItem('currentTenant');
        localStorage.removeItem('currentSite');
        queryClient.clear();
        window.location.href = '/login';
    };

    const selectSite = async (site: Site | null) => {
        if (!currentTenant) return;

        try {
            await axios.post(`${authApi.baseUrl}/auth/switch-context`, {
                tenantId: currentTenant.id,
                siteId: site?.id_site || null
            });

            setCurrentSite(site);
            if (site) {
                localStorage.setItem('currentSite', JSON.stringify(site));
            } else {
                localStorage.removeItem('currentSite');
            }
            queryClient.invalidateQueries();
        } catch (err) {
            console.error('Error switching context:', err);
            throw err;
        }
    };

    const selectTenant = async (tenantOrId: string | Tenant) => {
        let tenant: Tenant | undefined;

        if (typeof tenantOrId === 'string') {
            if (user && user.tenants) {
                tenant = user.tenants.find(t => t.id === tenantOrId);
            }
        } else {
            tenant = tenantOrId;
        }

        if (tenant) {
            setCurrentTenant(tenant);
            const userIsAllMighty = user?.roles?.includes('AllMighty');
            const userIsAdmin = user?.roles?.includes('Admin');
            const userSites = user?.sites || [];

            let selectedSiteId = null;
            if (userSites.length === 1 && !userIsAllMighty && !userIsAdmin) {
                const site = userSites[0];
                setCurrentSite(site);
                localStorage.setItem('currentSite', JSON.stringify(site));
                selectedSiteId = site.id_site;
            } else {
                setCurrentSite(null);
                localStorage.removeItem('currentSite');
            }

            localStorage.setItem('currentTenant', JSON.stringify(tenant));

            try {
                await axios.post(`${authApi.baseUrl}/auth/switch-context`, {
                    tenantId: tenant.id,
                    siteId: selectedSiteId
                });
            } catch (error) {
                console.error('Failed to set context on tenant switch:', error);
            }
            queryClient.invalidateQueries();
        }
    };

    const clearTenant = () => {
        setCurrentTenant(null);
        localStorage.removeItem('currentTenant');
        queryClient.invalidateQueries();
    };

    const hasAccessToMicroservice = (code: string): boolean => {
        if (!user) return false;
        const roles = user.roles || [];
        if (roles.includes('AllMighty') || roles.includes('Admin')) return true;
        return user.microservices?.some(ms => ms.code === code) || false;
    };

    return (
        <AuthContext.Provider value={{
            user,
            currentTenant,
            currentSite,
            isAllMighty,                      // Expuesto al contexto
            isAdmin,                          // Expuesto al contexto
            login,
            logout,
            selectTenant,
            switchTenant: selectTenant,       // Alias para compatibilidad con DashboardLayout
            selectSite,
            clearTenant,
            isAuthenticated: !!user,
            isLoading,
            hasAccessToMicroservice
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};