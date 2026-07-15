import React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BikeDetailsModal from '../components/ui/BikeDetailsModal';
import BikeCard from '../components/collection/BikeCard';
import BikeCardSkeleton from '../components/collection/BikeCardSkeleton';
import CollectionFilters from '../components/collection/CollectionFilters';
import { useBikes } from '../contexts/BikeContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function Collection() {
  const { bikes: showcaseBikes } = useBikes();
  const { user, toggleFavoriteBike } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('favoriteBikes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleFavoritesUpdated = () => {
      try {
        const stored = localStorage.getItem('favoriteBikes');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (e) {}
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortOption, setSortOption] = useState('default');
  
  const [showFilters, setShowFilters] = useState(false);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailBike, setSelectedDetailBike] = useState<number | null>(null);

  const toggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (user) {
      await toggleFavoriteBike(id);
    } else {
      setFavorites(prev => {
        const newFavs = prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id];
        try {
          localStorage.setItem('favoriteBikes', JSON.stringify(newFavs));
          window.dispatchEvent(new Event('favoritesUpdated'));
        } catch (err) {
          // ignore
        }
        return newFavs;
      });
    }
  };

  const openDetails = (id: number) => {
    setSelectedDetailBike(id);
    setShowDetailsModal(true);
  };

  const closeDetails = () => {
    setShowDetailsModal(false);
    setSelectedDetailBike(null);
  };

  const brands = ['All', ...(Array.from(new Set(showcaseBikes.map(b => b.brand))) as string[])];

  const filteredBikes = useMemo(() => {
    let result = showcaseBikes.filter(bike => {
      const matchSearch = bike.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bike.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBrand = selectedBrand === 'All' || bike.brand === selectedBrand;
      const matchStatus = selectedStatus === 'All' || bike.status === selectedStatus;
      
      return matchSearch && matchBrand && matchStatus;
    });

    if (sortOption === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'power-desc') {
      const getPower = (p: string) => parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
      result.sort((a, b) => getPower(b.power) - getPower(a.power));
    }

    return result;
  }, [searchQuery, selectedBrand, selectedStatus, sortOption]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 text-[#050505]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 flex-wrap">
            <div>
              <Link to="/#collection" className="inline-flex items-center gap-2 text-sm font-semibold text-black/40 hover:text-[#D4AF37] transition-colors mb-4 uppercase tracking-widest">
                <ArrowLeft size={16} /> Back to Home
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#050505] uppercase">
                The Vault <span className="text-[#D4AF37]">Collection</span>
              </h1>
              <p className="mt-4 text-black/60 max-w-xl">
                Temukan koleksi eksklusif motor sport berperforma tinggi yang dikurasi secara ketat. Pilih armada impian Anda untuk melihat spesifikasi performa mendalam atau mulai reservasi hari ini.
              </p>
            </div>

            {/* Filter & Search Controls combined in CollectionFilters component */}
            <CollectionFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              sortOption={sortOption}
              setSortOption={setSortOption}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              brands={brands}
            />
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <BikeCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredBikes.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-black/40 text-lg">No motorcycles match your current filters.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('All');
                  setSelectedStatus('All');
                  setSortOption('default');
                }}
                className="mt-4 text-[#D4AF37] font-bold text-sm uppercase tracking-widest hover:text-[#c2a033] underline underline-offset-4"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBikes.map((bike) => (
                <BikeCard 
                  key={bike.id}
                  bike={bike}
                  isFavorite={favorites.includes(bike.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => openDetails(bike.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <BikeDetailsModal 
        isOpen={showDetailsModal} 
        onClose={closeDetails} 
        bike={selectedDetailBike !== null ? showcaseBikes.find(b => b.id === selectedDetailBike) : null} 
        onPrev={() => {
          if (filteredBikes.length <= 1) return;
          const idx = filteredBikes.findIndex(b => b.id === selectedDetailBike);
          if (idx === -1) return;
          const nextIdx = idx > 0 ? idx - 1 : filteredBikes.length - 1;
          setSelectedDetailBike(filteredBikes[nextIdx].id);
        }}
        onNext={() => {
          if (filteredBikes.length <= 1) return;
          const idx = filteredBikes.findIndex(b => b.id === selectedDetailBike);
          if (idx === -1) return;
          const nextIdx = idx < filteredBikes.length - 1 ? idx + 1 : 0;
          setSelectedDetailBike(filteredBikes[nextIdx].id);
        }}
      />
    </>
  );
}
