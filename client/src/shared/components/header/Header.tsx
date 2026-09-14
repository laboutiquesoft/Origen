import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Navbar } from '../index';
import { UserMenu } from '../index';
import logoImg from '../../../assets/logo.png';

interface HeaderProps {
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
}

function Header({ isAuthenticated = false, onLoginClick }: HeaderProps) {
  return (
    <header className="bg-page-secondary sticky top-0 z-30 transition-all">
      <div className="w-full max-w-full flex items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-12 py-2.5">
        
        <div className="flex items-center gap-3">
          <Navbar 
            isAuthenticated={isAuthenticated} 
            onLoginClick={onLoginClick} 
          />
          <Link to="/" className="flex items-center">
            <img src={logoImg} alt="Logo" className="h-9 sm:h-11 w-auto object-contain" />
          </Link>
        </div> 

        {/* 2. DERECHA: Menú de Navegación Público O Menú de Usuario */}
        <div className="flex items-center gap-6">
          
          {/* Navegación Desktop (≥ lg): SOLO visible si NO está autenticado */}
          {!isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                to="/" 
                className="text-sm font-semibold text-slate-700 hover:text-[var(--main-color)] transition-colors"
              >
                Inicio
              </Link>
              <Link 
                to="/nosotros" 
                className="text-sm font-semibold text-slate-700 hover:text-[var(--main-color)] transition-colors"
              >
                Nosotros
              </Link>
              <Link 
                to="/contacto" 
                className="text-sm font-semibold text-slate-700 hover:text-[var(--main-color)] transition-colors"
              >
                Contacto
              </Link>
            </nav>
          )}

          {/* Autenticación / Menú de Usuario */}
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="hidden sm:block">
              <Link 
                to="/login"
                onClick={onLoginClick}
                className="gradient-button text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
              >
                <LogIn size={16} />
                Iniciar Sesión
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}

export { Header };