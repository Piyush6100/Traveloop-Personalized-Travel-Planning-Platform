import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChecklistItem } from '../types';
import { Button, Card, Input } from '../components/ui/Toolkit';
import { CheckCircle2, Circle, Plus, Trash2, ShoppingBag, Briefcase, Pill, Laptop, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PackingChecklist() {
  const { tripId } = useParams();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState({ item: '', category: 'Essentials' });
  const [loading, setLoading] = useState(true);

  const categories = ['Essentials', 'Clothing', 'Tech', 'Health', 'Documents'];

  useEffect(() => {
    if (!tripId) return;
    const q = query(collection(db, 'trips', tripId, 'checklist'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChecklistItem)));
      setLoading(false);
    });
    return unsubscribe;
  }, [tripId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !newItem.item) return;
    try {
      await addDoc(collection(db, 'trips', tripId, 'checklist'), {
        ...newItem,
        isPacked: false,
        createdAt: serverTimestamp()
      });
      setNewItem({ item: '', category: 'Essentials' });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const togglePacked = async (id: string, currentStatus: boolean) => {
    if (!tripId) return;
    try {
      await updateDoc(doc(db, 'trips', tripId, 'checklist', id), { isPacked: !currentStatus });
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!tripId) return;
    try {
      await deleteDoc(doc(db, 'trips', tripId, 'checklist', id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Tech': return <Laptop className="w-4 h-4" />;
      case 'Clothing': return <ShoppingBag className="w-4 h-4" />;
      case 'Health': return <Pill className="w-4 h-4" />;
      case 'Documents': return <Briefcase className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };

  const packedCount = items.filter(i => i.isPacked).length;
  const progress = items.length > 0 ? (packedCount / items.length) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic font-bold text-[#1A1A1A]">Packing List</h1>
          <p className="text-[#1A1A1A]/60 font-medium">Don't leave the essentials behind.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">Trip Readiness</p>
          <div className="flex items-center gap-4">
             <div className="w-48 h-2 bg-stone-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-[#5A5A40]" />
             </div>
             <span className="text-sm font-bold text-[#5A5A40]">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 border-r border-[#1A1A1A]/5 pr-4">
           <Card className="bg-stone-50 border-none shadow-none p-6 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/40">Add New Item</h3>
              <form onSubmit={handleAddItem} className="space-y-4">
                 <Input 
                   placeholder="e.g. Passport, Camera..." 
                   value={newItem.item} 
                   onChange={e => setNewItem(prev => ({ ...prev, item: e.target.value }))}
                   required
                 />
                 <div className="space-y-1 px-4">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      className="w-full bg-white border border-[#1A1A1A]/10 rounded-full px-6 py-2.5 text-sm appearance-none focus:ring-2 focus:ring-[#5A5A40]/20 outline-none"
                      value={newItem.category}
                      onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <Button type="submit" className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                 </Button>
              </form>
           </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
           {categories.map(cat => {
             const catItems = items.filter(i => i.category === cat);
             if (catItems.length === 0) return null;

             return (
               <div key={cat} className="space-y-3">
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-6 h-6 rounded-lg bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                       {getCategoryIcon(cat)}
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">{cat}</h3>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {catItems.map(item => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${item.isPacked ? 'bg-stone-50 border-transparent' : 'bg-white border-stone-100 shadow-sm'}`}
                        >
                          <button 
                            onClick={() => togglePacked(item.id, item.isPacked)}
                            className="flex items-center gap-4 flex-1 text-left"
                          >
                            {item.isPacked ? (
                              <CheckCircle2 className="w-5 h-5 text-[#5A5A40]" />
                            ) : (
                              <Circle className="w-5 h-5 text-stone-300" />
                            )}
                            <span className={`text-sm font-medium ${item.isPacked ? 'text-stone-400 line-through' : 'text-[#1A1A1A]'}`}>
                              {item.item}
                            </span>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 text-stone-200 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
               </div>
             );
           })}

           {items.length === 0 && !loading && (
             <div className="py-20 text-center space-y-4 border-2 border-dashed border-stone-100 rounded-3xl">
                <Briefcase className="w-12 h-12 text-stone-100 mx-auto" />
                <p className="text-stone-300 font-serif italic text-lg">Your bag is currently empty.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
