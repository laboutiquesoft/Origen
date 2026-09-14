import { useState } from "react";
import { Send, Save, CheckCircle } from "lucide-react";
import "./App.css";

// Importaciones centralizadas mediante Barrel pattern (src/components/index.ts)
import {
  ConfirmationModal,
  Header,
  MainButton,
  Spinner,
  Toast,
} from "./shared/components";
import type { ToastType } from "./shared/components";
import type { ModalVariant } from "./shared/components";
import { User } from "./shared/components/User";

function Prueba() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Estado unificado para el Toast
  const [toastState, setToastState] = useState<{
    id: number;
    show: boolean;
    type: ToastType;
    title: string;
    message: string;
  }>({
    id: 0,
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // Estado unificado para el ConfirmationModal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    variant: ModalVariant;
    title: string;
    description: string;
    confirmText: string;
    showSpinnerOnConfirm?: boolean;
    onConfirmAction: () => Promise<void> | void;
  }>({
    isOpen: false,
    variant: "danger",
    title: "",
    description: "",
    confirmText: "Confirmar",
    showSpinnerOnConfirm: false,
    onConfirmAction: () => {},
  });

  const handlePrimaryAction = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    triggerSuccessToast();
  };

  const handleSpinner = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  };

  // Handlers para activar Toast
  const triggerSuccessToast = () => {
    setToastState({
      id: Date.now(),
      show: true,
      type: "success",
      title: "¡Operación Exitosa!",
      message: "Los cambios han sido guardados correctamente.",
    });
  };

  const triggerErrorToast = () => {
    setToastState({
      id: Date.now(),
      show: true,
      type: "error",
      title: "Ocurrió un Error",
      message: "No se pudo procesar la solicitud. Inténtalo de nuevo.",
    });
  };

  const triggerWarningToast = () => {
    setToastState({
      id: Date.now(),
      show: true,
      type: "warning",
      title: "Atención Requerida",
      message: "Tu suscripción está próxima a vencer en 3 días.",
    });
  };

  const triggerInfoToast = () => {
    setToastState({
      id: Date.now(),
      show: true,
      type: "info",
      title: "Nueva Actualización",
      message: "Hay una nueva versión de la aplicación disponible.",
    });
  };

  const handleCloseToast = () => {
    setToastState((prev) => ({ ...prev, show: false }));
  };

  // Handlers para abrir Modal de Confirmación
  const openDangerModal = () => {
  setModalState({
    isOpen: true,
    variant: "danger",
    title: "¿Eliminar usuario?",
    description:
      "Esta acción no se puede deshacer. Todos los datos asociados a este registro serán eliminados permanentemente.",
    confirmText: "Sí, eliminar",
    showSpinnerOnConfirm: true, // Disparará el spinner al hacer confirm
    onConfirmAction: async () => {
      await new Promise((res) => setTimeout(res, 1500));
      triggerSuccessToast();
    },
  });
};

const openWarningModal = () => {
  setModalState({
    isOpen: true,
    variant: "warning",
    title: "¿Cerrar sesión en todos los dispositivos?",
    description:
      "Tendrás que ingresar tus credenciales nuevamente en tus otros navegadores y teléfonos móviles.",
    confirmText: "Cerrar sesiones",
    showSpinnerOnConfirm: false, // NO activa spinner
    onConfirmAction: async () => {
      await new Promise((res) => setTimeout(res, 1000));
    },
  });
};

const openSuccessModal = () => {
  setModalState({
    isOpen: true,
    variant: "success",
    title: "¿Publicar cambios?",
    description:
      "Tu contenido será visible inmediatamente para todos los usuarios de la plataforma.",
    confirmText: "Publicar ahora",
    showSpinnerOnConfirm: true, // Disparará el spinner al hacer confirm
    onConfirmAction: () => {
      triggerSuccessToast();
    },
  });
};

const openInfoModal = () => {
  setModalState({
    isOpen: true,
    variant: "info",
    title: "¿Actualizar configuración?",
    description: "Se aplicarán los nuevos ajustes del sistema a tu cuenta.",
    confirmText: "Aplicar",
    showSpinnerOnConfirm: false, // NO activa spinner
    onConfirmAction: () => {},
  });
};

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <section id="center">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="hero"></div>

        <User username="John Doe" />
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>

        {/* Galería de botones para probar Spinner y Toast */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "15px",
            flexWrap: "wrap",
          }}
        >
          <button type="button" onClick={handleSpinner}>
            Activar Spinner
          </button>

          <button type="button" onClick={triggerSuccessToast}>
            Toast Success
          </button>

          <button type="button" onClick={triggerErrorToast}>
            Toast Error
          </button>

          <button type="button" onClick={triggerWarningToast}>
            Toast Warning
          </button>

          <button type="button" onClick={triggerInfoToast}>
            Toast Info
          </button>

          <Spinner active={loading} />
        </div>

        {/* Galería de botones para probar los Modales de Confirmación */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "15px",
            flexWrap: "wrap",
          }}
        >
          <button type="button" onClick={openDangerModal}>
            Modal Danger
          </button>

          <button type="button" onClick={openWarningModal}>
            Modal Warning
          </button>

          <button type="button" onClick={openSuccessModal}>
            Modal Success
          </button>

          <button type="button" onClick={openInfoModal}>
            Modal Info
          </button>
        </div>

        {/* Sección de demostración de MainButton */}
        <main className="min-h-screen bg-page-secondary flex flex-col items-center justify-center p-6 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              Demostración de Componentes
            </h1>
            <p className="text-slate-600">
              Integración de MainButton, Toast y ConfirmationModal
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">
              Variantes de MainButton
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Acción Principal (Full Width)
                </label>
                <MainButton
                  fullWidth
                  size="lg"
                  icon={<Send size={18} />}                  
                  onClick={handlePrimaryAction}
                >
                  Guardar y Continuar
                </MainButton>
              </div>

              <div className="flex gap-3 items-center">
                <MainButton size="md" icon={<Save size={16} />}>
                  Guardar
                </MainButton>

                <MainButton size="sm">Secundario Small</MainButton>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Abrir Modal
                </label>
                <MainButton
                  size="md"
                  icon={<CheckCircle size={18} />}
                  onClick={openSuccessModal}
                >
                  Confirmar Operación
                </MainButton>
              </div>
            </div>
          </div>
        </main>

        {/* Notificación Toast (Única instancia) */}
        <Toast
          key={toastState.id}
          show={toastState.show}
          type={toastState.type}
          title={toastState.title}
          message={toastState.message}
          duration={4000}
          onClose={handleCloseToast}
        />

        {/* Componente Modal de Confirmación (Única instancia) */}
        <ConfirmationModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onConfirm={modalState.onConfirmAction}
          variant={modalState.variant}
          title={modalState.title}
          description={modalState.description}
          confirmText={modalState.confirmText}
          showSpinnerOnConfirm={modalState.showSpinnerOnConfirm}
          onTriggerSpinner={handleSpinner}
        />
      </section>

      <div className="ticks"></div>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default Prueba;