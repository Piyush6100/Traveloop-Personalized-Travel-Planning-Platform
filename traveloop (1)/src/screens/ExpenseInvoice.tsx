import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Expense } from '../types';
import { Button, Card, Input } from '../components/ui/Toolkit';
import { DollarSign, Trash2, Plus, Download, Receipt, PieChart, Wallet, ShoppingBag, Utensils, Plane } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ExpenseInvoice() {
  const { tripId } = useParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, category: 'Food' });
  const [loading, setLoading] = useState(true);

  const categories = ['Food', 'Transport', 'Stay', 'Shopping', 'Other'];

  useEffect(() => {
    if (!tripId) return;
    const q = query(collection(db, 'trips', tripId, 'expenses'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
      setLoading(false);
    });
    return unsubscribe;
  }, [tripId]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !newExpense.amount) return;
    try {
      await addDoc(collection(db, 'trips', tripId, 'expenses'), {
        ...newExpense,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      setNewExpense({ description: '', amount: 0, category: 'Food' });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!tripId) return;
    try {
      await deleteDoc(doc(db, 'trips', tripId, 'expenses', id));
    } catch (error) {
       console.error("Error deleting expense:", error);
    }
  };

  const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'Food': return <Utensils className="w-4 h-4" />;
      case 'Transport': return <Plane className="w-4 h-4" />;
      case 'Stay': return <Wallet className="w-4 h-4" />;
      case 'Shopping': return <ShoppingBag className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic font-bold text-[#1A1A1A]">Expense Tracker</h1>
          <p className="text-[#1A1A1A]/60 font-medium">Keep your budget in check while roaming.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" /> Download Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 space-y-8">
           <Card className="bg-[#1A1A1A] text-white p-8 space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">Total Spent</p>
              <p className="text-5xl font-serif italic font-bold tracking-tight">${total.toFixed(2)}</p>
              <div className="pt-4 flex items-center gap-2 text-white/60 text-xs font-semibold">
                <PieChart className="w-4 h-4" /> Based on {expenses.length} entries
              </div>
           </Card>

           <Card className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]/40 mb-6">Log Expense</h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                 <Input 
                   label="Description" 
                   placeholder="Coffee at Montmartre" 
                   value={newExpense.description}
                   onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))}
                   required
                 />
                 <Input 
                   label="Amount ($)" 
                   type="number" 
                   step="0.01" 
                   placeholder="0.00" 
                   value={newExpense.amount || ''}
                   onChange={e => setNewExpense(p => ({ ...p, amount: Number(e.target.value) }))}
                   required
                 />
                 <div className="space-y-1 text-left px-4">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Category</label>
                    <select 
                      className="w-full bg-white border border-[#1A1A1A]/10 rounded-full px-6 py-2.5 text-sm appearance-none outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
                      value={newExpense.category}
                      onChange={e => setNewExpense(p => ({ ...p, category: e.target.value }))}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <Button type="submit" className="w-full">Add Expense</Button>
              </form>
           </Card>
         </div>

         <div className="lg:col-span-3 space-y-6">
           <div className="bg-white border border-stone-200 rounded-[32px] overflow-hidden">
              <div className="grid grid-cols-4 p-6 bg-stone-50 border-b border-stone-100 text-[10px] uppercase font-bold tracking-widest text-stone-400">
                <span className="col-span-2">Description</span>
                <span>Category</span>
                <span className="text-right">Amount</span>
              </div>
              <div className="divide-y divide-stone-100">
                 {expenses.map((expense) => (
                   <motion.div 
                     layout
                     key={expense.id} 
                     className="grid grid-cols-4 p-6 items-center hover:bg-stone-50/50 transition-colors group"
                   >
                     <div className="col-span-2 flex items-center gap-4">
                        <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:text-[#5A5A40] transition-colors">
                           {getIcon(expense.category)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{expense.description}</p>
                          <p className="text-[10px] text-stone-400 font-medium">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div>
                        <span className="text-xs font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full uppercase tracking-widest">
                           {expense.category}
                        </span>
                     </div>
                     <div className="flex items-center justify-end gap-6">
                        <span className="font-serif italic font-bold text-[#1A1A1A] text-lg">${expense.amount.toFixed(2)}</span>
                        <button onClick={() => handleDelete(expense.id)} className="p-2 text-stone-100 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   </motion.div>
                 ))}
                 {expenses.length === 0 && (
                    <div className="p-20 text-center space-y-3">
                       <Receipt className="w-12 h-12 text-stone-50 mx-auto" />
                       <p className="text-stone-300 font-serif italic text-xl">No expenses recorded for this trip.</p>
                    </div>
                 )}
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}
