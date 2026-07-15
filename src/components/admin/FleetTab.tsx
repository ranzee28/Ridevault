import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Save, Trash2, Edit2, Search } from 'lucide-react';
import { useBikes, Bike } from '../../contexts/BikeContext';

export default function FleetTab() {
  const { bikes, addBike, updateBike, deleteBike } = useBikes();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Bike>>({
    brand: '', model: '', engine: '', power: '', price: 0, status: 'Available',
    image: '', topSpeed: '', torque: '', suspension: '', weight: '', gallery: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBikes = bikes.filter(b => 
    b.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.brand && formData.model) {
      if (editingId !== null) {
        await updateBike(editingId, formData);
        setEditingId(null);
      } else {
        await addBike(formData as Omit<Bike, 'id'>);
        setIsAdding(false);
      }
      setFormData({
        brand: '', model: '', engine: '', power: '', price: 0, status: 'Available',
        image: '', topSpeed: '', torque: '', suspension: '', weight: '', gallery: []
      });
    }
  };

  const handleEdit = (bike: Bike) => {
    setFormData(bike);
    setEditingId(bike.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      brand: '', model: '', engine: '', power: '', price: 0, status: 'Available',
      image: '', topSpeed: '', torque: '', suspension: '', weight: '', gallery: []
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Fleet Control</h1>
        <button 
          onClick={() => {
            if (isAdding) {
              handleCancel();
            } else {
              setIsAdding(true);
            }
          }}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 rounded-md text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
        >
          {isAdding ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Bike</>}
        </button>
      </div>

      {/* Add/Edit Bike Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-12"
          >
            <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-lg shadow-2xl">
              <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Motorsport' : 'Add New Motorsport'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Brand</label>
                  <input type="text" required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white" placeholder="e.g. DUCATI" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Model</label>
                  <input type="text" required value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white" placeholder="e.g. PANIGALE V4 R" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Price / Day (Rp)</label>
                  <input type="number" required value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white" placeholder="5500000" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Engine</label>
                  <input type="text" required value={formData.engine} onChange={e => setFormData({...formData, engine: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white" placeholder="e.g. 998CC V4" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Power</label>
                  <input type="text" required value={formData.power} onChange={e => setFormData({...formData, power: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white" placeholder="e.g. 240.5 HP" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Image URL</label>
                  <input type="text" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white" placeholder="/src/Images/placeholder.png" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Top Speed</label>
                  <input type="text" required value={formData.topSpeed} onChange={e => setFormData({...formData, topSpeed: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white" placeholder="198 mph" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Torque</label>
                  <input type="text" required value={formData.torque} onChange={e => setFormData({...formData, torque: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white" placeholder="111.8 Nm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] focus:outline-none transition-colors text-white">
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={handleCancel} className="px-6 py-3 border border-white/10 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-[#D4AF37] text-black rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-colors flex items-center gap-2">
                  <Save size={14} /> {editingId ? 'Update Bike' : 'Save Bike'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bike List */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search fleet..." className="pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-md text-sm focus:border-[#D4AF37] focus:outline-none transition-colors w-64 text-white" />
          </div>
          <div className="text-xs text-white/50 uppercase tracking-widest font-bold">Total: {filteredBikes.length} Bikes</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Image</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Model</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Price/Day</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Status</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredBikes.map(bike => (
                <tr key={bike.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="w-16 h-10 bg-black/50 rounded-sm overflow-hidden flex items-center justify-center">
                      <img src={bike.image} alt={bike.model} className="w-full h-full object-cover opacity-80" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{bike.model}</div>
                    <div className="text-xs text-white/50">{bike.brand}</div>
                  </td>
                  <td className="p-4">Rp {bike.price.toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold ${
                      bike.status === 'Available' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full' : 
                      bike.status === 'Reserved' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full' : 
                      'bg-red-500/20 text-red-400 border border-red-500/30 rounded-full'
                    }`}>
                      {bike.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(bike)} className="text-white/40 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={async () => {
                        if (confirm('Are you sure you want to delete this bike?')) {
                            await deleteBike(bike.id);
                        }
                    }} className="text-white/40 hover:text-red-500 transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBikes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">No bikes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
