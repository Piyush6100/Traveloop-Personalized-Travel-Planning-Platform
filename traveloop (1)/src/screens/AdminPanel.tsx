import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trip, UserProfile } from '../types';
import { Card, Button } from '../components/ui/Toolkit';
import { Users, Plane, TrendingUp, ShieldCheck, Search, ArrowUpRight, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPanel() {
  const [stats, setStats] = useState({
    userCount: 0,
    tripCount: 0,
    communityPosts: 0
  });
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5)));
        const tripsSnap = await getDocs(query(collection(db, 'trips'), orderBy('createdAt', 'desc'), limit(5)));
        const postsSnap = await getDocs(collection(db, 'communityPosts'));

        setRecentUsers(usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
        setRecentTrips(tripsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Trip)));
        
        setStats({
          userCount: usersSnap.size + 120, // Mocking some growth
          tripCount: tripsSnap.size + 450,
          communityPosts: postsSnap.size
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const chartData = [
    { name: 'Mon', trips: 12 },
    { name: 'Tue', trips: 19 },
    { name: 'Wed', trips: 15 },
    { name: 'Thu', trips: 22 },
    { name: 'Fri', trips: 30 },
    { name: 'Sat', trips: 45 },
    { name: 'Sun', trips: 38 },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-[#5A5A40]">Accessing Control Center...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-[#1A1A1A] rounded-[24px] flex items-center justify-center shadow-xl">
             <ShieldCheck className="w-7 h-7 text-white" />
           </div>
           <div>
             <h1 className="text-4xl font-serif italic font-bold">Admin Console</h1>
             <p className="text-stone-400 font-medium text-sm">System performance and user overview.</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm">Download Logs</Button>
           <Button size="sm">System Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Users', value: stats.userCount, icon: <Users className="w-5 h-5" />, trend: '+12%' },
           { label: 'Planned Trips', value: stats.tripCount, icon: <Plane className="w-5 h-5" />, trend: '+8%' },
           { label: 'Community Posts', value: stats.communityPosts, icon: <TrendingUp className="w-5 h-5" />, trend: '+24%' },
         ].map(stat => (
           <Card key={stat.label} className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                 <div className="w-10 h-10 bg-[#5A5A40]/5 rounded-2xl flex items-center justify-center text-[#5A5A40]">
                   {stat.icon}
                 </div>
                 <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">{stat.trend}</span>
              </div>
              <div>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-4xl font-serif italic font-bold text-[#1A1A1A]">{stat.value}</p>
              </div>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="p-8 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-serif italic font-bold">Registration Activity</h3>
               <BarChart3 className="w-5 h-5 text-stone-200" />
            </div>
            <div className="h-64 cursor-crosshair">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                   <XAxis dataKey="name" stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#A1A1AA" fontSize={10} tickLine={false} axisLine={false} />
                   <Tooltip cursor={{ fill: '#F5F5F0' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                   <Bar dataKey="trips" fill="#5A5A40" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card className="p-8 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-serif italic font-bold">Recent Signups</h3>
               <button className="text-xs font-bold text-[#5A5A40] hover:underline">View All</button>
            </div>
            <div className="space-y-4">
               {recentUsers.map(u => (
                 <div key={u.uid} className="flex items-center justify-between p-4 bg-stone-50 rounded-[20px] transition-all hover:bg-stone-100">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-stone-100">
                          <Users className="w-5 h-5 text-stone-200" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{u.displayName}</p>
                          <p className="text-[10px] text-stone-400 font-medium">{u.email}</p>
                       </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-stone-200" />
                 </div>
               ))}
            </div>
         </Card>
      </div>

      <Card className="overflow-hidden p-0 border-stone-200">
         <div className="p-8 border-b border-stone-100 bg-[#F5F5F0]/50 flex items-center justify-between">
           <h3 className="text-xl font-serif italic font-bold">Global Trip Inventory</h3>
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
             <input className="bg-white border border-stone-200 rounded-full pl-10 pr-6 py-2 text-xs focus:ring-2 focus:ring-[#5A5A40]/10 outline-none w-64" placeholder="Search trips..." />
           </div>
         </div>
         <div className="divide-y divide-stone-100">
            {recentTrips.map(trip => (
              <div key={trip.id} className="p-6 grid grid-cols-4 items-center hover:bg-stone-50/50 transition-colors">
                 <div className="col-span-2 flex items-center gap-4">
                    <div className="w-12 h-8 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                       <img src={trip.coverPhoto} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-bold">{trip.name}</span>
                 </div>
                 <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">{trip.status}</div>
                 <div className="text-right">
                    <span className="text-[10px] font-bold bg-[#5A5A40]/10 text-[#5A5A40] px-3 py-1 rounded-full">DETAILS</span>
                 </div>
              </div>
            ))}
         </div>
      </Card>
    </div>
  );
}
