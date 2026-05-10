import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trip, Stop, Activity } from '../types';
import { Button, Card, Input } from '../components/ui/Toolkit';
import { Plus, Trash2, ChevronRight, MapPin, Calendar, Clock, DollarSign, GripVertical, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BuildItineraryScreen() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStop, setShowAddStop] = useState(false);
  
  const [newStop, setNewStop] = useState({ cityName: '', startDate: '', endDate: '', budget: 0 });

  useEffect(() => {
    if (!tripId) return;

    const fetchTrip = async () => {
      const docSnap = await getDoc(doc(db, 'trips', tripId));
      if (docSnap.exists()) {
        setTrip({ id: docSnap.id, ...docSnap.data() } as Trip);
      }
    };
    fetchTrip();

    const q = query(collection(db, 'trips', tripId, 'stops'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stop)));
      setLoading(false);
    });

    return unsubscribe;
  }, [tripId]);

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;
    try {
      await addDoc(collection(db, 'trips', tripId, 'stops'), {
        ...newStop,
        order: stops.length,
        createdAt: serverTimestamp()
      });
      setNewStop({ cityName: '', startDate: '', endDate: '', budget: 0 });
      setShowAddStop(false);
    } catch (error) {
      console.error("Error adding stop:", error);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!tripId) return;
    try {
      await deleteDoc(doc(db, 'trips', tripId, 'stops', stopId));
    } catch (error) {
      console.error("Error deleting stop:", error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-stone-400">Arriving at your itinerary...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif italic font-bold text-[#1A1A1A]">Build Itinerary</h1>
          <p className="text-stone-500 font-medium">{trip?.name} • {stops.length} Stops</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(`/trips/${tripId}`)}>Preview Trip</Button>
          <Button onClick={() => setShowAddStop(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Travel Stop
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 px-4">Trip Route</h3>
          <div className="space-y-2">
            {stops.map((stop, idx) => (
              <div key={stop.id} className="flex items-center gap-3 p-4 bg-white border border-stone-100 rounded-2xl group transition-all hover:border-[#5A5A40]/30 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-400">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{stop.cityName}</p>
                  <p className="text-[10px] text-stone-400 font-medium">
                    {new Date(stop.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
            {stops.length === 0 && <p className="text-xs text-stone-400 italic px-4">No stops added yet.</p>}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence>
            {showAddStop && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-2 border-dashed border-[#5A5A40]/30 bg-[#5A5A40]/5">
                  <form onSubmit={handleAddStop} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="City / Destination"
                        placeholder="Paris, France"
                        value={newStop.cityName}
                        onChange={e => setNewStop(p => ({ ...p, cityName: e.target.value }))}
                        required
                      />
                      <Input
                        label="Stop Budget (Est. $)"
                        type="number"
                        placeholder="1000"
                        value={newStop.budget || ''}
                        onChange={e => setNewStop(p => ({ ...p, budget: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Stop Start Date"
                        type="date"
                        value={newStop.startDate}
                        onChange={e => setNewStop(p => ({ ...p, startDate: e.target.value }))}
                        required
                      />
                      <Input
                        label="Stop End Date"
                        type="date"
                        value={newStop.endDate}
                        onChange={e => setNewStop(p => ({ ...p, endDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" type="button" onClick={() => setShowAddStop(false)}>Cancel</Button>
                      <Button type="submit">Add Stop</Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
             {stops.map((stop) => (
               <StopCard key={stop.id} stop={stop} onDelete={handleDeleteStop} tripId={tripId!} />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StopCard({ stop, onDelete, tripId }: { stop: Stop; onDelete: (id: string) => void; tripId: string; key?: any }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '', cost: 0, time: '', duration: '', type: 'Sightseeing' });

  useEffect(() => {
    const q = query(collection(db, 'trips', tripId, 'stops', stop.id, 'activities'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity)));
    });
    return unsubscribe;
  }, [tripId, stop.id]);

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'trips', tripId, 'stops', stop.id, 'activities'), {
        ...newActivity,
        createdAt: serverTimestamp()
      });
      setNewActivity({ name: '', cost: 0, time: '', duration: '', type: 'Sightseeing' });
      setShowAddActivity(false);
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteDoc(doc(db, 'trips', tripId, 'stops', stop.id, 'activities', activityId));
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  return (
    <Card className="p-0 overflow-hidden border-stone-200">
      <div className="p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#5A5A40]" />
          </div>
          <div>
            <h4 className="text-xl font-serif italic font-bold">{stop.cityName}</h4>
            <p className="text-xs text-stone-500 font-medium">
              {new Date(stop.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} - 
              {new Date(stop.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-4 hidden sm:block">
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Budget</p>
            <p className="text-sm font-bold text-[#5A5A40]">${stop.budget}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(stop.id)} className="text-stone-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs uppercase tracking-widest font-bold text-stone-400">Planned Activities ({activities.length})</h5>
          <button 
            onClick={() => setShowAddActivity(!showAddActivity)}
            className="text-xs font-bold text-[#5A5A40] hover:underline flex items-center gap-1"
          >
            {showAddActivity ? 'Cancel' : '+ Add Activity'}
          </button>
        </div>

        <AnimatePresence>
          {showAddActivity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleAddActivity} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <Input 
                  placeholder="Activity Name" 
                  className="md:col-span-2 py-1.5 px-4" 
                  value={newActivity.name} 
                  onChange={e => setNewActivity(p => ({ ...p, name: e.target.value }))}
                  required 
                />
                <Input 
                  placeholder="Time (e.g. 10:00)" 
                  className="py-1.5 px-4" 
                  value={newActivity.time} 
                  onChange={e => setNewActivity(p => ({ ...p, time: e.target.value }))}
                />
                <Input 
                  placeholder="Cost ($)" 
                  type="number" 
                  className="py-1.5 px-4" 
                  value={newActivity.cost || ''} 
                  onChange={e => setNewActivity(p => ({ ...p, cost: Number(e.target.value) }))}
                />
                <Button type="submit" size="sm" className="w-full">Save</Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full border border-[#5A5A40]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#5A5A40]/20 group-hover:text-[#5A5A40] transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">{activity.name}</p>
                  <div className="flex items-center gap-3 text-[10px] font-medium text-stone-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activity.time || 'TBD'}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {activity.cost}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteActivity(activity.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5 text-stone-300 hover:text-red-400" />
              </Button>
            </div>
          ))}
          {activities.length === 0 && !showAddActivity && (
            <div className="text-center py-8 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
              <p className="text-xs text-stone-400 italic">No activities planned for this stop yet.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
