import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../../types';

interface ToastProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: 'bg-emerald-950/90', border: 'border-emerald-500/30', text: 'text-emerald-300', icon: 'text-emerald-400' },
  error: { bg: 'bg-red-950/90', border: 'border-red-500/30', text: 'text-red-300', icon: 'text-red-400' },
  warning: { bg: 'bg-amber-950/90', border: 'border-amber-500/30', text: 'text-amber-300', icon: 'text-amber-400' },
  info: { bg: 'bg-blue-950/90', border: 'border-blue-500/30', text: 'text-blue-300', icon: 'text-blue-400' },
};

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colors = COLORS[toast.type];
  const Icon = ICONS[toast.type];

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm ${colors.bg} ${colors.border}`}
    >
      <Icon size={16} className={`shrink-0 mt-0.5 ${colors.icon}`} />
      <p className={`text-sm flex-1 leading-relaxed ${colors.text}`}>{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/30 hover:text-white/70 transition-colors shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export default function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed top-6 right-6 z-[200] space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
