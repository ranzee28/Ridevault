import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Upload, CheckCircle, Clock, XCircle,
  Eye, Trash2, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { DocumentRow } from '../../../lib/supabase-types';
import { DocumentRecord, VerificationStatus, Toast } from '../types';

interface DriverLicenseTabProps {
  user: any;
  addToast: (toast: Omit<Toast, 'id'>) => void;
}

type DocType = 'driver_license' | 'national_id' | 'selfie_id';

const DOC_CONFIG: Record<DocType, { label: string; description: string; icon: string }> = {
  driver_license: {
    label: 'Driver License',
    description: 'Upload a clear photo of your SIM (Surat Izin Mengemudi) — front side.',
    icon: '🪪',
  },
  national_id: {
    label: 'National ID / Passport',
    description: 'Upload your KTP, NIK, or valid passport. Must be clearly readable.',
    icon: '📄',
  },
  selfie_id: {
    label: 'Selfie with ID',
    description: 'Take a selfie while holding your ID/Passport next to your face.',
    icon: '🤳',
  },
};

const STATUS_UI: Record<VerificationStatus, { label: string; color: string; Icon: any }> = {
  none:     { label: 'Not Uploaded',  color: 'text-white/30',    Icon: FileText },
  pending:  { label: 'Under Review',  color: 'text-amber-400',   Icon: Clock },
  approved: { label: 'Verified',      color: 'text-emerald-400', Icon: CheckCircle },
  rejected: { label: 'Rejected',      color: 'text-red-400',     Icon: XCircle },
};

// ─── Individual Document Upload Card ─────────────────────────────────────────
interface DocUploadCardProps {
  key?: string;
  docType: DocType;
  userId: string;
  existingRecord: DocumentRow | null;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  onUploaded: (record: DocumentRow) => void;
  onDeleted: (docType: DocType) => void;
}

function DocUploadCard({
  docType, userId, existingRecord, addToast, onUploaded, onDeleted,
}: DocUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cfg = DOC_CONFIG[docType];
  const status = (existingRecord?.status ?? 'none') as VerificationStatus;
  const statusUI = STATUS_UI[status];

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', message: 'Please upload an image file.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast({ type: 'error', message: 'File size must be under 10MB.' });
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Supabase Storage (private bucket)
      const ext = file.name.split('.').pop();
      const path = `${userId}/${docType}_${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('user-documents')
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      // Get a signed URL (private bucket — 1 year expiry)
      const { data: signedData, error: signedErr } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signedErr) throw signedErr;

      const url = signedData.signedUrl;

      // Upsert document record in DB (unique on user_id + type)
      const { data: record, error: dbErr } = await supabase
        .from('documents')
        .upsert(
          {
            user_id: userId,
            type: docType,
            url,
            status: 'pending',
            uploaded_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,type' }
        )
        .select()
        .single();

      if (dbErr) throw dbErr;
      if (record) onUploaded(record as DocumentRow);

      addToast({ type: 'success', message: `${cfg.label} uploaded. Under review by our team.` });
    } catch (err: any) {
      console.error('[DriverLicense] Upload error:', err);
      addToast({ type: 'error', message: err?.message || 'Upload failed. Please try again.' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as any;
      handleFile(fakeEvent);
    }
  };

  const handleRemove = async () => {
    if (!existingRecord) return;
    setIsDeleting(true);
    try {
      // Delete from DB
      const { error: dbErr } = await supabase
        .from('documents')
        .delete()
        .eq('user_id', userId)
        .eq('type', docType);
      if (dbErr) throw dbErr;

      onDeleted(docType);
      addToast({ type: 'info', message: `${cfg.label} removed.` });
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Failed to remove document.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cfg.icon}</span>
            <div>
              <h4 className="text-white font-medium text-sm">{cfg.label}</h4>
              <div className={`flex items-center gap-1.5 mt-0.5 text-xs ${statusUI.color}`}>
                <statusUI.Icon size={11} />
                {statusUI.label}
              </div>
            </div>
          </div>
          {existingRecord && (
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewOpen(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all"
                title="Preview document"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={handleRemove}
                disabled={isDeleting}
                className="p-2 bg-red-950/40 hover:bg-red-900/40 rounded-lg text-red-400/70 hover:text-red-400 transition-all disabled:opacity-40"
                title="Remove document"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          )}
        </div>

        <p className="text-white/30 text-xs leading-relaxed">{cfg.description}</p>

        {/* Upload Zone or Preview Thumbnail */}
        {!existingRecord ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-all group ${
              isUploading
                ? 'border-blue-500/40 bg-blue-500/5 cursor-not-allowed'
                : 'border-white/10 hover:border-blue-500/30 cursor-pointer hover:bg-blue-500/5'
            }`}
          >
            <div className="w-10 h-10 bg-white/5 group-hover:bg-blue-500/10 rounded-xl flex items-center justify-center transition-all">
              {isUploading
                ? <Loader2 size={18} className="text-blue-400 animate-spin" />
                : <Upload size={18} className="text-white/30 group-hover:text-blue-400 transition-colors" />
              }
            </div>
            <div className="text-center">
              <p className="text-white/50 text-sm group-hover:text-white/70 transition-colors">
                {isUploading ? 'Uploading to cloud...' : 'Click or drag to upload'}
              </p>
              <p className="text-white/25 text-xs mt-1">JPG, PNG, WebP — max 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              disabled={isUploading}
            />
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-black/30 border border-white/8">
            <img
              src={existingRecord.url}
              alt={cfg.label}
              className="w-full h-36 object-cover"
              onError={(e) => { (e.target as any).style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white/60 text-xs">
                Uploaded {new Date(existingRecord.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Status Callouts */}
        {status === 'rejected' && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-red-950/30 border border-red-500/20 rounded-xl">
            <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-xs">Document was rejected. Please upload a clearer photo.</p>
          </div>
        )}
        {status === 'pending' && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-950/30 border border-amber-500/20 rounded-xl">
            <Clock size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300 text-xs">
              Our team is reviewing your document. This usually takes 1–2 business days.
            </p>
          </div>
        )}
        {status === 'approved' && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
            <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-emerald-300 text-xs">
              Document verified! You are authorized to rent premium superbikes.
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOpen && existingRecord && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
              onClick={() => setPreviewOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 z-[101] flex items-center justify-center pointer-events-none"
            >
              <img
                src={existingRecord.url}
                alt={cfg.label}
                className="pointer-events-auto max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main DriverLicenseTab ────────────────────────────────────────────────────
export default function DriverLicenseTab({ user, addToast }: DriverLicenseTabProps) {
  const [documents, setDocuments] = useState<Record<DocType, DocumentRow | null>>({
    driver_license: null,
    national_id: null,
    selfie_id: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch documents from Supabase on mount ──────────────────────────────
  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const docMap: Record<DocType, DocumentRow | null> = {
        driver_license: null,
        national_id: null,
        selfie_id: null,
      };
      (data || []).forEach((doc: DocumentRow) => {
        docMap[doc.type as DocType] = doc;
      });
      setDocuments(docMap);
    } catch (err: any) {
      console.error('[DriverLicense] Error loading documents:', err);
      addToast({ type: 'error', message: 'Failed to load your documents.' });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, addToast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUploaded = (record: DocumentRow) => {
    setDocuments((prev) => ({ ...prev, [record.type]: record }));
  };

  const handleDeleted = (docType: DocType) => {
    setDocuments((prev) => ({ ...prev, [docType]: null }));
  };

  const allApproved = (Object.values(documents) as (DocumentRow | null)[]).every((d) => d?.status === 'approved');
  const anyUploaded = (Object.values(documents) as (DocumentRow | null)[]).some((d) => d !== null);

  return (
    <motion.div
      key="license"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-semibold text-lg">Driver License & Verification</h2>
          <p className="text-white/40 text-sm mt-0.5">
            Upload required documents to get verified for premium superbike rentals.
          </p>
        </div>
        <button
          onClick={loadDocuments}
          disabled={isLoading}
          className="p-2 text-white/30 hover:text-white transition-colors disabled:opacity-40 shrink-0"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Status Banner */}
      {allApproved ? (
        <div className="flex items-start gap-3 p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
          <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-emerald-300 text-sm font-medium">Fully Verified ✓</p>
            <p className="text-emerald-300/60 text-xs mt-1">
              All documents approved. You can rent any premium superbike.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 bg-blue-950/30 border border-blue-500/20 rounded-xl">
          <AlertCircle size={14} className="text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 text-sm font-medium">Verification Required</p>
            <p className="text-blue-300/60 text-xs mt-1 leading-relaxed">
              To rent high-performance superbikes, we require identity verification.
              All documents are encrypted and stored securely in the cloud.
            </p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/[0.03] border border-white/8 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {(['driver_license', 'national_id', 'selfie_id'] as DocType[]).map((type) => (
            <DocUploadCard
              key={type}
              docType={type}
              userId={user.id}
              existingRecord={documents[type]}
              addToast={addToast}
              onUploaded={handleUploaded}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {anyUploaded && (
        <p className="text-white/20 text-xs text-center">
          Documents are stored securely in Supabase Storage and linked to your account.
          They will be available on all your devices.
        </p>
      )}
    </motion.div>
  );
}
