import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import Dashboard from './screens/Dashboard';
import CreateTripScreen from './screens/CreateTripScreen';
import BuildItineraryScreen from './screens/BuildItineraryScreen';
import UserTripList from './screens/UserTripList';
import ProfilePage from './screens/ProfilePage';
import ActivitySearch from './screens/ActivitySearch';
import ItineraryViewScreen from './screens/ItineraryViewScreen';
import CommunityTab from './screens/CommunityTab';
import PackingChecklist from './screens/PackingChecklist';
import AdminPanel from './screens/AdminPanel';
import TripNotes from './screens/TripNotes';
import ExpenseInvoice from './screens/ExpenseInvoice';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-stone-50 text-stone-900 font-serif italic text-xl">Loading Traveloop...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  return user && isAdmin ? <>{children}</> : <Navigate to="/" />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-[#5A5A40] selection:text-white">
      {user && <Navbar />}
      <main className={user ? "pt-16 pb-12" : ""}>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegistrationScreen />} />
          
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/trips" element={<PrivateRoute><UserTripList /></PrivateRoute>} />
          <Route path="/trips/new" element={<PrivateRoute><CreateTripScreen /></PrivateRoute>} />
          <Route path="/trips/:tripId/build" element={<PrivateRoute><BuildItineraryScreen /></PrivateRoute>} />
          <Route path="/trips/:tripId" element={<PrivateRoute><ItineraryViewScreen /></PrivateRoute>} />
          <Route path="/trips/:tripId/packing" element={<PrivateRoute><PackingChecklist /></PrivateRoute>} />
          <Route path="/trips/:tripId/notes" element={<PrivateRoute><TripNotes /></PrivateRoute>} />
          <Route path="/trips/:tripId/invoice" element={<PrivateRoute><ExpenseInvoice /></PrivateRoute>} />
          
          <Route path="/activities" element={<PrivateRoute><ActivitySearch /></PrivateRoute>} />
          <Route path="/community" element={<PrivateRoute><CommunityTab /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
