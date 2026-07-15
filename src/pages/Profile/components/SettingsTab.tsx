import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Eye, EyeOff, Loader2, Monitor, Smartphone, Trash2, LogOut, AlertTriangle, Check, Wifi } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Toast, ActiveSession } from '../types';
import ConfirmModal from './ui/ConfirmModal';

interface SecurityTabProps {
  user: any;
  userProfile: any;
  logOut: () => Promise<void>;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  navigate: (path: string) => void;
}

const MOCK_SESSIONS: ActiveSession[] = [
  { id: 's1', device: 'Windows PC', browser: 'Chrome 126', ip: '103.xxx.xxx.1', location: 'Jakarta, ID', lastActive: 'Now', isCurrent: true },
  { id: 's2', device: 'iPhone 15 Pro', browser: 'Safari 17', ip: '103.xxx.xxx.2', location: 'Bandung, ID', lastActive: '2 hours ago', isCurrent: false },
  { id: 's3', device: 'MacBook Pro', browser: 'Firefox 127', ip: '103.xxx.xxx.3', location: 'Surabaya, ID', lastActive: 'Yesterday', isCurrent: false },
];

function PasswordStrengthBar({ password }: { password: string }) {
  const getStrength = (p: string) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-xs" style={{ color: colors[strength] }}>{labels[strength]} password</p>
      )}
    </div>
  );
}

export default function SecurityTab({ user, userProfile, logOut, addToast, navigate }: SecurityTabProps) {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>(MOCK_SESSIONS);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutAllModalOpen, setLogoutAllModalOpen] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      addToast({ type: 'error', message: 'Please fill in all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      addToast({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }
    setIsChangingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({ type: 'success', message: 'Password changed successfully. Please sign in again on other devices.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Failed to change password.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    addToast({ type: 'info', message: 'Session terminated successfully.' });
  };

  const handleLogoutAll = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      await logOut();
      navigate('/login');
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Failed to logout all devices.' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete user data from users table
      await supabase.from('users').delete().eq('id', user.id);
      await supabase.auth.signOut();
      navigate('/');
      addToast({ type: 'info', message: 'Account deleted. We\'re sorry to see you go.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Failed to delete account. Contact support.' });
    }
  };

  const PasswordField = ({ label, value, onChange, show, setShow, placeholder }: any) => (
    <div>
      <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder-white/20"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <motion.div
      key="security"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-white font-semibold text-lg">Security</h2>
        <p className="text-white/40 text-sm mt-0.5">Manage your password, sessions, and account security</p>
      </div>

      {/* Change Password */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
        <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
          <Lock size={12} className="text-blue-400" /> Change Password
        </h3>
        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrentPass}
          setShow={setShowCurrentPass}
          placeholder="••••••••"
        />
        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNewPass}
          setShow={setShowNewPass}
          placeholder="Min. 8 characters"
        />
        {newPassword && <PasswordStrengthBar password={newPassword} />}
        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPass}
          setShow={setShowConfirmPass}
          placeholder="Re-enter new password"
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle size={11} /> Passwords do not match
          </p>
        )}
        <div className="flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={isChangingPass || !newPassword || !confirmPassword}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-xl transition-all font-medium"
          >
            {isChangingPass ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isChangingPass ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <Shield size={16} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Two-Factor Authentication</h3>
              <p className="text-white/40 text-xs mt-1 leading-relaxed">
                Add an extra layer of security. When enabled, you'll need your phone to sign in.
              </p>
              {twoFAEnabled && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400">
                  <Check size={10} /> Enabled
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setTwoFAEnabled(!twoFAEnabled);
              addToast({ type: twoFAEnabled ? 'info' : 'success', message: twoFAEnabled ? '2FA disabled.' : '2FA enabled. (Demo mode)' });
            }}
            className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${twoFAEnabled ? 'bg-blue-500' : 'bg-white/10'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${twoFAEnabled ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
            <Wifi size={11} className="text-blue-400" /> Active Sessions
          </h3>
          <button
            onClick={() => setLogoutAllModalOpen(true)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            <LogOut size={11} /> Logout All
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {sessions.map(session => (
            <div key={session.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                {session.device.includes('iPhone') || session.device.includes('Mobile')
                  ? <Smartphone size={15} className="text-white/40" />
                  : <Monitor size={15} className="text-white/40" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-medium">{session.device}</p>
                  {session.isCurrent && (
                    <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/25 rounded text-emerald-400 text-[10px]">Current</span>
                  )}
                </div>
                <p className="text-white/35 text-xs mt-0.5">{session.browser} · {session.location} · {session.lastActive}</p>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleTerminateSession(session.id)}
                  className="p-2 text-white/25 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/20 border border-red-500/15 rounded-2xl p-6 space-y-4">
        <h3 className="text-red-400 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
          <AlertTriangle size={12} /> Danger Zone
        </h3>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Delete Account</p>
            <p className="text-white/30 text-xs mt-1 leading-relaxed">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-950/40 text-sm rounded-xl transition-all"
          >
            <Trash2 size={13} /> Delete Account
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="This will permanently delete your account, rental history, and all associated data. This cannot be undone."
        confirmLabel="Delete My Account"
        variant="danger"
        requireText="DELETE"
      />
      <ConfirmModal
        isOpen={logoutAllModalOpen}
        onClose={() => setLogoutAllModalOpen(false)}
        onConfirm={handleLogoutAll}
        title="Logout from All Devices"
        description="You will be signed out from all active sessions across all your devices."
        confirmLabel="Logout All Devices"
        variant="warning"
      />
    </motion.div>
  );
}
