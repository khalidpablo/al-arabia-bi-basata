import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-3xl border border-logoGold/30 bg-logoDark shadow-2xl shadow-black/50`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-logoDark/95 px-6 py-4 backdrop-blur">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDone: () => void;
}

export function Toast({ message, type, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  const config = {
    success: { Icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/40' },
    error: { Icon: AlertCircle, color: 'text-rose-400', border: 'border-rose-500/40' },
    info: { Icon: AlertCircle, color: 'text-sky-400', border: 'border-sky-500/40' },
  }[type];

  return createPortal(
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-[slideUp_0.3s_ease]">
      <div
        className={`flex items-center gap-3 rounded-2xl border ${config.border} bg-logoNavy px-5 py-3 shadow-xl`}
      >
        <config.Icon className={config.color} size={22} />
        <span className="text-sm font-semibold text-white">{message}</span>
      </div>
    </div>,
    document.body,
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="animate-spin text-logoGold" size={32} />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-2xl bg-white/5 p-5 text-gray-500">{icon}</div>
      <p className="font-semibold text-gray-300">{title}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-logoDark p-6 shadow-2xl">
        <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-gray-300">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-logoGold hover:bg-logoGoldHover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
