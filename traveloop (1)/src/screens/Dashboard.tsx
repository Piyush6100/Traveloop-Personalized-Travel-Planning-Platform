import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Trip } from '../types';
import { Button, Card } from '../components/ui/Toolkit';
import { Plus, ArrowRight, Calendar, MapPin, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'trips'),
          where('ownerId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(4)
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

  const recommendations = [
    { name: 'Kyoto, Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800', cost: '$$$' },
    { name: 'Santorini, Greece', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800', cost: '$$$' },
    { name: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800', cost: '$$' },
    { name: 'Lisbon, Portugal', image: 'https://images.unsplash.com/photo-1585211843231-9f939e4407ab?q=80&w=800', cost: '$$' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
      {/* Banner Section */}
      <section className="relative h-[50vh] min-h-[400px] rounded-[40px] overflow-hidden group">
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000" 
          alt="Travel Banner" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-xl space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-serif italic text-white font-bold leading-tight">
              Where will your <br /> journey take you?
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-medium">
              Plan, budget, and share your multi-city adventures with Traveloop.
            </p>
            <Link to="/trips/new">
              <Button size="lg" className="bg-white text-[#1A1A1A] hover:bg-stone-100">
                <Plus className="w-5 h-5 mr-2" />
                Plan a New Trip
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Regional Selections */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#5A5A40]" />
            <h2 className="text-2xl font-serif italic font-bold">Top Regional Selections</h2>
          </div>
          <Link to="/activities" className="text-sm font-semibold text-[#5A5A40] hover:underline flex items-center">
            Explore all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((city, idx) => (
            <motion.div 
              key={city.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative aspect-square rounded-3xl overflow-hidden group cursor-pointer"
            >
              <img src={city.image} alt={city.name} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-6 flex flex-col justify-end">
                <p className="text-white font-bold text-lg">{city.name}</p>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">{city.cost}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Trips */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif italic font-bold">Recent Trips</h2>
          <Link to="/trips" className="text-sm font-semibold text-[#5A5A40] hover:underline">
            View all trips
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/50 animate-pulse rounded-3xl border border-[#1A1A1A]/5" />)}
          </div>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <Card className="p-0 overflow-hidden group cursor-pointer transition-all hover:shadow-xl hover:border-[#5A5A40]/30 h-full">
                  <div className="h-32 bg-stone-200 relative overflow-hidden">
                    {trip.coverPhoto ? (
                      <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#5A5A40]/10">
                        <MapPin className="w-8 h-8 text-[#5A5A40]/20" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-[#1A1A1A]/10">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40]">{trip.status}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-serif italic font-bold leading-tight group-hover:text-[#5A5A40] transition-colors">{trip.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/60 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-[#5A5A40]/5 border-dashed border-2 py-16 flex flex-col items-center justify-center text-center space-y-4">
             <MapPin className="w-12 h-12 text-[#5A5A40]/20" />
             <div className="space-y-1">
               <h3 className="text-xl font-serif italic font-bold">No trips planned yet</h3>
               <p className="text-[#1A1A1A]/60 text-sm">Start your next adventure by creating your first itinerary.</p>
             </div>
             <Link to="/trips/new">
               <Button variant="outline">Create Initial Trip</Button>
             </Link>
          </Card>
        )}
      </section>
    </div>
  );
}
