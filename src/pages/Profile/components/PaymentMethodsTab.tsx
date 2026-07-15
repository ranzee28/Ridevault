import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Wallet, CreditCard, Trash2, Star, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { PaymentMethodRow } from '../../../lib/supabase-types';
import { PaymentMethod, Toast } from '../types';
import ConfirmModal from './ui/ConfirmModal';

interface PaymentMethodsTabProps {
  user: any;
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const PAYMENT_ICONS: Record<string, string> = {
  credit_card: '💳',
  debit_card: '🏦',
  ewallet: '📱',
  bank_account: '🏛️',
};

const TYPE_LABELS: Record<string, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  ewallet: 'E-Wallet',
  bank_account: 'Bank Account',
};

export default function PaymentMethodsTab({ user, addToast }: PaymentMethodsTabProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ label: '', maskedNumber: '', type: 'credit_card' as PaymentMethod['type'], expiry: '' });

  // Map database row to PaymentMethod structure
  const mapRowToMethod = (row: PaymentMethodRow): PaymentMethod => ({
    id: row.id,
    type: row.type,
    label: row.label,
    maskedNumber: row.masked_number,
    expiry: row.expiry || undefined,
    isDefault: row.is_default,
  });

  // Fetch payment methods from Supabase
  const loadMethods = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMethods((data || []).map(mapRowToMethod));
    } catch (err: any) {
      console.error('[PaymentMethods] Fetch error:', err);
      addToast({ type: 'error', message: 'Failed to load payment methods.' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, addToast]);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  const handleSetDefault = async (id: string) => {
    try {
      // First, set all user's payment methods to non-default
      const { error: resetError } = await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      if (resetError) throw resetError;

      // Set the selected method to default
      const { error: setError } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (setError) throw setError;

      setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
      addToast({ type: 'success', message: 'Default payment method updated.' });
    } catch (err: any) {
      console.error('[PaymentMethods] Set default error:', err);
      addToast({ type: 'error', message: 'Failed to update default payment method.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMethods(prev => prev.filter(m => m.id !== id));
      addToast({ type: 'info', message: 'Payment method removed.' });
      setDeleteId(null);
    } catch (err: any) {
      console.error('[PaymentMethods] Delete error:', err);
      addToast({ type: 'error', message: 'Failed to remove payment method.' });
    }
  };

  const handleAdd = async () => {
    if (!newCard.label || !newCard.maskedNumber) {
      addToast({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    setIsSaving(true);
    try {
      const isDefault = methods.length === 0;

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: newCard.type,
          label: newCard.label,
          masked_number: newCard.maskedNumber,
          expiry: newCard.expiry || null,
          is_default: isDefault,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMethods(prev => [...prev, mapRowToMethod(data)]);
        setNewCard({ label: '', maskedNumber: '', type: 'credit_card', expiry: '' });
        setShowAddForm(false);
        addToast({ type: 'success', message: 'Payment method added successfully.' });
      }
    } catch (err: any) {
      console.error('[PaymentMethods] Add error:', err);
      addToast({ type: 'error', message: 'Failed to add payment method.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Payment Methods</h2>
          <p className="text-white/40 text-sm mt-0.5">Manage your saved payment methods</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-all font-medium"
        >
          {showAddForm ? <X size={14} /> : <Plus size={14} />}
          {showAddForm ? 'Cancel' : 'Add Method'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/[0.04] border border-blue-500/20 rounded-2xl p-5 space-y-4"
        >
          <h3 className="text-blue-300 text-sm font-medium">Add Payment Method</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Type</label>
              <select
                value={newCard.type}
                onChange={e => setNewCard(n => ({ ...n, type: e.target.value as PaymentMethod['type'] }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none appearance-none"
              >
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-[#111827]">{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Label</label>
              <input
                value={newCard.label}
                onChange={e => setNewCard(n => ({ ...n, label: e.target.value }))}
                placeholder="e.g. My Visa Card"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/20 focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Card / Account Number (masked)</label>
              <input
                value={newCard.maskedNumber}
                onChange={e => setNewCard(n => ({ ...n, maskedNumber: e.target.value }))}
                placeholder="**** **** **** 0000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none placeholder-white/20 focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs uppercase tracking-widest mb-2">Expiry Date (optional)</label>
              <input
                value={newCard.expiry}
                onChange={e => setNewCard(n => ({ ...n, expiry: e.target.value }))}
                placeholder="MM/YY"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none placeholder-white/20 focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-white/50 text-sm hover:text-white transition-colors" disabled={isSaving}>Cancel</button>
            <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-all" disabled={isSaving}>
              {isSaving && <Loader2 size={12} className="animate-spin" />}
              {isSaving ? 'Adding...' : 'Add Method'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Methods List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse">
          <Loader2 size={24} className="text-white/20 animate-spin" />
          <p className="text-white/40 text-sm mt-2">Loading payment methods...</p>
        </div>
      ) : methods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <Wallet size={24} className="text-white/20" />
          </div>
          <p className="text-white/40 text-sm">No payment methods added</p>
          <button onClick={() => setShowAddForm(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl">Add Method</button>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((method, i) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                method.isDefault
                  ? 'bg-blue-950/30 border-blue-500/25'
                  : 'bg-white/[0.03] border-white/8'
              }`}
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {PAYMENT_ICONS[method.type]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm">{method.label}</p>
                  {method.isDefault && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/15 border border-blue-500/25 rounded-full text-blue-300 text-[10px] font-medium">
                      <Star size={8} /> Default
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-xs mt-0.5 font-mono">{method.maskedNumber}</p>
                {method.expiry && <p className="text-white/25 text-xs mt-0.5">Expires {method.expiry}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                {!method.isDefault && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="px-3 py-1.5 border border-white/10 hover:border-blue-500/30 text-white/40 hover:text-blue-300 text-xs rounded-lg transition-all"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => setDeleteId(method.id)}
                  className="p-2 text-white/25 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-white/30 text-xs">
        <CreditCard size={13} className="shrink-0 mt-0.5" />
        <p className="leading-relaxed">Payment information is stored securely in Supabase. Your card details are masked for your security.</p>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Remove Payment Method"
        description="This payment method will be removed from your account."
        confirmLabel="Remove"
        variant="danger"
      />
    </motion.div>
  );
}
