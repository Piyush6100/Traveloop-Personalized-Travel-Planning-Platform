import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { UserProfile, Trip } from '../types';
import { Button, Card, Input } from '../components/ui/Toolkit';
import { User as UserIcon, Mail, Phone, MapPin, Globe, Camera, Pencil, Settings, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    async function fetchProfileAndTrips() {
      if (!user) return;
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setEditForm(data);
        }

        const q = query(collection(db, 'trips'), where('ownerId', '==', user.uid), limit(3));
        const snapshot = await getDocs(q);
        setTrips(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip)));
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileAndTrips();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { ...editForm });
      if (editForm.displayName) {
        await updateProfile(user, { displayName: editForm.displayName });
      }
      setProfile(prev => ({ ...prev!, ...editForm }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-stone-300">Summoning your profile...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="relative group">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] overflow-hidden border-4 border-white shadow-xl bg-stone-100">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="w-16 h-16 text-stone-200" />
              </div>
            )}
          </div>
          <button className="absolute bottom-2 right-2 w-10 h-10 bg-[#5A5A40] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-serif italic font-bold">{profile?.displayName}</h1>
              <p className="text-stone-500 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {profile?.city && profile?.country ? `${profile.city}, ${profile.country}` : 'World Traveler'}
              </p>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'outline' : 'primary'}>
              {isEditing ? 'Cancel' : <><Pencil className="w-4 h-4 mr-2" /> Edit Profile</>}
            </Button>
          </div>
          <p className="text-stone-600 leading-relaxed max-w-2xl font-medium">
            {profile?.bio || 'You haven\'t added a bio yet. Tell the world about your travel philosophy and favorite destinations.'}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
             <div className="flex items-center gap-2 text-xs font-bold text-stone-400 bg-white border border-stone-100 px-4 py-2 rounded-full">
               <Mail className="w-3.5 h-3.5" /> {profile?.email}
             </div>
             {profile?.phoneNumber && (
               <div className="flex items-center gap-2 text-xs font-bold text-stone-400 bg-white border border-stone-100 px-4 py-2 rounded-full">
                 <Phone className="w-3.5 h-3.5" /> {profile.phoneNumber}
               </div>
             )}
             <div className="flex items-center gap-2 text-xs font-bold text-stone-400 bg-white border border-stone-100 px-4 py-2 rounded-full">
               <Globe className="w-3.5 h-3.5" /> English (US)
             </div>
          </div>
        </div>
      </section>

      {isEditing && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-2xl">
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="Display Name" value={editForm.displayName || ''} onChange={e => setEditForm(p => ({ ...p, displayName: e.target.value }))} />
               <Input label="Email" value={editForm.email || ''} readOnly className="bg-stone-50" />
               <Input label="Phone" value={editForm.phoneNumber || ''} onChange={e => setEditForm(p => ({ ...p, phoneNumber: e.target.value }))} />
               <Input label="Photo URL" value={editForm.photoURL || ''} onChange={e => setEditForm(p => ({ ...p, photoURL: e.target.value }))} />
               <Input label="City" value={editForm.city || ''} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} />
               <Input label="Country" value={editForm.country || ''} onChange={e => setEditForm(p => ({ ...p, country: e.target.value }))} />
               <div className="md:col-span-2">
                 <label className="text-[10px] uppercase font-bold text-stone-400 px-4 mb-1 block">Bio</label>
                 <textarea 
                  className="w-full bg-white border border-stone-100 rounded-3xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20" 
                  rows={3} 
                  value={editForm.bio || ''} 
                  onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                 />
               </div>
               <div className="md:col-span-2 flex justify-end">
                 <Button type="submit">Save Changes</Button>
               </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Trips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-stone-100">
        <section className="space-y-6">
          <h2 className="text-2xl font-serif italic font-bold">Planned Adventures</h2>
          <div className="grid grid-cols-1 gap-4">
            {trips.length > 0 ? trips.map(trip => (
              <Card key={trip.id} className="p-4 flex items-center gap-4 hover:border-[#5A5A40]/30 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                  <img src={trip.coverPhoto} alt={trip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1A1A]">{trip.name}</h4>
                  <p className="text-xs text-stone-400 font-medium">{new Date(trip.startDate).toLocaleDateString()}</p>
                </div>
              </Card>
            )) : (
              <p className="text-stone-400 text-sm italic">No planned trips yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="p-8 bg-[#5A5A40] rounded-[32px] text-white">
            <h3 className="text-xl font-serif italic font-bold mb-4">Travel Preferences</h3>
            <div className="space-y-4">
              {[
                { label: 'Language', icon: <Globe className="w-4 h-4" />, value: 'English (US)' },
                { label: 'Units', icon: <Settings className="w-4 h-4" />, value: 'Metric / USD' },
                { label: 'Security', icon: <Shield className="w-4 h-4" />, value: 'Two-Factor Active' },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      {pref.icon}
                    </div>
                    <span className="text-sm font-medium">{pref.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white/60">{pref.value}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-6">Manage Settings</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
