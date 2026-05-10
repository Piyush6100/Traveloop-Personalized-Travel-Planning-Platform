import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Trip } from '../types';
import { Card, Button } from '../components/ui/Toolkit';
import { MapPin, Calendar, MoreVertical, Trash2, ExternalLink, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function UserTripList() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    async function fetchTrips() {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'trips'),
          where('ownerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip)));
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, tripId: string) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'trips', tripId));
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const filteredTrips = trips.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif italic font-bold text-[#1A1A1A]">My Trips</h1>
          <p className="text-[#1A1A1A]/60 font-medium">Manage your past and upcoming adventures.</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-stone-200 p-1 rounded-full">
           {(['all', 'ongoing', 'upcoming', 'completed'] as const).map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-[#5A5A40] text-white' : 'text-stone-400 hover:text-stone-600'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white animate-pulse rounded-[32px] border border-stone-100" />)}
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredTrips.map((trip) => (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Link to={`/trips/${trip.id}`}>
                  <Card className="p-0 overflow-hidden group hover:shadow-xl transition-all h-full border-stone-100">
                    <div className="flex h-full">
                      <div className="w-1/3 relative shrink-0">
                        {trip.coverPhoto ? (
                          <img src={trip.coverPhoto} alt={trip.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="absolute inset-0 bg-[#5A5A40]/10 flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-[#5A5A40]/20" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                           <span className="text-[9px] font-bold uppercase tracking-widest bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[#5A5A40] border border-[#5A5A40]/10">
                             {trip.status}
                           </span>
                        </div>
                      </div>
                      <div className="w-2/3 p-6 flex flex-col justify-between">
                         <div className="space-y-2">
                           <div className="flex justify-between items-start">
                             <h3 className="text-xl font-serif italic font-bold leading-tight group-hover:text-[#5A5A40] transition-colors">{trip.name}</h3>
                             <button onClick={(e) => handleDelete(e, trip.id)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                           <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                           </div>
                           <p className="text-xs text-stone-500 line-clamp-2 mt-2 leading-relaxed">
                             {trip.description || 'No description provided for this adventure.'}
                           </p>
                         </div>
                         <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-50">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Multi-City Trip</span>
                            <div className="flex items-center gap-1 text-[#5A5A40] text-xs font-bold">
                               View Plan <ExternalLink className="w-3 h-3" />
                            </div>
                         </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="py-24 flex flex-col items-center justify-center text-center space-y-4 bg-stone-50 border-dashed border-2">
           <MapPin className="w-12 h-12 text-stone-200" />
           <div className="space-y-1">
             <p className="text-xl font-serif italic font-bold">No trips found here</p>
             <p className="text-stone-400 font-medium text-sm">Time to start planning your next great escape.</p>
           </div>
           <Link to="/trips/new">
             <Button>Plan a New Trip</Button>
           </Link>
        </Card>
      )}
    </div>
  );
}
