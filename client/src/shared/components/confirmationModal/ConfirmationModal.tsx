import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import "../../../core/styles/index.css";

export type ModalVariant = "danger" | "warning" | "success" | "info";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  disabled?: boolean;
  showSpinnerOnConfirm?: boolean;
  onTriggerSpinner?: () => void;
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: "text-modal-danger-text",
    iconBg: "bg-white shadow-sm border border-rose-100",
    buttonBg: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20",
    headerGradient: "modal-header-danger",
    closeBtnHover: "hover:bg-rose-100/60 text-rose-700/70 hover:text-rose-900",
    cancelButton: "text-slate-700 hover:bg-slate-500 hover:text-white"
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-modal-warning-text",
    iconBg: "bg-white shadow-sm border border-amber-100",
    buttonBg: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/20",
    headerGradient: "modal-header-warning",
    closeBtnHover: "hover:bg-amber-100/60 text-amber-700/70 hover:text-amber-900",
    cancelButton: "text-slate-700 hover:bg-slate-500 hover:text-white"
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-modal-success-text",
    iconBg: "bg-white shadow-sm border border-emerald-100",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20",
    headerGradient: "modal-header-success",
    closeBtnHover: "hover:bg-emerald-100/60 text-emerald-700/70 hover:text-emerald-900",
    cancelButton: "text-slate-700 hover:bg-slate-500 hover:text-white"
  },
  info: {
    icon: Info,
    iconColor: "text-modal-info-text",
    iconBg: "bg-white shadow-sm border border-cyan-100",
    buttonBg: "bg-support hover:opacity-70 focus:ring-cyan-500/20",
    headerGradient: "modal-header-info",
    closeBtnHover: "hover:bg-cyan-100/60 text-cyan-800/70 hover:text-cyan-950",
    cancelButton: "text-slate-700 hover:bg-slate-500 hover:text-white"
  },
};

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  disabled = false,
  showSpinnerOnConfirm = false,
  onTriggerSpinner,
}: ConfirmationModalProps) {
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setIsRendered(true);
    } else {
      timer = setTimeout(() => setIsRendered(false), 200);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !disabled) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, disabled, onClose]);

  if (!isRendered) return null;

  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      if (showSpinnerOnConfirm && onTriggerSpinner) {
        onTriggerSpinner();
      }
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error al procesar la confirmación:", error);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className={`fixed inset-0 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "var(--modal-backdrop)" }}
        onClick={!disabled ? onClose : undefined}
      />

      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-200 transform ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <div
          className={`relative px-6 py-5 sm:px-8 ${config.headerGradient} flex items-center justify-between`}
        >
          <div className="flex items-center gap-3 pr-8">
            <div
              className={`w-11 h-11 shrink-0 rounded-2xl ${config.iconBg} flex items-center justify-center ${config.iconColor}`}
            >
              <Icon size={22} />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.closeBtnHover}`}
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 sm:p-8 pt-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            {description}
          </p>

          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={disabled}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer  ${config.cancelButton}`}
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={disabled}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md shadow-slate-200 focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${config.buttonBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export { ConfirmationModal };