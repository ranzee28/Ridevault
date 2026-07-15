import { motion } from 'motion/react';

export default function BikeCardSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-black/5 rounded-sm overflow-hidden flex flex-col shadow-sm"
    >
      <div className="h-64 bg-black/5 relative overflow-hidden">
        {/* Shimmer effect overlay */}
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 z-10 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      </div>
      <div className="p-6 flex flex-col flex-1 relative">
        <motion.div 
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 z-10 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
        />
        <div className="mb-4">
          <div className="h-3 w-16 bg-black/10 rounded-sm mb-3"></div>
          <div className="h-6 w-3/4 bg-black/10 rounded-sm"></div>
        </div>
        <div className="flex-1 space-y-4 mb-6 mt-4">
          <div className="flex justify-between items-center py-2 border-b border-black/5">
            <div className="h-3 w-12 bg-black/5 rounded-sm"></div>
            <div className="h-4 w-16 bg-black/10 rounded-sm"></div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-black/5">
            <div className="h-3 w-12 bg-black/5 rounded-sm"></div>
            <div className="h-4 w-16 bg-black/10 rounded-sm"></div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-black/5">
            <div className="h-3 w-16 bg-black/5 rounded-sm"></div>
            <div className="h-4 w-16 bg-black/10 rounded-sm"></div>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-5">
          <div>
            <div className="h-2 w-16 bg-black/5 mb-2 rounded-sm"></div>
            <div className="h-6 w-16 bg-black/10 rounded-sm"></div>
          </div>
          <div className="h-10 w-24 bg-black/5 rounded-sm"></div>
        </div>
      </div>
    </motion.div>
  );
}
