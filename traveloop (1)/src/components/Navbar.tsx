import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Plane, Compass, List, Users, User, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'My Trips', path: '/trips', icon: List },
    { label: 'Activities', path: '/activities', icon: Compass },
    { label: 'Community', path: '/community', icon: Users },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-[#1A1A1A]/10 px-4 md:px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#5A5A40] rounded-full flex items-center justify-center">
          <Plane className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-serif italic font-bold tracking-tight text-[#1A1A1A]">Traveloop</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link to="/admin" title="Admin Panel" className="p-2 text-[#1A1A1A]/60 hover:text-[#5A5A40] transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </Link>
        )}
        <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-[#1A1A1A]/10 group">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#E6E6E6] flex items-center justify-center group-hover:bg-[#5A5A40]/10 transition-colors">
              <User className="w-4 h-4 text-[#1A1A1A]/40" />
            </div>
          )}
        </Link>
        <button
          onClick={handleLogout}
          className="p-2 text-[#1A1A1A]/60 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
