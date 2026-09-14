import { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faArrowRight, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { authApi } from '../../../core/config/api';
import { useToast } from '../../../shared/components/toastContext/ToastContext';
import logoImg from '../../../assets/logo.png';

const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setIsLoading(true);
    try {
      await axios.post(`${authApi.baseUrl}/auth/forgot-password`, {
        email: data.email,
      });

      setEmailSent(true);
      showToast({
        type: 'success',
        title: 'Correo enviado',
        message: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Error al enviar el correo de recuperación.';

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
      
      {/* Botón para volver al login superior */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-xs sm:text-sm transition-all border border-white/10 shadow-sm hover:scale-105"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Volver al Login</span>
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
            <div className="flex justify-center mb-4">
              <img src={logoImg} alt="Logo" className="h-16 sm:h-20 w-auto object-contain" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-accent mb-2 tracking-tight">
              Recuperar Contraseña
            </h2>
            <p className="text-sm font-medium text-[var(--text-third-color)]">
              {emailSent 
                ? 'Hemos procesado tu solicitud' 
                : 'Ingresa tu correo para recibir las instrucciones'}
            </p>
          </div>

          {!emailSent ? (
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
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-[var(--bg-main)] text-[var(--text-primary)] text-sm font-medium placeholder-[var(--text-secondary)] transition-all focus:outline-none focus:ring-2 ${
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-button py-3.5 px-6 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Enviar Correo</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <FontAwesomeIcon icon={faCheckCircle} className="text-3xl" />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                ¡Correo enviado con éxito! Revisa tu bandeja de entrada o la carpeta de spam para restablecer tu contraseña.
              </p>
            </div>
          )}

        </div>

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

export { ForgotPasswordPage } ;