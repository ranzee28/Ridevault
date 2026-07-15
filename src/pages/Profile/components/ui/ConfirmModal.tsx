import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  requireText?: string; // If set, user must type this text to confirm
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  requireText,
}: ConfirmModalProps) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canConfirm = requireText ? inputText === requireText : true;

  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white',
    default: 'bg-blue-600 hover:bg-blue-500 text-white',
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      setInputText('');
      onClose();
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setInputText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variant === 'danger' ? 'bg-red-950/60 border border-red-500/30' : variant === 'warning' ? 'bg-amber-950/60 border border-amber-500/30' : 'bg-blue-950/60 border border-blue-500/30'}`}>
                    <AlertTriangle size={18} className={variant === 'danger' ? 'text-red-400' : variant === 'warning' ? 'text-amber-400' : 'text-blue-400'} />
                  </div>
                  <h3 className="text-white font-semibold text-base">{title}</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/30 hover:text-white/70 transition-colors -mt-1 -mr-1 p-1"
                  disabled={isLoading}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 pb-6">
                <p className="text-white/60 text-sm leading-relaxed mb-4">{description}</p>

                {requireText && (
                  <div className="mb-4">
                    <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">
                      Type <span className="text-red-400 font-mono">{requireText}</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      placeholder={requireText}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors placeholder-white/20 font-mono"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-white/50 hover:text-white text-sm transition-colors disabled:opacity-50"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!canConfirm || isLoading}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${btnColors[variant]}`}
                  >
                    {isLoading && <Loader2 size={14} className="animate-spin" />}
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
