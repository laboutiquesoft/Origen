import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import "./toast.css";

export type ToastType = "success" | "error" | "warning" | "info";

// 1. Añadimos 'export' y hacemos 'show' opcional
export interface ToastProps {
  id: string;
  show?: boolean; // 👈 Opcional con '?'
  type?: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function Toast({
  id, // 👈 2. EXTRAÍMOS 'id' AQUÍ
  show = true, // 👈 Asignamos valor por defecto
  type = "success",
  title,
  message,
  duration = 4000,
  onClose,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isRendered, setIsRendered] = useState(show);

  useEffect(() => {
    if (show) {
      setIsRendered(true);
      setIsExiting(false);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id); // 👈 Ya funciona porque 'id' existe arriba
      setIsRendered(false);
    }, 350);
  };

  if (!isRendered) return null;

  const IconComponent = iconMap[type];

  const toastContent = (
    <div className={`toast-container ${isExiting ? "exit" : "enter"}`}>
      <div className={`toast-card toast-${type}`}>
        <div className="toast-content">
          <div className="toast-icon-wrapper">
            <IconComponent className="toast-icon" size={22} />
          </div>

          <div className="toast-text">
            <h4 className="toast-title">{title}</h4>
            <p className="toast-message">{message}</p>
          </div>

          <button
            type="button"
            className="toast-close-btn"
            onClick={handleClose}
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>

        <div
          className="toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  );

  return createPortal(toastContent, document.body);
}

export { Toast };