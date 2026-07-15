import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Edit2, Trash2, Plus, Save, X, Loader2 } from 'lucide-react';
import { mockUsers } from './mockData';
import { supabase } from '../../lib/supabase';

export default function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '', email: '', membership: 'default', status: 'Active'
  });

  useEffect(() => {
    async function loadUsers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const dbUsers: any[] = data.map((u: any) => ({
          id: u.id,
          name: u.name || 'RideVault Member',
          email: u.email || '',
          membership: u.tier || 'default',
          joinDate: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-07-03',
          totalSpent: 0,
          status: 'Active'
        }));
        
        if (dbUsers.length === 0) {
          setUsers(mockUsers);
        } else {
          setUsers(dbUsers);
        }
      } catch (error) {
        console.error("Error loading users from Supabase:", error);
        setUsers(mockUsers);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: '', email: '', membership: 'default', status: 'Active' });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const targetId = editingId || `00000000-0000-0000-0000-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const joinDateVal = editingId ? users.find(u => u.id === editingId)?.joinDate : new Date().toISOString().split('T')[0];
    
    const userData = {
      id: targetId,
      name: formData.name,
      email: formData.email,
      tier: formData.membership,
      role: 'user',
      photo_url: '',
      favorites: []
    };
    
    try {
      const { error } = await supabase
        .from('users')
        .upsert(userData);
      
      if (error) throw error;
      
      const tableUserItem = {
        id: targetId,
        name: formData.name,
        email: formData.email,
        membership: formData.membership,
        joinDate: joinDateVal,
        totalSpent: editingId ? (users.find(u => u.id === editingId)?.totalSpent || 0) : 0,
        status: formData.status
      };

      if (editingId) {
        setUsers(prev => prev.map(u => u.id === editingId ? tableUserItem : u));
        setEditingId(null);
      } else {
        setUsers([tableUserItem, ...users]);
      }
      setIsAdding(false);
      resetForm();
    } catch (err) {
      console.error("Error saving user to Firestore:", err);
      alert("Error saving user profile to Firestore.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setFormData({
      name: user.name,
      email: user.email,
      membership: user.membership,
      status: user.status
    });
    setEditingId(user.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (err) {
        console.error("Error deleting user from Supabase:", err);
        alert("Error deleting user from Supabase.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Users & Membership</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search clients..." className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-sm text-sm focus:border-[#D4AF37] focus:outline-none text-white" />
          </div>
          <button onClick={() => { resetForm(); setIsAdding(true); }} className="flex items-center justify-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-md text-[10px] uppercase tracking-widest font-bold hover:bg-white hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all whitespace-nowrap">
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-lg shadow-2xl mb-8">
              <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit User' : 'New User'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Membership</label>
                  <select required value={formData.membership} onChange={e => setFormData({...formData, membership: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none">
                    <option value="default">Default (Belum Membership)</option>
                    <option value="bronze">Bronze Tier</option>
                    <option value="silver">Silver Tier</option>
                    <option value="gold">Gold Tier</option>
                    <option value="elite">Elite Tier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Status</label>
                  <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-sm focus:border-[#D4AF37] outline-none">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={resetForm} className="px-4 py-2 border border-white/10 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-white/5">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-black rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-white flex items-center gap-2">
                  <Save size={14} /> {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">User ID</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Client Name</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Email</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Tier</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Lifetime Spend</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold">Status</th>
                <th className="p-4 uppercase text-[10px] tracking-widest text-white/50 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-xs text-white/40 truncate max-w-[120px]" title={user.id}>{user.id}</td>
                  <td className="p-4 font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-[#D4AF37] font-extrabold uppercase">
                      {user.name?.charAt(0) || 'R'}
                    </div>
                    {user.name}
                  </td>
                  <td className="p-4 text-white/70">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${
                      user.membership === 'gold' || user.membership === 'Gold' ? 'text-yellow-500 border border-yellow-500/30 bg-yellow-500/20' : 
                      user.membership === 'silver' || user.membership === 'Silver' ? 'text-slate-300 border border-slate-300/30 bg-slate-300/20' : 
                      user.membership === 'bronze' || user.membership === 'Bronze' ? 'text-amber-500 border border-amber-500/30 bg-amber-500/20' :
                      user.membership === 'elite' || user.membership === 'Elite' ? 'text-[#D4AF37] border border-[#D4AF37]/30 bg-[#D4AF37]/20' :
                      'text-zinc-400 border border-zinc-700/30 bg-zinc-800/40'
                    }`}>
                      {user.membership}
                    </span>
                  </td>
                  <td className="p-4 font-medium">Rp {user.totalSpent?.toLocaleString('id-ID') || 0}</td>
                  <td className="p-4">
                     <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.status === 'Active' ? 'text-green-500' : 'text-white/30'}`}>
                       <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-white/30'}`}></span>
                       {user.status}
                     </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(user)} className="text-white/40 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-white/40 hover:text-red-500 transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-sm">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-white/40">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                      <span>Loading members...</span>
                    </div>
                  ) : (
                    'No members found.'
                  )}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
