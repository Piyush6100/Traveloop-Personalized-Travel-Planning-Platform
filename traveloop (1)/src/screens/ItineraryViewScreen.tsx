import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trip, Stop, Activity, Expense } from '../types';
import { Button, Card } from '../components/ui/Toolkit';
import { Calendar as CalendarIcon, MapPin, Clock, DollarSign, Share2, Pencil, CheckCircle2, ChevronRight, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function ItineraryViewScreen() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [activitiesMap, setActivitiesMap] = useState<Record<string, Activity[]>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'budget'>('list');

  useEffect(() => {
    if (!tripId) return;

    const unsubscribeTrip = onSnapshot(doc(db, 'trips', tripId), (docSnap) => {
      if (docSnap.exists()) {
        setTrip({ id: docSnap.id, ...docSnap.data() } as Trip);
      }
    });

    const stopsQuery = query(collection(db, 'trips', tripId, 'stops'), orderBy('order', 'asc'));
    const unsubscribeStops = onSnapshot(stopsQuery, async (snapshot) => {
      const stopsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stop));
      setStops(stopsData);

      // Fetch all activities for all stops
      const newActivitiesMap: Record<string, Activity[]> = {};
      for (const stop of stopsData) {
        const activitiesSnap = await getDocs(query(collection(db, 'trips', tripId, 'stops', stop.id, 'activities'), orderBy('createdAt', 'asc')));
        newActivitiesMap[stop.id] = activitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      }
      setActivitiesMap(newActivitiesMap);
      setLoading(false);
    });

    return () => {
      unsubscribeTrip();
      unsubscribeStops();
    };
  }, [tripId]);

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-stone-400">Opening your passport...</div>;
  if (!trip) return <div className="h-screen flex items-center justify-center font-serif text-red-500">Trip not found.</div>;

  const totalBudget = stops.reduce((acc, stop) => acc + stop.budget, 0);
  const totalActivityCost = (Object.values(activitiesMap) as Activity[][]).reduce((acc, acts) => acc + acts.reduce((a, b) => a + (b.cost || 0), 0), 0);

  const budgetData = [
    { name: 'Transport & Stay', value: totalBudget, color: '#5A5A40' },
    { name: 'Activities', value: totalActivityCost, color: '#A3A380' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="relative h-64 rounded-[32px] overflow-hidden mb-12">
        <img src={trip.coverPhoto} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 p-8 flex flex-col justify-end">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-white leading-tight">{trip.name}</h1>
              <div className="flex items-center gap-4 text-white/80 text-sm font-medium mt-2">
                <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {stops.length} Cities</span>
              </div>
            </div>
            <div className="flex gap-2">
               <Link to={`/trips/${tripId}/build`}>
                <Button variant="secondary" size="sm"><Pencil className="w-4 h-4 mr-2" /> Edit</Button>
               </Link>
               <Button variant="secondary" size="sm"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="bg-white border border-stone-200 p-1 rounded-full flex gap-1">
          {['list', 'calendar', 'budget'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-[#5A5A40] text-white' : 'text-stone-400 hover:text-stone-600'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {viewMode === 'list' && (
            <div className="space-y-12 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100">
              {stops.map((stop, sIdx) => (
                <div key={stop.id} className="relative pl-12 space-y-6">
                  <div className="absolute left-0 w-10 h-10 bg-white border-2 border-[#5A5A40] rounded-full flex items-center justify-center z-10 text-[10px] font-bold text-[#5A5A40]">
                    {sIdx + 1}
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif italic font-bold">{stop.cityName}</h2>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                      {new Date(stop.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} — {new Date(stop.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {activitiesMap[stop.id]?.map((activity) => (
                      <Card key={activity.id} className="p-4 border-stone-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center shrink-0">
                               <Clock className="w-5 h-5 text-[#5A5A40]/40" />
                            </div>
                            <div>
                              <p className="font-bold text-[#1A1A1A]">{activity.name}</p>
                              <p className="text-xs text-stone-500 mt-1 lines-clamp-2">{activity.description || 'Enjoying the sights and local culture.'}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {activity.time || '10:00 AM'}
                                </span>
                                <span className="text-[10px] font-bold bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" /> {activity.cost}
                                </span>
                              </div>
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-stone-200" />
                        </div>
                      </Card>
                    ))}
                    {(!activitiesMap[stop.id] || activitiesMap[stop.id].length === 0) && (
                      <p className="text-xs text-stone-400 italic">No activities planned for this stop.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'calendar' && (
            <Card className="text-center py-20 bg-stone-50 border-dashed">
               <CalendarIcon className="w-12 h-12 text-stone-200 mx-auto mb-4" />
               <p className="text-stone-400 font-medium">Calendar view coming soon to your itinerary.</p>
               <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-2">v2.0 Beta</p>
            </Card>
          )}

          {viewMode === 'budget' && (
             <div className="space-y-8">
               <Card className="p-8">
                 <h3 className="text-xl font-serif italic font-bold mb-6">Budget Breakdown</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={budgetData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                         {budgetData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                       <Tooltip />
                       <Legend verticalAlign="bottom" height={36}/>
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
               </Card>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#5A5A40] text-white p-6">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white/60">Estimated Total</p>
                    <p className="text-4xl font-serif italic font-bold mt-1">${totalBudget + totalActivityCost}</p>
                  </Card>
                  <Card className="p-6">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Total Activities</p>
                    <p className="text-4xl font-serif italic font-bold text-[#1A1A1A] mt-1">${totalActivityCost}</p>
                  </Card>
               </div>
             </div>
          )}
        </div>

        {/* Sidebar Features */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-4">
             <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 px-4">Trip Tools</h3>
             <div className="space-y-2">
                <ToolLink to={`/trips/${tripId}/packing`} icon={<CheckCircle2 className="w-4 h-4" />} label="Packing Checklist" />
                <ToolLink to={`/trips/${tripId}/notes`} icon={<FileText className="w-4 h-4" />} label="Trip Journal" />
                <ToolLink to={`/trips/${tripId}/invoice`} icon={<PieChartIcon className="w-4 h-4" />} label="Expense Invoice" />
             </div>
          </div>

          <Card className="bg-[#5A5A40]/5 border-[#5A5A40]/10 p-6 space-y-4">
             <h4 className="text-sm font-bold flex items-center gap-2">
               <PieChartIcon className="w-4 h-4 text-[#5A5A40]" />
               Quick Summary
             </h4>
             <div className="space-y-3">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-400">Total Days</span>
                  <span>{Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24))}</span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-400">Cost Per Day</span>
                  <span>${Math.round((totalBudget + totalActivityCost) / (Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24)) || 1))}</span>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ToolLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl group hover:border-[#5A5A40]/30 transition-all shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-[#5A5A40]/60 group-hover:bg-[#5A5A40]/10 group-hover:text-[#5A5A40] transition-colors">
          {icon}
        </div>
        <span className="text-sm font-bold text-[#1A1A1A]">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#5A5A40] transition-colors" />
    </Link>
  );
}
