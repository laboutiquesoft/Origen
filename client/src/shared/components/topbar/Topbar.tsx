import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { UserMenu } from '../index';
import type { Tenant } from '../../../modules/auth/types/AuthTypes';
import type { UserMenuProps } from '../index';
import { ContextSwitcher } from '../../../modules/auth/context/ContextSwitcher';

export interface TopBarProps extends Omit<UserMenuProps, 'currentTenant' | 'onSwitchTenant'> {
    currentTenant?: Tenant | null;
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
    className?: string;
    title?: string;
    onSwitchTenant?: (tenantOrId: string | Tenant) => void | Promise<void>;
    onClearTenant?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
    currentTenant,
    user,
    onLogout,
    onToggleSidebar,
    isSidebarOpen,
    className = '',
    title = 'Origen',
    onSwitchTenant,
    onClearTenant
}) => {
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const isAllMighty = roles.some(r =>
        (typeof r === 'string' ? r : (r as any)?.name) === 'AllMighty'
    );

    const handleClearTenant = () => {
        if (onClearTenant) {
            onClearTenant();
        } else if (onSwitchTenant && currentTenant) {
            onSwitchTenant(currentTenant);
        }
    };

    return (
        <header className={`h-18 border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 ${className}`}>
            {onToggleSidebar && (
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 mr-4"
                >
                    <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg" />
                </button>
            )}

            <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {currentTenant && (
                        <div className="flex items-center gap-3 border-r border-gray-200 pr-6">
                            {currentTenant.logoUrl ? (
                                <img
                                    src={currentTenant.logoUrl}
                                    alt={currentTenant.tenant_name}
                                    className="w-14 h-14 rounded-lg object-contain"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                                    {currentTenant.initials}
                                </div>
                            )}
                            <div className="hidden md:flex flex-col">
                                <span className="font-bold text-gray-800 text-sm leading-tight">
                                    {currentTenant.tenant_name || (currentTenant as any).name || 'Mi Institución'}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Institución</span>
                            </div>
                        </div>
                    )}

                    {!currentTenant && title && (
                        <h1 className="logo text-lg">{title}</h1>
                    )}

                    {currentTenant && (
                        <div className="flex items-center gap-3">
                            <ContextSwitcher />
                            {isAllMighty && (onClearTenant || onSwitchTenant) && (
                                <button
                                    onClick={handleClearTenant}
                                    title="Salir de la Institución"
                                    className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all flex items-center justify-center group h-[46px] w-[46px]"
                                >
                                    <FontAwesomeIcon icon={faDoorOpen} className="group-hover:scale-110 transition-transform text-lg" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <UserMenu
                    user={user}
                    onLogout={onLogout}
                />
            </div>
        </header>
    );
};