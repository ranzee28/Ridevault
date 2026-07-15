import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Phone, Calendar, Globe, MapPin, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { PersonalInfo, Toast } from '../types';

interface PersonalInfoTabProps {
  user: any;
  userProfile: any;
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

const GENDER_OPTIONS = ['Laki-laki', 'Perempuan', 'Pilih untuk tidak menyebutkan'];
const NATIONALITY_OPTIONS = ['Indonesia', 'Malaysia', 'Singapura', 'Australia', 'Amerika Serikat', 'Britania Raya', 'Lainnya'];

interface FieldProps {
  label: string;
  name: keyof PersonalInfo;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  isEditing: boolean;
  form: PersonalInfo;
  setForm: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  errors: Partial<Record<keyof PersonalInfo, string>>;
  children?: React.ReactNode;
}

// Declared outside to prevent component recreation on every render (which caused input focus loss)
const Field = ({
  label, name, type = 'text', placeholder, disabled = false, isEditing, form, setForm, errors, children
}: FieldProps) => (
  <div>
    <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">{label}</label>
    {children ?? (
      <input
        type={type}
        value={form[name] as string}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        disabled={disabled || !isEditing}
        placeholder={placeholder}
        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm transition-all focus:outline-none ${
          errors[name]
            ? 'border-red-500/50 focus:border-red-500'
            : isEditing && !disabled
              ? 'border-white/15 focus:border-blue-500/60 text-white'
              : 'border-white/8 text-white/50 cursor-default'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    )}
    {errors[name] && (
      <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
        <AlertCircle size={11} /> {errors[name]}
      </p>
    )}
  </div>
);

export default function PersonalInfoTab({ user, userProfile, addToast }: PersonalInfoTabProps) {
  const { updateExtendedProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const defaultInfo: PersonalInfo = {
    fullName: userProfile?.name || user?.user_metadata?.name || '',
    username: userProfile?.username || `rider_${(user?.id || '').slice(0, 6)}`,
    email: user?.email || '',
    phone: userProfile?.phone || '',
    dateOfBirth: userProfile?.date_of_birth || '',
    gender: userProfile?.gender || '',
    nationality: userProfile?.nationality || 'Indonesia',
    address: userProfile?.address || '',
    emergencyContact: userProfile?.emergency_contact || '',
    emergencyPhone: userProfile?.emergency_phone || '',
  };

  const [form, setForm] = useState<PersonalInfo>(defaultInfo);
  const [original, setOriginal] = useState<PersonalInfo>(defaultInfo);
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfo, string>>>({});

  useEffect(() => {
    const updated: PersonalInfo = {
      fullName: userProfile?.name || user?.user_metadata?.name || '',
      username: userProfile?.username || `rider_${(user?.id || '').slice(0, 6)}`,
      email: user?.email || '',
      phone: userProfile?.phone || '',
      dateOfBirth: userProfile?.date_of_birth || '',
      gender: userProfile?.gender || '',
      nationality: userProfile?.nationality || 'Indonesia',
      address: userProfile?.address || '',
      emergencyContact: userProfile?.emergency_contact || '',
      emergencyPhone: userProfile?.emergency_phone || '',
    };
    setForm(updated);
    setOriginal(updated);
  }, [userProfile, user]);

  useEffect(() => {
    setHasChanges(JSON.stringify(form) !== JSON.stringify(original));
  }, [form, original]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalInfo, string>> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi';
    if (form.fullName.trim().length > 100) newErrors.fullName = 'Nama terlalu panjang (maksimal 100 karakter)';
    if (form.phone && !/^[+\d\s()-]{7,20}$/.test(form.phone)) newErrors.phone = 'Nomor telepon tidak valid';
    if (form.emergencyPhone && !/^[+\d\s()-]{7,20}$/.test(form.emergencyPhone)) newErrors.emergencyPhone = 'Nomor telepon kontak darurat tidak valid';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await updateExtendedProfile({
        name: form.fullName.trim(),
        phone: form.phone || '',
        dateOfBirth: form.dateOfBirth || '',
        gender: form.gender || '',
        nationality: form.nationality || 'Indonesia',
        address: form.address || '',
        emergencyContact: form.emergencyContact || '',
        emergencyPhone: form.emergencyPhone || '',
      });

      setOriginal({ ...form });
      setIsEditing(false);
      addToast({ type: 'success', message: 'Informasi pribadi berhasil diperbarui.' });
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Gagal menyimpan data. Silakan coba lagi.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ ...original });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <motion.div
      key="personal"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Informasi Pribadi</h2>
          <p className="text-white/40 text-sm mt-0.5">Kelola detail data pribadi dan informasi kontak Anda</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#b8942b] text-black text-sm rounded-xl transition-all font-semibold cursor-pointer"
          >
            <User size={14} /> Ubah Profil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 border border-white/10 text-white/60 hover:text-white text-sm rounded-xl transition-all cursor-pointer"
            >
              <X size={14} /> Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-all font-semibold cursor-pointer"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        )}
      </div>

      {/* Unsaved changes warning */}
      {hasChanges && isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 px-4 py-3 bg-amber-950/40 border border-amber-500/20 rounded-xl text-amber-300 text-sm"
        >
          <AlertCircle size={14} />
          Anda memiliki perubahan yang belum disimpan — ingatlah untuk menyimpan sebelum meninggalkan halaman.
        </motion.div>
      )}

      {/* Basic Info Card */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
        <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
          <User size={12} className="text-blue-400" /> Informasi Dasar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nama Lengkap" name="fullName" placeholder="Masukkan nama lengkap Anda" form={form} setForm={setForm} errors={errors} isEditing={isEditing} />
          <Field label="Nama Pengguna" name="username" placeholder="misal: rider_john" disabled form={form} setForm={setForm} errors={errors} isEditing={isEditing} />
          <Field label="Alamat Email" name="email" type="email" disabled form={form} setForm={setForm} errors={errors} isEditing={isEditing} />
          <Field label="Nomor Telepon" name="phone" type="tel" placeholder="+62 812 3456 7890" form={form} setForm={setForm} errors={errors} isEditing={isEditing} />
        </div>
      </div>

      {/* Identity Card */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
        <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
          <Calendar size={12} className="text-blue-400" /> Identitas & Demografis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Tanggal Lahir" name="dateOfBirth" type="date" form={form} setForm={setForm} errors={errors} isEditing={isEditing} />
          <Field label="Jenis Kelamin" name="gender" form={form} setForm={setForm} errors={errors} isEditing={isEditing}>
            <select
              value={form.gender}
              onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              disabled={!isEditing}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm transition-all focus:outline-none appearance-none ${
                isEditing ? 'border-white/15 focus:border-blue-500/60 text-white' : 'border-white/8 text-white/50'
              }`}
            >
              <option value="" className="bg-[#111827]">Pilih jenis kelamin</option>
              {GENDER_OPTIONS.map(g => <option key={g} value={g} className="bg-[#111827]">{g}</option>)}
            </select>
          </Field>
          <Field label="Kewarganegaraan" name="nationality" form={form} setForm={setForm} errors={errors} isEditing={isEditing}>
            <select
              value={form.nationality}
              onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
              disabled={!isEditing}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm transition-all focus:outline-none appearance-none ${
                isEditing ? 'border-white/15 focus:border-blue-500/60 text-white' : 'border-white/8 text-white/50'
              }`}
            >
              {NATIONALITY_OPTIONS.map(n => <option key={n} value={n} className="bg-[#111827]">{n}</option>)}
            </select>
          </Field>
          <Field label="Alamat Tinggal" name="address" placeholder="Masukkan alamat tinggal Anda..." form={form} setForm={setForm} errors={errors} isEditing={isEditing} />
        </div>
      </div>

      {/* Emergency Contact Card */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
        <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
          <Phone size={12} className="text-blue-400" /> Kontak Darurat
        </h3>
        <p className="text-white/30 text-xs">Informasi ini digunakan dalam kondisi darurat selama Anda berkendara.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nama Kontak" name="emergencyContact" placeholder="misal: John Doe" form={form} setForm={setForm} errors={errors} isEditing={isEditing} />
          <Field label="Nomor Telepon Kontak" name="emergencyPhone" type="tel" placeholder="+62 812 3456 7890" form={form} setForm={setForm} errors={errors} isEditing={isEditing} />
        </div>
      </div>
    </motion.div>
  );
}
