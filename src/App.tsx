import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Collection from './pages/Collection';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import MembershipCheckout from './pages/MembershipCheckout';
import MembershipDashboard from './pages/MembershipDashboard';
import ReservationPage from './pages/Reservation';
import ScrollToTop from './components/layout/ScrollToTop';
import ScrollToTopButton from './components/layout/ScrollToTopButton';
import LayoutPreloader from './components/layout/layout-preloader';

import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-[#F3F4F6] selection:bg-[#D4AF37] selection:text-black hover:selection:text-[#050505]">
      <LayoutPreloader>
        <ScrollToTop />
        {/* Visual Overlay element from target design */}
        <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-[#94a3b8] to-[#050505] z-[100]"></div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/membership/checkout" element={<MembershipCheckout />} />
          <Route path="/membership/dashboard" element={<MembershipDashboard />} />
          <Route path="/reserve/:bikeId" element={<ReservationPage />} />
        </Routes>
        <ScrollToTopButton />
      </LayoutPreloader>
    </div>
  );
}
