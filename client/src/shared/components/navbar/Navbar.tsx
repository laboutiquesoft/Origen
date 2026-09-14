import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, Phone, LogIn, Menu, X } from 'lucide-react';

interface NavbarProps {
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
}

function Navbar({ isAuthenticated = false, onLoginClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Si el usuario está autenticado, no mostramos el menú móvil público
  if (isAuthenticated) return null;

  return (
    <>
      {/* Botón Hamburguesa: Visibilidad solo en móviles y tablets (< lg) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="Abrir menú"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Menú Desplegable Móvil / Tablet (< lg) para usuarios NO autenticados */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full border-b border-slate-100 shadow-xl px-4 py-4 z-40 fade-in">
          <div className="flex flex-col gap-2">
            <a 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Home size={18} className="text-[var(--main-color)]" />
              Inicio
            </a>
            <a 
              href="/nosotros" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Info size={18} className="text-[var(--main-color)]" />
              Nosotros
            </a>
            <a 
              href="/contacto" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Phone size={18} className="text-[var(--main-color)]" />
              Contacto
            </a>

            {/* Iniciar Sesión dentro del menú desplegable: SOLO se muestra en móvil (< sm) */}
            <div className="pt-2 mt-1 border-t border-slate-100 sm:hidden">
              <Link 
                to="/login"
                onClick={() => {
                  setIsOpen(false);
                  if (onLoginClick) onLoginClick();
                }}
                className="w-full gradient-button text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn size={18} />
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { Navbar };