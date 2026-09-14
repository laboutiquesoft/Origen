import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { authApi } from '../../../core/config/api';
import { useToast } from '../../../shared/components/toastContext/ToastContext';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import logoImg from '../../../assets/logo.png';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    passwordConfirm: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  });

type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInputs) => {
    setIsLoading(true);
    try {
      const response = await axios.patch(`${authApi.baseUrl}/auth/reset-password/${token}`, {
        password: data.password,
      });

      const respData = response.data;

      if (respData.data?.user) {
        login(respData.data.user);
        showToast({
          type: 'success',
          title: 'Éxito',
          message: 'Contraseña restablecida correctamente.',
        });
        navigate('/dashboard-allmighty');
      } else {
        showToast({
          type: 'success',
          title: 'Éxito',
          message: 'Contraseña restablecida. Inicia sesión.',
        });
        navigate('/login');
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al restablecer contraseña o token no válido.';

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
      
      {/* Botón flotante para regresar al login */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-xs sm:text-sm transition-all border border-white/10 shadow-sm hover:scale-105"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Volver al Login</span>
      </Link>

      {/* Elementos decorativos de fondo */}
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

      {/* Tarjeta principal */}
      <div className="w-full max-w-md bg-page-primary rounded-3xl shadow-xl border border-[var(--border-color)] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300 mt-12 sm:mt-0">
        <div className="p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logoImg} alt="Logo" className="h-16 sm:h-20 w-auto object-contain" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-accent mb-2 tracking-tight">
              Nueva Contraseña
            </h2>
            <p className="text-sm font-medium text-[var(--text-third-color)]">
              Ingresa tu nueva contraseña para actualizar el acceso
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Campo: Nueva Contraseña */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-third-color)] uppercase tracking-wider mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-[var(--bg-main)] text-[var(--text-primary)] text-sm font-medium placeholder-[var(--text-secondary)] transition-all focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-rose-500 ring-rose-100'
                      : 'border-[var(--border-color)] focus:border-[var(--main-color)] focus:ring-[var(--main-color)]/20'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
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

            {/* Campo: Confirmar Contraseña */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-third-color)] uppercase tracking-wider mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]">
                  <FontAwesomeIcon icon={faLock} />
                </div>
                <input
                  {...register('passwordConfirm')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-[var(--bg-main)] text-[var(--text-primary)] text-sm font-medium placeholder-[var(--text-secondary)] transition-all focus:outline-none focus:ring-2 ${
                    errors.passwordConfirm
                      ? 'border-rose-500 ring-rose-100'
                      : 'border-[var(--border-color)] focus:border-[var(--main-color)] focus:ring-[var(--main-color)]/20'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className="mt-1.5 text-xs font-semibold text-rose-500">
                  {errors.passwordConfirm.message}
                </p>
              )}
            </div>

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-button py-3.5 px-6 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Cambiar Contraseña</span>
                  <FontAwesomeIcon icon={faCheck} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer del card */}
        <div className="bg-[var(--bg-main)] px-8 py-4 text-center border-t border-[var(--border-color)]">
          <Link 
            to="/login" 
            className="text-xs font-bold text-[var(--main-color)] hover:underline flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export  { ResetPasswordPage };