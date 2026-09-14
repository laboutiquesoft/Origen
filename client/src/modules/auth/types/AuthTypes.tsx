export interface Tenant {
  id: string;
  tenant_name: string;
  logoUrl?: string;
  initials: string;
}

export interface Site {
  id_site: string;
  site_name: string;
}

export interface UserMicroservice {
  id_microservice: string;
  code: string;
  microservice_name: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  tenants?: Tenant[];
  sites?: Site[];
  microservices?: UserMicroservice[];
  id_tenant?: string;
}

export interface AuthContextType {
  user: User | null;
  currentTenant: Tenant | null;
  currentSite: Site | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  isAllMighty: boolean;
  isAdmin: boolean;
  
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  selectTenant: (tenantOrId: string | Tenant) => Promise<void>;
  switchTenant: (tenantOrId: string | Tenant) => Promise<void>; // Alias de selectTenant
  selectSite: (site: Site | null) => Promise<void>;
  clearTenant: () => void;
  hasAccessToMicroservice: (code: string) => boolean;
}