import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { CommunityPost, Trip } from '../types';
import { Card, Button } from '../components/ui/Toolkit';
import { Heart, MessageSquare, Share2, MapPin, Loader2, Sparkles, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function CommunityTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'communityPosts'), orderBy('sharedAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost)));
      setLoading(false);
    });

    if (user) {
      const tripsQuery = query(collection(db, 'trips'), orderBy('createdAt', 'desc'));
      onSnapshot(tripsQuery, (snap) => {
        setMyTrips(snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip)));
      });
    }

    return unsubscribe;
  }, [user]);

  const handleShare = async (trip: Trip) => {
    if (!user) return;
    setSharing(true);
    try {
      await addDoc(collection(db, 'communityPosts'), {
        tripId: trip.id,
        userId: user.uid,
        userName: user.displayName || 'Traveler',
        userPhoto: user.photoURL || '',
        tripName: trip.name,
        sharedAt: serverTimestamp(),
        likes: 0,
        commentCount: 0
      });
      // Optionally update trip to mark it as public
      await updateDoc(doc(db, 'trips', trip.id), { isPublic: true });
    } catch (error) {
       console.error("Error sharing trip:", error);
    } finally {
      setSharing(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'communityPosts', postId), { likes: increment(1) });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Community Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-[#5A5A40]/5 p-8 md:p-12 rounded-[40px] border border-[#5A5A40]/10 overflow-hidden relative">
        <Sparkles className="absolute top-4 right-4 w-12 h-12 text-[#5A5A40]/10 rotate-12" />
        <div className="space-y-4 relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif italic font-bold tracking-tight">Traveler Community</h1>
          <p className="text-[#1A1A1A]/60 max-w-xl font-medium">
            Explore itineraries from fellow travelers around the globe. Get inspired, share your own adventures, and build better journeys.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <Button size="lg" onClick={() => (document.getElementById('share-modal') as any)?.showModal()}>
            <Share2 className="w-4 h-4 mr-2" /> Share My Adventure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            [1, 2, 4].map(i => <div key={i} className="h-96 bg-stone-100 animate-pulse rounded-[32px]" />)
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-0 overflow-hidden border-stone-100 hover:shadow-xl transition-all h-full flex flex-col group">
                  <div className="h-48 bg-stone-100 relative">
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end">
                       <h3 className="text-white font-serif italic text-2xl font-bold leading-tight group-hover:translate-x-1 transition-transform">{post.tripName}</h3>
                     </div>
                  </div>
                  <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                        {post.userPhoto ? (
                          <img src={post.userPhoto} alt={post.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-stone-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{post.userName}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-none">Shared Traveler</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-red-500 transition-colors">
                          <Heart className="w-4 h-4" /> {post.likes}
                        </button>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400">
                          <MessageSquare className="w-4 h-4" /> {post.commentCount}
                        </div>
                      </div>
                      <Link to={`/trips/${post.tripId}`}>
                        <Button variant="ghost" size="sm" className="text-xs font-bold">Details</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
             <div className="col-span-full py-20 text-center space-y-4">
               <p className="text-stone-300 font-serif italic text-xl">The world is quiet right now...</p>
               <p className="text-stone-400 text-sm">Be the first to share an itinerary with the community.</p>
             </div>
          )}
        </div>

        <div className="space-y-6">
           <Card className="bg-[#1A1A1A] text-white p-8 space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                 <Loader2 className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic font-bold leading-tight">Trending Destinations</h3>
                <p className="text-white/40 text-sm font-medium">Join the thousands planning their next getaway.</p>
              </div>
              <ul className="space-y-4">
                 {[
                   { name: 'Kyoto', count: '1.2k plans', val: 90 },
                   { name: 'Reykjavik', count: '850 plans', val: 75 },
                   { name: 'Amalfi', count: '740 plans', val: 60 }
                 ].map(t => (
                   <li key={t.name} className="space-y-2">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span>{t.name}</span>
                       <span className="text-white/40">{t.count}</span>
                     </div>
                     <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-[#5A5A40]" style={{ width: `${t.val}%` }} />
                     </div>
                   </li>
                 ))}
              </ul>
           </Card>

           <Card className="p-8 border-[#5A5A40]/20 bg-[#5A5A40]/5">
              <h3 className="text-lg font-serif italic font-bold mb-4">Traveler Guidelines</h3>
              <p className="text-xs text-[#1A1A1A]/60 leading-relaxed font-medium">
                When sharing, please ensure all sensitive personal info is removed from notes. Shared itineraries help the platform provide better automated insights.
              </p>
           </Card>
        </div>
      </div>

      {/* Share Modal */}
      <dialog id="share-modal" className="modal bg-stone-100 p-0 rounded-[40px] shadow-2xl backdrop:bg-black/30 w-full max-w-lg">
        <div className="p-8 space-y-8 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-serif italic font-bold">Share Adventure</h2>
              <p className="text-stone-400 text-sm font-medium">Choose a trip to publish to the community feed.</p>
            </div>
            <form method="dialog"><button className="p-2 hover:bg-stone-50 rounded-full transition-colors font-bold text-stone-400">Close</button></form>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {myTrips.map(trip => (
              <button 
                key={trip.id}
                onClick={() => {
                  handleShare(trip);
                  (document.getElementById('share-modal') as any)?.close();
                }}
                disabled={sharing}
                className="w-full flex items-center gap-4 p-4 rounded-3xl border border-stone-100 hover:border-[#5A5A40] text-left transition-all group"
              >
                <div className="w-12 h-12 bg-stone-50 rounded-2xl overflow-hidden shrink-0">
                  <img src={trip.coverPhoto} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1A1A1A] group-hover:text-[#5A5A40] transition-colors">{trip.name}</p>
                  <p className="text-[10px] uppercase font-bold text-stone-300 tracking-widest">{new Date(trip.startDate).toLocaleDateString()}</p>
                </div>
                <Share2 className="w-4 h-4 text-stone-200 group-hover:text-[#5A5A40]" />
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </div>
  );
}
