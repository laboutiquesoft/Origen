import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { useToast } from '../../../shared/components/toastContext/ToastContext';

// Interfaz para dar compatibilidad completa con Topbar.tsx
export interface UserMenuProps {
  user?: {
    email?: string;
    role?: string | { name: string };
    roles?: string[] | { name: string }[];
    firstName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
  } | null;
  onLogout?: () => void;
}

export function UserMenu({ user: propUser, onLogout: propOnLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { logout, user: contextUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Priorizar el usuario pasado por props si existe, de lo contrario usar el del Contexto
  const currentUser = propUser !== undefined ? propUser : contextUser;

  // Extraer roles de forma segura
  const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const roleName = roles.length > 0
    ? (typeof roles[0] === 'string' ? roles[0] : (roles[0] as any)?.name)
    : (typeof currentUser?.roles === 'string' ? currentUser?.roles : (currentUser?.roles as any)?.name);

  // Formato del nombre a mostrar
  const displayName = currentUser?.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ''}`.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    : (currentUser as any)?.name || (currentUser as any)?.fullName || currentUser?.email || 'Usuario';

  // Iniciales del avatar
  const avatarInitial = currentUser?.firstName
    ? currentUser.firstName.charAt(0).toUpperCase()
    : currentUser?.email?.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);

    // Si viene la función onLogout desde las props, se ejecuta esa
    if (propOnLogout) {
      propOnLogout();
      return;
    }

    // De lo contrario, ejecuta el flujo por defecto con AuthContext
    try {
      await logout();
      showToast({
        type: 'info',
        title: 'Sesión cerrada',
        message: 'Has cerrado sesión correctamente',
      });
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un problema al cerrar la sesión',
      });
    }
  };

  return (
    <div className="relative ml-3" ref={dropdownRef}>
      {/* Botón de Perfil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 focus:outline-none group"
      >
        <div className="text-right hidden sm:block">
          <p className="font-semibold text-gray-800 text-sm group-hover:text-accent transition-colors">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 capitalize">{roleName || 'Usuario'}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-main-gradient flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all transform group-hover:scale-105">
          {avatarInitial}
        </div>
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Header de información de usuario */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
            <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-cyan-700">
              {roleName || 'Usuario'}
            </span>
          </div>

          {/* Opciones del Menú */}
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 gap-3 hover:bg-gray-50 transition-colors"
          >
            <UserIcon className="text-gray-400 w-4 h-4" />
            Mi Perfil
          </Link>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 gap-3 hover:bg-gray-50 transition-colors"
          >
            <Settings className="text-gray-400 w-4 h-4" />
            Configuración
          </Link>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2.5 text-sm gap-3 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="text-red-500 w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}