import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, X } from 'lucide-react';

interface CollectionFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedBrand: string;
  setSelectedBrand: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  sortOption: string;
  setSortOption: (val: string) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  brands: string[];
}

export default function CollectionFilters({
  searchQuery,
  setSearchQuery,
  selectedBrand,
  setSelectedBrand,
  selectedStatus,
  setSelectedStatus,
  sortOption,
  setSortOption,
  showFilters,
  setShowFilters,
  brands
}: CollectionFiltersProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-black/40" />
          </div>
          <input 
            type="text" 
            placeholder="Search bikes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 rounded-sm text-sm focus:outline-none focus:border-[#D4AF37] transition-colors shadow-sm placeholder:text-black/30"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${showFilters ? 'bg-[#050505] text-white border-[#050505]' : 'bg-white text-[#050505] border-black/10 hover:border-black/30'} shadow-sm`}
        >
          <Filter size={16} /> Filters
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden w-full lg:col-span-2 col-span-1"
          >
            <div className="p-6 mt-4 bg-white border border-black/5 rounded-sm shadow-sm flex flex-wrap gap-8 w-full">
              {/* Brand Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Brand</label>
                <select 
                  value={selectedBrand} 
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-4 py-2 border border-black/10 rounded-sm text-sm bg-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Status</label>
                <div className="flex gap-2">
                  {['All', 'Available', 'Reserved'].map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-4 py-2 border rounded-sm text-xs font-semibold transition-all ${selectedStatus === status ? 'bg-[#050505] text-white border-[#050505]' : 'bg-white text-black/60 border-black/10 hover:border-black/30'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Sort By</label>
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-4 py-2 border border-black/10 rounded-sm text-sm bg-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="power-desc">Power: High to Low</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end ml-auto mt-4 sm:mt-0">
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBrand('All');
                    setSelectedStatus('All');
                    setSortOption('default');
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 p-2"
                >
                  <X size={14} /> Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
