import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { signInOwner, signUpOwner } from '../lib/auth';

export const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignup) {
        await signUpOwner({ email, password, full_name: name, phone, businessName });
        alert('Application submitted! You can now sign in.');
        setIsSignup(false);
      } else {
        await signInOwner({ email, password });
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#f8fafc] flex flex-col md:flex-row shadow-inner overflow-hidden">
      {/* Left Decoration (Visible on Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-50 -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-2xl opacity-30 -ml-10 -mb-10" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">HypeHouse Admin</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            {isSignup ? "Partner with us to grow your business." : "Manage your student housing with ease."}
          </h1>
          <p className="text-blue-100 text-lg max-w-md">
            The all-in-one dashboard to list PGs, track bookings, and grow your student accommodation business.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          <div>
            <p className="text-3xl font-black text-white">500+</p>
            <p className="text-blue-200 text-sm">Owners Trusted</p>
          </div>
          <div>
            <p className="text-3xl font-black text-white">10K+</p>
            <p className="text-blue-200 text-sm">Students Housed</p>
          </div>
        </div>
      </div>

      {/* Right Login Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 w-full">
            <h2 className="text-3xl font-black text-slate-900 mb-3">{isSignup ? 'Apply as Owner' : 'Owner Login'}</h2>
            <p className="text-slate-500">{isSignup ? 'Join our network of premium PGs' : 'Welcome back to your dashboard'}</p>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold flex items-center gap-2">
                <XCircle size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 font-medium"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 font-medium"
                      placeholder="e.g. Royal Living PGs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 font-medium"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 font-medium"
                    placeholder="owner@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {!isSignup && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-70 mt-4 group"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    <span>{isSignup ? 'Submit Application' : 'Sign In to Dashboard'}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-10 text-slate-500 font-medium">
            {isSignup ? "Already have an account?" : "Don't have an owner account?"} {' '}
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 font-black hover:underline"
            >
              {isSignup ? 'Login here' : 'Apply here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
