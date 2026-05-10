import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Note } from '../types';
import { Button, Card } from '../components/ui/Toolkit';
import { FileText, Plus, Trash2, Calendar, BookOpen, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TripNotes() {
  const { tripId } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    const q = query(collection(db, 'trips', tripId, 'notes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)));
      setLoading(false);
    });
    return unsubscribe;
  }, [tripId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !newNote) return;
    try {
      await addDoc(collection(db, 'trips', tripId, 'notes'), {
        content: newNote,
        type: 'general',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewNote('');
    } catch (error) {
       console.error("Error adding note:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!tripId) return;
    try {
      await deleteDoc(doc(db, 'trips', tripId, 'notes', id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-[#5A5A40] rounded-[24px] flex items-center justify-center rotate-3 shadow-lg">
          <BookOpen className="w-8 h-8 text-white -rotate-6" />
        </div>
        <div>
          <h1 className="text-4xl font-serif italic font-bold text-[#1A1A1A]">Trip Journal</h1>
          <p className="text-[#1A1A1A]/60 font-medium">Capture memories and important details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-8">
           <Card className="p-0 overflow-hidden border-stone-200">
             <form onSubmit={handleAddNote}>
               <textarea 
                className="w-full p-8 text-lg font-medium text-[#1A1A1A] placeholder:text-stone-200 focus:outline-none min-h-[200px]"
                placeholder="What's on your mind today?"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
               />
               <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
                 <Button type="submit" disabled={!newNote}>
                   Add Entry
                 </Button>
               </div>
             </form>
           </Card>

           <div className="space-y-6">
              <AnimatePresence>
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="p-8 relative group border-stone-100">
                       <Quote className="absolute top-6 right-8 w-12 h-12 text-stone-50 rotate-12 transition-transform group-hover:scale-110" />
                       <div className="space-y-4 relative z-10">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest">
                           <Calendar className="w-3 h-3" />
                           {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Just now'}
                         </div>
                         <p className="text-lg leading-relaxed text-[#1A1A1A]/80 font-medium whitespace-pre-wrap">
                           {note.content}
                         </p>
                         <div className="flex justify-end pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(note.id)} className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1">
                              <Trash2 className="w-3 h-3" /> Delete Entry
                            </button>
                         </div>
                       </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {notes.length === 0 && !loading && (
                <div className="py-24 text-center space-y-4 bg-stone-50/50 rounded-[40px] border-2 border-dashed border-stone-100">
                   <FileText className="w-16 h-16 text-stone-100 mx-auto" />
                   <p className="text-stone-300 font-serif italic text-xl">Your journal is awaiting its first entry.</p>
                </div>
              )}
           </div>
        </div>

        <div className="lg:col-span-1">
           <Card className="bg-[#5A5A40] text-white p-8 space-y-6 sticky top-24">
              <h3 className="text-xl font-serif italic font-bold">Journaling Prompts</h3>
              <ul className="space-y-6 text-sm font-medium text-white/70">
                <li className="space-y-2">
                  <p className="text-white">The Atmosphere</p>
                  <p className="italic">How does the city feel at night vs during the day?</p>
                </li>
                <li className="space-y-2">
                   <p className="text-white">Local Flavors</p>
                   <p className="italic">What was the most surprising thing you ate today?</p>
                </li>
                <li className="space-y-2">
                  <p className="text-white">Unexpected Moments</p>
                  <p className="italic">Describe a conversation you had with a local.</p>
                </li>
              </ul>
           </Card>
        </div>
      </div>
    </div>
  );
}
