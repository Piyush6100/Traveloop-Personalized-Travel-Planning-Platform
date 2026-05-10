import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/ui/Toolkit';
import { Plane, Calendar, Info, Image as ImageIcon, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function CreateTripScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    coverPhoto: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'trips'), {
        ...formData,
        ownerId: user.uid,
        status: 'upcoming',
        isPublic: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate(`/trips/${docRef.id}/build`);
    } catch (error) {
      console.error("Error creating trip:", error);
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
    'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?q=80&w=800'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-[#5A5A40] rounded-2xl flex items-center justify-center rotate-3">
          <Plane className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-serif italic font-bold text-[#1A1A1A] tracking-tight">Plan a new trip</h1>
          <p className="text-[#1A1A1A]/60 font-medium">The adventure begins here.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card className="space-y-6">
            <div className="space-y-1">
               <Input
                id="name"
                label="Trip Name"
                placeholder="European Summer Solstice"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="startDate"
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                required
              />
              <Input
                id="endDate"
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1.5 px-4">
              <label htmlFor="description" className="text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60">
                Trip Description (Optional)
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="A month-long journey through the Alps and the Mediterranean coast..."
                className="w-full bg-white border border-[#1A1A1A]/10 rounded-3xl px-6 py-4 text-sm ring-offset-white transition-all focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40]"
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            
            <div className="space-y-4 px-4 pt-4 border-t border-[#1A1A1A]/10">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Select a Cover Photo
              </label>
              <div className="grid grid-cols-4 gap-3">
                {presets.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, coverPhoto: url }))}
                    className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${formData.coverPhoto === url ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <Input
                id="coverPhotoUrl"
                placeholder="Or paste an image URL..."
                value={formData.coverPhoto}
                onChange={e => setFormData(p => ({ ...p, coverPhoto: e.target.value }))}
                className="mt-2"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Creating...' : 'Start Planning'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </form>

        <div className="space-y-6">
          <Card className="bg-[#5A5A40] text-white">
            <h3 className="text-xl font-serif italic mb-4">Planning Insights</h3>
            <ul className="space-y-4 text-sm font-medium text-white/80">
              <li className="flex gap-3">
                <Calendar className="w-5 h-5 shrink-0 text-white/40" />
                <span>Multi-city trips work best when you spend at least 3 days in each major hub.</span>
              </li>
              <li className="flex gap-3">
                <Info className="w-5 h-5 shrink-0 text-white/40" />
                <span>You can add stops and activities in the next step.</span>
              </li>
            </ul>
          </Card>

          <Card className="bg-stone-50 border-dashed border-2">
             <div className="flex flex-col items-center text-center p-4 space-y-3">
               <MapPin className="w-10 h-10 text-stone-200" />
               <p className="text-xs text-stone-500 font-medium">Your trip will be private by default. You can share it later in the Community tab.</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
