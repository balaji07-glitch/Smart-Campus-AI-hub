import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 4000
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// ─── Icon map ────────────────────────────────────────────────────────────────

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const styleMap: Record<ToastType, { bar: string; icon: string; bg: string; border: string }> = {
  success: {
    bar: 'bg-emerald-500',
    icon: 'text-emerald-500',
    bg: 'bg-white',
    border: 'border-emerald-100',
  },
  error: {
    bar: 'bg-red-500',
    icon: 'text-red-500',
    bg: 'bg-white',
    border: 'border-red-100',
  },
  warning: {
    bar: 'bg-amber-400',
    icon: 'text-amber-500',
    bg: 'bg-white',
    border: 'border-amber-100',
  },
  info: {
    bar: 'bg-blue-500',
    icon: 'text-blue-500',
    bg: 'bg-white',
    border: 'border-blue-100',
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  const [visible, setVisible] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);
  const s = styleMap[toast.type];
  const duration = toast.duration ?? 4000;

  React.useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const leaveTimer = setTimeout(() => handleClose(), duration);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, []);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onClose(toast.id), 350);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease',
      }}
      className={`
        relative flex items-start gap-3 w-80 max-w-[90vw]
        ${s.bg} ${s.border} border rounded-xl shadow-lg shadow-slate-200/60
        px-4 py-3 overflow-hidden
      `}
    >
      {/* Colored left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${s.bar}`} />

      {/* Icon */}
      <div className={`shrink-0 mt-0.5 ${s.icon}`}>{iconMap[toast.type]}</div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${s.bar} opacity-40`}
        style={{
          width: '100%',
          animation: `toast-progress ${duration}ms linear forwards`,
        }}
      />
    </div>
  );
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `toast_${++counter.current}_${Date.now()}`;
    setToasts(prev => [...prev, { ...t, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => showToast({ type: 'success', title, message }), [showToast]);
  const error   = useCallback((title: string, message?: string) => showToast({ type: 'error',   title, message }), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast({ type: 'warning', title, message }), [showToast]);
  const info    = useCallback((title: string, message?: string) => showToast({ type: 'info',    title, message }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Toast portal – fixed bottom-right */}
      <div
        aria-label="Notifications"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end"
        style={{ pointerEvents: toasts.length ? 'auto' : 'none' }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>

      {/* Keyframe for progress bar shrink */}
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
