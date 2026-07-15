import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { mockBookings, mockUsers } from './mockData';

export default function OverviewTab({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [stats, setStats] = useState({
    revenue: 'Rp 245M',
    activeBookings: '18',
    totalMembers: '142',
    bookingsList: mockBookings.slice(0, 3)
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all bookings
        const { data: dbBookings, error: bookingsErr } = await supabase
          .from('bookings')
          .select('*');
        if (bookingsErr) throw bookingsErr;

        // Fetch all users
        const { data: dbUsers, error: usersErr } = await supabase
          .from('users')
          .select('*');
        if (usersErr) throw usersErr;

        const bookings: any[] = dbBookings.map(b => ({
          id: b.id,
          user: b.user_name,
          bike: b.bike_name,
          startDate: b.start_date,
          endDate: b.end_date,
          status: b.status,
          total: Number(b.total)
        }));

        const users: any[] = dbUsers;

        let displayBookings = bookings;
        if (bookings.length === 0) {
          displayBookings = mockBookings;
        } else {
          // Sort bookings by creation date or ID
          displayBookings.sort((a, b) => b.id.localeCompare(a.id));
        }

        const totalRevenue = displayBookings
          .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
          .reduce((sum, b) => sum + (b.total || 0), 0);
        
        const activeCount = displayBookings
          .filter(b => b.status === 'Confirmed' || b.status === 'Pending')
          .length;

        const totalMembersVal = users.length > 0 ? users.length : mockUsers.length;

        setStats({
          revenue: totalRevenue > 0 ? `Rp ${(totalRevenue / 1000000).toFixed(1)}M` : 'Rp 245M',
          activeBookings: String(activeCount),
          totalMembers: String(totalMembersVal),
          bookingsList: displayBookings.slice(0, 3)
        });
      } catch (err) {
        console.error("Error loading Overview metrics:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();

    const channel = supabase.channel('overview_bookings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: stats.revenue, trend: '+12.5%', color: 'text-green-500' },
          { label: 'Active Bookings', value: stats.activeBookings, trend: '+4.2%', color: 'text-green-500' },
          { label: 'Fleet Utilization', value: '82%', trend: '+1.5%', color: 'text-green-500' },
          { label: 'Total Members', value: stats.totalMembers, trend: '+8.4%', color: 'text-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-lg hover:border-[#D4AF37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all cursor-default group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">{stat.label}</div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className={`text-xs font-medium ${stat.color}`}>{stat.trend} from last month</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-lg shadow-xl">
        <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
          Recent Bookings
          <button onClick={() => setActiveTab('bookings')} className="text-[#D4AF37] text-xs hover:text-white uppercase tracking-widest transition-colors">View All</button>
        </h2>
        <div className="space-y-4">
          {stats.bookingsList.map(booking => (
            <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 rounded-md border border-white/5 hover:border-[#D4AF37]/30 hover:bg-white/10 transition-all cursor-pointer" onClick={() => setActiveTab('bookings')}>
              <div>
                <div className="font-bold">{booking.user}</div>
                <div className="text-xs text-white/50">{booking.bike} • {booking.startDate}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">Rp {booking.total.toLocaleString('id-ID')}</div>
                <div className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                  booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 
                  booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                  booking.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/60'
                }`}>
                  {booking.status}
                </div>
              </div>
            </div>
          ))}
          {stats.bookingsList.length === 0 && (
            <div className="text-center text-white/40 p-4">No recent bookings.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
