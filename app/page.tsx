"use client";

import { useState } from 'react';
// CHANGED: We now import setDoc and doc instead of addDoc
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

// Define types for our data
interface FormData {
  fullName: string;
  email: string;
}

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function WaitlistPage() {
  const [formData, setFormData] = useState<FormData>({ fullName: '', email: '' });
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage(''); // Clear previous messages

    try {
      if (!formData.email || !formData.fullName) throw new Error("Please fill in all fields.");
      
      // 1. Normalize email to lowercase
      const emailId = formData.email.toLowerCase();

      // 2. CHANGED: Use setDoc with the email as the ID
      // This combined with your Security Rules (allow update: if false) is what prevents duplicates.
      await setDoc(doc(db, "waitlist", emailId), {
        fullName: formData.fullName,
        email: emailId, // MUST match the ID for your security rules
        createdAt: serverTimestamp(),
        source: "landing_page_v1"
      });

      setStatus('success');
      setMessage("You're on the list! Watch your inbox.");
      setFormData({ fullName: '', email: '' });
      
    } catch (error: any) {
      console.error("Submission Error:", error);
      setStatus('error');

      // 3. Smart Error Handling
      // If Firestore blocks the write (because update is false), it means the email exists.
      if (error.code === 'permission-denied') {
        setMessage("You are already on the waitlist!");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] text-slate-800 overflow-x-hidden font-sans selection:bg-blue-200">
      
      {/* 1. BACKGROUND BLOBS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-20">
        
        {/* 2. HERO SECTION */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          
          {/* Left: Copy */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-blue-100 text-blue-600 text-sm font-medium shadow-sm">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Early Access Opening Soon
            </div>

            <img 
              src="/logo.svg" 
              alt="PW360 Logo" 
              className="w-40 lg:w-56 h-auto mx-auto lg:mx-0 mb-4"
            />

            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Dream. Learn. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500">
                Earn.
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Break into Web3 with one subscription. Master DeFi, Dev, and Marketing at your own pace.
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-600">Join <span className="text-slate-900 font-bold">2,400+</span> students</p>
            </div>
          </div>

          {/* Right: Glassmorphism Form */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Secure your spot</h3>
                <p className="text-slate-500">Get early bird pricing when we launch.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Satoshi Nakamoto"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <button
                  disabled={status === 'loading' || status === 'success'}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? <Loader2 className="animate-spin" /> : 
                   status === 'success' ? <CheckCircle2 /> : 
                   <>Join Waitlist <ArrowRight size={20} /></>}
                </button>
                
                {status === 'success' && <p className="text-green-600 text-center text-sm font-medium">{message}</p>}
                
                {/* Enhanced Error Display */}
                {status === 'error' && (
                  <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
                    <AlertCircle size={16} />
                    <p>{message}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* 3. FEATURES GRID */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {[
            { icon: "/clock-icon.png", color: 'blue', title: "Learn at Your Pace", text: "No fixed schedules. Access high-quality Web3 curriculum whenever you want." },
            { icon: "/subscription-icon.png", color: 'purple', title: "One Sub, All Access", text: "Unlock our entire library of DeFi, Development, and Marketing courses for one fee." },
            { icon: "/badge-icon.png", color: 'yellow', title: "On-Chain Proof", text: "Don't just learn. Prove it. Earn verifiable blockchain badges for every skill." }
          ].map((feature, idx) => (
            <div key={idx} className={`bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-xl hover:shadow-lg transition-all text-center`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto
                ${feature.color === 'blue' ? 'bg-blue-100' : 
                  feature.color === 'purple' ? 'bg-purple-100' : 
                  'bg-yellow-100'}`}
              >
                <img src={feature.icon} alt={feature.title} className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>

        {/* 4. FOLLOW ON X CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-xl">
            <p className="text-lg text-slate-700 font-medium">Stay updated on our launch</p>
            <a 
              href="https://x.com/thePW3acad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 bg-black hover:bg-slate-800 text-white font-bold rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow Profunda Web3 Academy
            </a>
          </div>
        </div>

        {/* 5. FOOTER */}
        <footer className="mt-24 text-center border-t border-slate-200 pt-8 text-slate-500 text-sm">
          <p>© 2026 PW360. Built for the Next Billion.</p>
        </footer>

      </div>
    </div>
  );
}