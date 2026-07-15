import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  description?: string;
}

export default function StatCard({ icon: Icon, label, value, color, description }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 relative overflow-hidden group"
      style={{ boxShadow: `0 0 20px ${color}08` }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 pointer-events-none -translate-y-6 translate-x-6"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
        style={{ background: `${color}18`, border: `1px solid ${color}25` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-white/40 text-xs mt-1 uppercase tracking-wider">{label}</div>
      {description && <div className="text-white/25 text-xs mt-0.5">{description}</div>}
    </motion.div>
  );
}
