import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faArrowRight, 
  faArrowLeft, // 👈 Importamos la flecha izquierda
  faEye, 
  faEyeSlash 
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../../../core/config/api';
import { useToast } from '../../../shared/components/toastContext/ToastContext';
import logoImg from '../../../assets/logo.png';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${authApi.baseUrl}/auth/login`, {
        email: data.email,
        password: data.password,
      });

      const { user } = response.data.data;

      await login(user);

      showToast({
        type: 'success',
        title: 'Bienvenido',
        message: 'Has iniciado sesión correctamente',
      });

      const rawRoles = user.user_roles || user.roles || [];
const userRoles: string[] = rawRoles.map((r: any) => {
  if (typeof r === 'string') return r;
  return r.role?.name || r.role_name || r.name || '';
});

// Comprobación insensible a mayúsculas/minúsculas para mayor seguridad
const isAllMighty = userRoles.some(
  (role) => role.toLowerCase() === 'allmighty'
);

if (isAllMighty) {
  navigate('/allmighty-dashboard');
} else {
  navigate('/tenant-dashboard');
}
    } catch (error: any) {
      console.error('Login error:', error);
      const message =
        error.response?.data?.message || 'Credenciales inválidas o error de conexión';

      showToast({
        type: 'error',
        title: 'Error',
        message: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-main-gradient text-[var(--text-primary)]">
      
      {/* BOTÓN DISCRETO PARA VOLVER AL INICIO */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-xs sm:text-sm transition-all border border-white/10 shadow-sm hover:scale-105"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Volver al inicio</span>
      </Link>

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-[60%] h-[60%] rounded-full opacity-10 blur-3xl transform translate-x-1/4 -translate-y-1/4"
          style={{ backgroundColor: 'var(--main-color)' }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-full opacity-10 blur-3xl transform -translate-x-1/4 translate-y-1/4"
          style={{ backgroundColor: 'var(--accent-color)' }}
        />
      </div>

      <div className="w-full max-w-md bg-page-primary rounded-3xl shadow-xl border border-[var(--border-color)] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300 mt-12 sm:mt-0">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">

            <div className='flex justify-center mb-4'>
                <img src={logoImg} alt="Logo" className="h-16 sm:h-20 w-auto object-contain" />
            </div>

            <h2 className="text-3xl font-extrabold text-accent mb-2 tracking-tight">
              Bienvenido
            </h2>
            <p className="text-sm font-medium text-[var(--text-third-color)]">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--text-third-color)] uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-[var(--bg-main)] text-[var(--text-primary)] text-sm font-medium placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                    errors.email 
                      ? 'border-rose-500 ring-rose-100' 
                      : 'border-[var(--border-color)] focus:border-[var(--main-color)] focus:ring-[var(--main-color)]/20'
                  }`}
                  placeholder="nombre@ejemplo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs font-semibold text-rose-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-third-color)] uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-[var(--bg-main)] text-[var(--text-primary)] text-sm font-medium placeholder-gray-400 transition-all focus:outline-none focus:ring-2 ${
                    errors.password 
                      ? 'border-rose-500 ring-rose-100' 
                      : 'border-[var(--border-color)] focus:border-[var(--main-color)] focus:ring-[var(--main-color)]/20'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none transition-colors"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-semibold text-rose-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <label className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="mr-2 rounded border-[var(--border-color)] text-[var(--main-color)] focus:ring-[var(--main-color)]" 
                />
                Recordarme
              </label>
              <Link 
                to="/forgot-password" 
                className="text-[var(--main-color)] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-button py-3.5 px-6 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Ingresar</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-[var(--bg-main)] px-8 py-4 text-center border-t border-[var(--border-color)]">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            ¿No tienes una cuenta?{' '}
            <a href="#support" className="font-bold text-[var(--main-color)] hover:underline">
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;