import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button, Input, Card } from '../components/ui/Toolkit';
import { Plane, LogIn, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F5F0] overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#5A5A40]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#5A5A40]/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#5A5A40] rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg">
            <Plane className="w-8 h-8 text-white -rotate-12" />
          </div>
          <h1 className="text-4xl font-serif italic font-bold text-[#1A1A1A] mb-2 tracking-tight">Traveloop</h1>
          <p className="text-[#1A1A1A]/60 font-medium">Welcome back, traveler.</p>
        </div>

        <Card className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Entering...' : 'Login'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#1A1A1A]/10"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-[#1A1A1A]/40 font-semibold tracking-wider">Or continue with</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
            <Mail className="w-4 h-4 mr-2" />
            Google Account
          </Button>

          <p className="text-center text-sm text-[#1A1A1A]/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#5A5A40] font-semibold hover:underline">
              Join the journey
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
