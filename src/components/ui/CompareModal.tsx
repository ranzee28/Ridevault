import { motion } from 'motion/react';
import { ArrowLeftRight, X } from 'lucide-react';
import { showcaseBikes } from '../../data/bikes';

interface CompareModalProps {
  compareList: number[];
  onClose: () => void;
  onClear: () => void;
}

export default function CompareModal({ compareList, onClose, onClear }: CompareModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm pt-20 pb-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white max-w-5xl w-full rounded-sm shadow-2xl overflow-hidden relative flex flex-col max-h-full"
      >
        <div className="p-6 border-b border-black/5 flex justify-between items-center bg-[#FAFAFA] shrink-0">
          <h3 className="text-xl font-bold tracking-tight uppercase text-[#050505] flex items-center gap-2">
            <ArrowLeftRight size={20} className="text-[#D4AF37]"/> 
            Compare Models
          </h3>
          <div className="flex items-center gap-6">
            <button 
              onClick={onClear}
              className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-red-500 transition-colors hidden sm:block"
            >
              Clear Comparison
            </button>
            <button 
              onClick={onClose}
              className="text-black/40 hover:text-[#050505] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row overflow-y-auto w-full">
          {compareList.map((bikeId, idx) => {
            const b = showcaseBikes.find(b => b.id === bikeId)!;
            return (
              <div key={b.id + "-" + idx} className={`flex-1 p-8 flex flex-col ${idx === 0 ? 'border-b md:border-b-0 md:border-r border-black/5' : ''}`}>
                <div className="h-48 flex items-center justify-center mb-6 relative shrink-0">
                  <img src={b.image} alt={b.model} className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl" />
                </div>
                <div className="text-center mb-8 shrink-0">
                  <p className="text-[#D4AF37] font-semibold text-[10px] uppercase mb-1 tracking-[0.2em]">{b.brand}</p>
                  <h4 className="text-2xl font-bold tracking-tighter text-[#050505] uppercase">{b.model}</h4>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-black/5">
                    <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold shrink-0">Engine</span>
                    <span className="font-semibold text-sm text-[#050505] text-right ml-4">{b.engine}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-black/5">
                    <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold shrink-0">Power</span>
                    <span className="font-semibold text-sm text-[#050505] text-right ml-4">{b.power}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-black/5">
                    <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold shrink-0">Price / Day</span>
                    <span className="font-bold text-lg text-[#050505] text-right ml-4">Rp {b.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-black/5">
                    <span className="text-[10px] uppercase tracking-widest text-black/40 font-bold shrink-0">Status</span>
                    <span className={`text-sm font-semibold flex items-center justify-end gap-1.5 ml-4 ${b.status === 'Available' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'Available' ? 'bg-[#D4AF37]' : 'bg-black/20'}`}></span>
                      {b.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-8 pt-4 shrink-0">
                  <button disabled={b.status !== 'Available'} className="w-full py-4 bg-[#050505] text-white rounded-sm font-semibold text-[10px] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#050505] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10">
                    Reserve {b.model}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
