import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button, Input, Card } from '../components/ui/Toolkit';
import { UserPlus, Plane } from 'lucide-react';
import { motion } from 'motion/react';

export default function RegistrationScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: '',
    country: '',
    additionalInfo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      const displayName = `${formData.firstName} ${formData.lastName}`.trim();
      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        city: formData.city,
        country: formData.country,
        bio: formData.additionalInfo,
        createdAt: new Date().toISOString()
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-[#F5F5F0]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#5A5A40] rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg">
            <Plane className="w-8 h-8 text-white -rotate-12" />
          </div>
          <h1 className="text-4xl font-serif italic font-bold text-[#1A1A1A] mb-2 tracking-tight">Join Traveloop</h1>
          <p className="text-[#1A1A1A]/60 font-medium">Create your traveler profile to start planning.</p>
        </div>

        <Card>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="firstName"
                label="First Name"
                placeholder="Jane"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <Input
                id="lastName"
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="city"
                label="City"
                placeholder="New York"
                value={formData.city}
                onChange={handleChange}
              />
              <Input
                id="country"
                label="Country"
                placeholder="USA"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5 px-4">
              <label htmlFor="additionalInfo" className="text-[11px] uppercase tracking-wider font-semibold text-[#1A1A1A]/60">
                Additional Information (Bio)
              </label>
              <textarea
                id="additionalInfo"
                rows={3}
                placeholder="Tell us about your travel style..."
                className="w-full bg-white border border-[#1A1A1A]/10 rounded-2xl px-6 py-4 text-sm ring-offset-white transition-all focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40]"
                value={formData.additionalInfo}
                onChange={handleChange}
              />
            </div>

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <div className="flex flex-col items-center gap-4">
              <Button type="submit" className="w-full max-w-sm" disabled={loading}>
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? 'Creating Passport...' : 'Register Users'}
              </Button>
              
              <Link to="/login" className="text-sm text-[#1A1A1A]/60 hover:text-[#5A5A40] font-medium">
                Already have an account? <span className="font-bold">Login</span>
              </Link>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
