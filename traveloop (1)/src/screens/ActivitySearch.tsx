import React, { useState } from 'react';
import { Button, Card, Input } from '../components/ui/Toolkit';
import { Search, Compass, MapPin, Star, Clock, DollarSign, Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FEATURED_ACTIVITIES = [
  { id: 1, name: 'Traditional Tea Ceremony', location: 'Kyoto, Japan', category: 'Culture', rating: 4.9, price: '$45', image: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?q=80&w=800' },
  { id: 2, name: 'Sunset Sailing', location: 'Santorini, Greece', category: 'Adventure', rating: 4.8, price: '$120', image: 'https://images.unsplash.com/photo-1518151525039-4470a3692be4?q=80&w=800' },
  { id: 3, name: 'Uluwatu Temple Visit', location: 'Bali, Indonesia', category: 'Spiritual', rating: 4.7, price: '$15', image: 'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?q=80&w=800' },
  { id: 4, name: 'Alfama Walking Tour', location: 'Lisbon, Portugal', category: 'Exploring', rating: 4.9, price: '$25', image: 'https://images.unsplash.com/photo-1548123281-c309486c4786?q=80&w=800' },
  { id: 5, name: 'Great Wall Hiking', location: 'Huairou, China', category: 'Adventure', rating: 4.9, price: '$60', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800' },
  { id: 6, name: 'Private Vineyard Tour', location: 'Tuscany, Italy', category: 'Culinary', rating: 5.0, price: '$200', image: 'https://images.unsplash.com/photo-1523301551780-cd17359a95d0?q=80&w=800' },
];

export default function ActivitySearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Culture', 'Adventure', 'Exploring', 'Culinary', 'Spiritual'];

  const filtered = FEATURED_ACTIVITIES.filter(a => 
    (selectedCategory === 'All' || a.category === selectedCategory) &&
    (a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-serif italic font-bold tracking-tight">Discover the World</h1>
        <p className="text-[#1A1A1A]/60 font-medium">Find curated experiences and hidden gems across every continent.</p>
        <div className="relative group max-w-xl mx-auto mt-8">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-300 group-hover:text-[#5A5A40] transition-colors" />
           <input 
             className="w-full bg-white border-2 border-stone-100 rounded-[32px] pl-16 pr-8 py-5 text-lg shadow-xl focus:ring-4 focus:ring-[#5A5A40]/5 focus:border-[#5A5A40] outline-none transition-all"
             placeholder="Search by city, activity, or vibe..."
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4 hide-scrollbar">
           <div className="flex gap-2">
             {categories.map(cat => (
               <button
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-[#5A5A40] text-white shadow-lg' : 'bg-white border border-stone-100 text-stone-400 hover:text-stone-600'}`}
               >
                 {cat}
               </button>
             ))}
           </div>
           <Button variant="outline" size="sm" className="hidden md:flex">
             <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((activity, idx) => (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-0 overflow-hidden group hover:shadow-2xl transition-all border-stone-100 cursor-pointer h-full flex flex-col">
                  <div className="h-64 relative overflow-hidden">
                    <img src={activity.image} alt={activity.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-stone-100">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40]">{activity.category}</p>
                    </div>
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors shadow-sm">
                       <Star className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                  <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                     <div className="space-y-3">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          <MapPin className="w-3 h-3" /> {activity.location}
                       </div>
                       <h3 className="text-2xl font-serif italic font-bold leading-tight group-hover:text-[#5A5A40] transition-colors">{activity.name}</h3>
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1 text-xs font-bold text-[#5A5A40]">
                              <Star className="w-4 h-4 fill-current" /> {activity.rating}
                           </div>
                           <div className="flex items-center gap-1 text-xs font-bold text-stone-400">
                              <DollarSign className="w-4 h-4" /> {activity.price}
                           </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">Add to Trip</Button>
                     </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="py-32 text-center space-y-4">
             <Compass className="w-16 h-16 text-stone-100 mx-auto animate-spin-slow" />
             <p className="text-stone-300 font-serif italic text-2xl">No adventures match your search...</p>
             <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>Clear Search</Button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
