import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, CalendarDays, Users, TrendingUp } from 'lucide-react';
import OverviewTab from '../components/admin/OverviewTab';
import FleetTab from '../components/admin/FleetTab';
import BookingsTab from '../components/admin/BookingsTab';
import UsersTab from '../components/admin/UsersTab';
import { useAuth } from '../contexts/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'bookings' | 'users'>('overview');

  const handleLogout = async () => {
    await logOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F3F4F6] font-sans selection:bg-[#D4AF37] selection:text-black flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col h-auto md:h-screen sticky top-0 z-20 shadow-2xl">
        <div className="mb-12">
          <Link to="/" className="text-white text-xl font-bold tracking-widest uppercase flex items-center gap-2">
            RIDE<span className="text-[#D4AF37]">VAULT</span>
          </Link>
          <div className="mt-2 text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">Admin Portal</div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'fleet', icon: TrendingUp, label: 'Fleet Control' },
            { id: 'bookings', icon: CalendarDays, label: 'Bookings & Schedule' },
            { id: 'users', icon: Users, label: 'Users & Membership' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-xs uppercase tracking-widest font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] translate-x-2' 
                  : 'text-white/50 hover:bg-white/10 hover:text-white hover:translate-x-1'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-white/10 text-white/50 px-4 py-3 rounded-md text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 hover:text-white transition-all hover:shadow-lg"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen relative">
        {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
        {activeTab === 'fleet' && <FleetTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'users' && <UsersTab />}
      </main>
    </div>
  );
}

