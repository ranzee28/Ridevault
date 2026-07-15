import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Settings, Globe, DollarSign, Moon, Clock, Ruler, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { UserPreferencesRow } from '../../../lib/supabase-types';
import { UserPreferences, Toast } from '../types';

interface PreferencesTabProps {
  user: any;
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const LANGUAGES = [
  { value: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
];
const CURRENCIES = [
  { value: 'IDR', label: 'Indonesian Rupiah (IDR)', symbol: 'Rp' },
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
];
const TIMEZONES = [
  'Asia/Jakarta',
  'Asia/Makassar',
  'Asia/Jayapura',
  'Asia/Singapore',
  'UTC',
];

const DEFAULT_PREFS: UserPreferences = {
  language: 'id',
  currency: 'IDR',
  darkMode: true,
  timezone: 'Asia/Jakarta',
  units: 'km',
};

export default function PreferencesTab({ user, addToast }: PreferencesTabProps) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Map database row to UserPreferences
  const mapRowToPrefs = (row: UserPreferencesRow): UserPreferences => ({
    language: row.language,
    currency: row.currency,
    darkMode: row.dark_mode,
    timezone: row.timezone,
    units: row.units as 'km' | 'miles',
  });

  // Fetch preferences from Supabase
  const loadPrefs = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create initial preferences record
        const { data: inserted, error: insertErr } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            language: DEFAULT_PREFS.language,
            currency: DEFAULT_PREFS.currency,
            dark_mode: DEFAULT_PREFS.darkMode,
            timezone: DEFAULT_PREFS.timezone,
            units: DEFAULT_PREFS.units,
          })
          .select()
          .single();

        if (insertErr) throw insertErr;
        if (inserted) setPrefs(mapRowToPrefs(inserted));
      } else if (error) {
        throw error;
      } else if (data) {
        setPrefs(mapRowToPrefs(data));
      }
    } catch (err: any) {
      console.error('[Preferences] Fetch error:', err);
      addToast({ type: 'error', message: 'Failed to load preferences.' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, addToast]);

  useEffect(() => {
    loadPrefs();
  }, [loadPrefs]);

  const handleChange = (key: keyof UserPreferences, value: any) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);

    // Auto-save with debounce
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    
    saveTimerRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            language: updated.language,
            currency: updated.currency,
            dark_mode: updated.darkMode,
            timezone: updated.timezone,
            units: updated.units,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error) throw error;
        
        setSaving(false);
        setSaved(true);
        addToast({ type: 'success', message: 'Preferences saved automatically.', duration: 1500 });
        setTimeout(() => setSaved(false), 2000);
      } catch (err: any) {
        console.error('[Preferences] Save error:', err);
        addToast({ type: 'error', message: 'Failed to save preferences.' });
        setSaving(false);
      }
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const ToggleRow = ({ label, icon: Icon, value, onChange, description }: {
    label: string; icon: any; value: boolean; onChange: (v: boolean) => void; description?: string
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
          <Icon size={14} className="text-white/40" />
        </div>
        <div>
          <p className="text-white text-sm">{label}</p>
          {description && <p className="text-white/30 text-xs mt-0.5">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-all ${value ? 'bg-blue-500' : 'bg-white/10'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );

  const SelectRow = ({ label, icon: Icon, value, onChange, options }: {
    label: string; icon: any; value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
          <Icon size={14} className="text-white/40" />
        </div>
        <p className="text-white text-sm">{label}</p>
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none appearance-none max-w-[180px] text-right"
      >
        {options.map(o => <option key={o.value} value={o.value} className="bg-[#111827]">{o.label}</option>)}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse">
        <Loader2 size={24} className="text-white/20 animate-spin" />
        <p className="text-white/40 text-sm mt-2">Loading preferences...</p>
      </div>
    );
  }

  return (
    <motion.div
      key="preferences"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Preferences</h2>
          <p className="text-white/40 text-sm mt-0.5">Customize your RideVault experience</p>
        </div>
        {saving && (
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Loader2 size={12} className="animate-spin" /> Saving...
          </div>
        )}
        {saved && !saving && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span> Saved to cloud
          </div>
        )}
      </div>

      <div className="bg-white/[0.03] border border-white/8 rounded-2xl px-5 divide-y divide-white/5">
        <SelectRow
          label="Language"
          icon={Globe}
          value={prefs.language}
          onChange={v => handleChange('language', v)}
          options={LANGUAGES.map(l => ({ value: l.value, label: `${l.flag} ${l.label}` }))}
        />
        <SelectRow
          label="Currency"
          icon={DollarSign}
          value={prefs.currency}
          onChange={v => handleChange('currency', v)}
          options={CURRENCIES.map(c => ({ value: c.value, label: `${c.symbol} ${c.value}` }))}
        />
        <SelectRow
          label="Timezone"
          icon={Clock}
          value={prefs.timezone}
          onChange={v => handleChange('timezone', v)}
          options={TIMEZONES.map(t => ({ value: t, label: t }))}
        />
        <div className="py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                <Ruler size={14} className="text-white/40" />
              </div>
              <p className="text-white text-sm">Distance Units</p>
            </div>
            <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {['km', 'miles'].map(unit => (
                <button
                  key={unit}
                  onClick={() => handleChange('units', unit as 'km' | 'miles')}
                  className={`px-4 py-1.5 text-xs font-medium transition-all ${prefs.units === unit ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white'}`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ToggleRow
          label="Dark Mode"
          icon={Moon}
          value={prefs.darkMode}
          onChange={v => handleChange('darkMode', v)}
          description="Dark theme is always on for this platform"
        />
      </div>

      <p className="text-white/25 text-xs text-center font-medium">Preferences are automatically synchronized with Supabase and restored on your other devices.</p>
    </motion.div>
  );
}
