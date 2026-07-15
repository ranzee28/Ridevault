import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Crown, Download, Maximize2, X, Share2 } from 'lucide-react';
import { TIER_CONFIG } from '../constants';

interface MembershipCardProps {
  name: string;
  uid: string;
  tier: string;
  createdAt: any;
  points?: number;
}

// Simple QR-like visual (placeholder for real QR library)
function QRCodeDisplay({ value, size = 64 }: { value: string; size?: number }) {
  const modules = 12;
  const seed = value.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pseudoRandom = (i: number) => ((seed * (i + 1) * 2654435761) & 0xFFFFFF) > 0x888888;

  return (
    <div
      className="inline-grid bg-white p-1 rounded"
      style={{ gridTemplateColumns: `repeat(${modules}, 1fr)`, width: size, height: size, gap: '0px' }}
    >
      {Array(modules * modules).fill(0).map((_, i) => {
        const row = Math.floor(i / modules);
        const col = i % modules;
        const isFinderPattern =
          (row < 3 && col < 3) ||
          (row < 3 && col >= modules - 3) ||
          (row >= modules - 3 && col < 3);
        const filled = isFinderPattern || pseudoRandom(i);
        return (
          <div
            key={i}
            style={{
              width: `${size / modules - 0.2}px`,
              height: `${size / modules - 0.2}px`,
              background: filled ? '#000' : '#fff',
            }}
          />
        );
      })}
    </div>
  );
}

// Barcode visual
function BarcodeDisplay({ value }: { value: string }) {
  const bars = value.split('').map((c, i) => ({
    width: (c.charCodeAt(0) % 3) + 1,
    dark: (c.charCodeAt(0) + i) % 3 !== 0,
  }));
  return (
    <div className="flex items-end gap-[1px] h-8">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={bar.dark ? 'bg-white/90' : 'bg-transparent'}
          style={{ width: bar.width, height: bar.dark ? '100%' : '60%' }}
        />
      ))}
    </div>
  );
}

export default function MembershipCard({ name, uid, tier, createdAt, points = 0 }: MembershipCardProps) {
  const cfg = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.default;
  const memberId = `RV-${(uid || '').slice(0, 4).toUpperCase()}-${(uid || '').slice(-4).toUpperCase()}`;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const joinYear = createdAt instanceof Date
    ? createdAt.getFullYear()
    : createdAt?.seconds
      ? new Date(createdAt.seconds * 1000).getFullYear()
      : new Date().getFullYear();

  const expiryDate = new Date(joinYear + 2, 11, 31);
  const expiryStr = `${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${String(expiryDate.getFullYear()).slice(-2)}`;

  const CardContent = ({ scale = 1 }: { scale?: number }) => (
    <div
      className="relative w-full rounded-2xl overflow-hidden select-none"
      style={{
        aspectRatio: '1.586/1',
        background: `linear-gradient(135deg, ${cfg.cardGradient.join(', ')})`,
        boxShadow: `0 25px 60px ${cfg.glowColor}, 0 0 0 1px ${cfg.borderColor}, inset 0 1px 0 rgba(255,255,255,0.12)`,
      }}
    >
      {/* Holographic shimmer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
          animation: 'shimmer 4s ease-in-out infinite',
        }}
      />
      {/* Noise grain */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />
      {/* Geometric circles */}
      <div className="absolute top-0 right-0 w-56 h-56 opacity-10">
        <svg viewBox="0 0 200 200" fill="none">
          <circle cx="160" cy="40" r="90" stroke="white" strokeWidth="0.5" />
          <circle cx="160" cy="40" r="65" stroke="white" strokeWidth="0.5" />
          <circle cx="160" cy="40" r="40" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Card Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        {/* Top */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-tr from-[#94a3b8] to-[#f8fafc] rounded-sm transform rotate-45 shrink-0"></div>
            <span className="text-white font-bold text-sm tracking-tighter uppercase drop-shadow ml-1">RideVault</span>
          </div>
          <div className="text-right">
            <div className="text-white/50 text-[8px] uppercase tracking-widest">Keanggotaan</div>
            <div className="text-white font-bold text-xs tracking-widest" style={{ color: cfg.color }}>{cfg.shortLabel}</div>
          </div>
        </div>

        {/* Mid: Chip + QR row */}
        <div className="flex items-end justify-between gap-4">
          {/* EMV Chip */}
          <div>
            <div
              className="w-10 h-8 rounded-md border border-white/25"
              style={{ background: `linear-gradient(135deg, ${cfg.chipColor}, rgba(255,255,255,0.1))`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}
            >
              <div className="w-full h-full rounded-md grid grid-cols-3 grid-rows-3 gap-px p-1 opacity-60">
                {Array(9).fill(0).map((_, i) => <div key={i} className="bg-white/30 rounded-[1px]" />)}
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className="flex-1">
            <BarcodeDisplay value={memberId} />
            <p className="text-white/30 font-mono text-[7px] tracking-widest mt-0.5 text-center">{memberId}</p>
          </div>

          {/* QR */}
          <div className="opacity-80">
            <QRCodeDisplay value={uid} size={52} />
          </div>
        </div>

        {/* Bottom */}
        <div>
          <div className="text-white/45 text-[7px] uppercase tracking-widest mb-1">Anggota</div>
          <div className="text-white font-bold text-sm tracking-wide uppercase drop-shadow truncate">
            {(name || 'ANGGOTA RIDEVAULT').toUpperCase()}
          </div>
          <div className="flex justify-between items-end mt-1.5">
            <div className="flex gap-4">
              <div>
                <div className="text-white/35 text-[7px] uppercase tracking-widest">Poin</div>
                <div className="text-white/85 text-[10px] font-mono">{points.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-white/35 text-[7px] uppercase tracking-widest">Anggota Sejak</div>
                <div className="text-white/85 text-[10px] font-mono">{joinYear}</div>
              </div>
            </div>
            <div>
              <div className="text-white/35 text-[7px] uppercase tracking-widest">Kedaluwarsa</div>
              <div className="text-white/85 text-[10px] font-mono">{expiryStr}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Crown watermark for gold/elite */}
      {(tier === 'elite' || tier === 'gold') && (
        <div className="absolute top-4 right-16 opacity-10 pointer-events-none">
          <Crown size={48} className="text-white" />
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="w-full max-w-[480px] mx-auto">
        {/* Card with hover animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -5,
            scale: 1.025,
            boxShadow: `0 35px 80px ${cfg.glowColor}`
          }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            boxShadow: { duration: 0.3 }
          }}
          className="cursor-pointer rounded-2xl"
          onClick={() => setIsFullscreen(true)}
        >
          <CardContent />
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/50 hover:text-white text-xs transition-all cursor-pointer font-medium"
          >
            <Maximize2 size={12} /> Tampilan Penuh
          </button>
          <button
            onClick={() => {
              // Download: open card in new tab (placeholder)
              window.print();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/50 hover:text-white text-xs transition-all cursor-pointer font-medium"
          >
            <Download size={12} /> Unduh
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'My RideVault Card', text: `${name} — ${cfg.label} member`, url: window.location.href });
              }
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/50 hover:text-white text-xs transition-all cursor-pointer font-medium"
          >
            <Share2 size={12} /> Bagikan
          </button>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[110] flex flex-col items-center justify-center p-8 gap-6">
          <div className="w-full max-w-lg">
            <CardContent />
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium text-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            Kembali
          </button>
        </div>
      )}
    </>
  );
}
