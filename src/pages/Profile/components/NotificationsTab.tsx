import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Bell, Loader2, CloudOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { NotificationPrefsRow } from '../../../lib/supabase-types';
import { NotificationPrefs, Toast } from '../types';

interface NotificationsTabProps {
  user: any;
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const PREF_CONFIG: Array<{
  key: keyof NotificationPrefs;
  dbKey: keyof NotificationPrefsRow;
  label: string;
  description: string;
  category: string;
}> = [
  { key: 'bookingUpdates',     dbKey: 'booking_updates',     label: 'Booking Updates',       description: 'Confirmation, reminders, and status changes for your rentals', category: 'Rentals' },
  { key: 'paymentReminders',   dbKey: 'payment_reminders',   label: 'Payment Reminders',     description: 'Alerts for upcoming payments and invoices', category: 'Rentals' },
  { key: 'membershipUpdates',  dbKey: 'membership_updates',  label: 'Membership Updates',    description: 'Tier upgrades, point changes, and benefit notifications', category: 'Membership' },
  { key: 'promotions',         dbKey: 'promotions',          label: 'Promotions & Offers',   description: 'Exclusive deals, discount codes, and seasonal offers', category: 'Membership' },
  { key: 'emailNotifications', dbKey: 'email_notifications', label: 'Email Notifications',   description: 'Receive all notifications via your registered email', category: 'Channels' },
  { key: 'pushNotifications',  dbKey: 'push_notifications',  label: 'Push Notifications',    description: 'Browser push alerts for real-time updates', category: 'Channels' },
  { key: 'smsNotifications',   dbKey: 'sms_notifications',   label: 'SMS Notifications',     description: 'Critical alerts via text message to your phone', category: 'Channels' },
];

const DEFAULT_PREFS: NotificationPrefs = {
  bookingUpdates: true,
  promotions: false,
  membershipUpdates: true,
  paymentReminders: true,
  pushNotifications: false,
  emailNotifications: true,
  smsNotifications: false,
};

function mapRowToPrefs(row: NotificationPrefsRow): NotificationPrefs {
  return {
    bookingUpdates:     row.booking_updates,
    promotions:         row.promotions,
    membershipUpdates:  row.membership_updates,
    paymentReminders:   row.payment_reminders,
    pushNotifications:  row.push_notifications,
    emailNotifications: row.email_notifications,
    smsNotifications:   row.sms_notifications,
  };
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-blue-500' : 'bg-white/10'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

export default function NotificationsTab({ user, addToast }: NotificationsTabProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<keyof NotificationPrefs | null>(null);
  const [hasError, setHasError] = useState(false);

  // ── Fetch prefs from Supabase ────────────────────────────────────────────
  const loadPrefs = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setHasError(false);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No row yet — insert defaults
        const { data: inserted, error: insertErr } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id, ...DEFAULT_PREFS_DB() })
          .select()
          .single();

        if (insertErr) throw insertErr;
        if (inserted) setPrefs(mapRowToPrefs(inserted as NotificationPrefsRow));
      } else if (error) {
        throw error;
      } else if (data) {
        setPrefs(mapRowToPrefs(data as NotificationPrefsRow));
      }
    } catch (err: any) {
      console.error('[Notifications] Load error:', err);
      setHasError(true);
      addToast({ type: 'error', message: 'Could not load notification preferences.' });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, addToast]);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  // ── Toggle a preference and save to Supabase ──────────────────────────────
  const handleToggle = async (key: keyof NotificationPrefs, value: boolean) => {
    const cfg = PREF_CONFIG.find((p) => p.key === key);
    if (!cfg) return;

    // Optimistic update
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSavingKey(key);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(
          { user_id: user.id, [cfg.dbKey]: value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );

      if (error) throw error;
      addToast({ type: 'success', message: 'Preference saved to your account.', duration: 1500 });
    } catch (err: any) {
      // Revert optimistic update on failure
      setPrefs((prev) => ({ ...prev, [key]: !value }));
      addToast({ type: 'error', message: err?.message || 'Failed to save preference.' });
    } finally {
      setSavingKey(null);
    }
  };

  const categories = [...new Set(PREF_CONFIG.map((p) => p.category))];

  if (isLoading) {
    return (
      <motion.div key="notif-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/[0.03] border border-white/8 rounded-2xl animate-pulse" />
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Notification Preferences</h2>
          <p className="text-white/40 text-sm mt-0.5">Choose how and when you want to be notified</p>
        </div>
        {hasError && (
          <div className="flex items-center gap-1.5 text-red-400 text-xs">
            <CloudOff size={12} /> Cloud sync failed
          </div>
        )}
      </div>

      {categories.map((category) => (
        <div key={category} className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h3 className="text-white/50 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
              <Bell size={11} className="text-blue-400" /> {category}
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {PREF_CONFIG.filter((p) => p.category === category).map((pref) => (
              <div
                key={pref.key}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 pr-4">
                  <p className="text-white text-sm font-medium">{pref.label}</p>
                  <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{pref.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {savingKey === pref.key && (
                    <Loader2 size={12} className="text-blue-400 animate-spin" />
                  )}
                  <Toggle
                    checked={prefs[pref.key]}
                    onChange={(v) => handleToggle(pref.key, v)}
                    disabled={savingKey !== null}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/8 rounded-2xl text-white/40 text-xs">
        <Bell size={13} className="shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Preferences are saved to your Supabase account and synced across all your devices.
          Critical safety and booking notifications may still be sent regardless of these settings.
        </p>
      </div>
    </motion.div>
  );
}

// ─── Helper: default DB insert values ────────────────────────────────────────
function DEFAULT_PREFS_DB() {
  return {
    booking_updates: true,
    promotions: false,
    membership_updates: true,
    payment_reminders: true,
    push_notifications: false,
    email_notifications: true,
    sms_notifications: false,
  };
}
