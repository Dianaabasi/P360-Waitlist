// "use client";

// import { useState } from 'react';
// // CHANGED: We now import setDoc and doc instead of addDoc
// import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// import { Loader2, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

// // Define types for our data
// interface FormData {
//   fullName: string;
//   email: string;
// }

// type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

// export default function WaitlistPage() {
//   const [formData, setFormData] = useState<FormData>({ fullName: '', email: '' });
//   const [status, setStatus] = useState<SubmissionStatus>('idle');
//   const [message, setMessage] = useState<string>('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus('loading');
//     setMessage(''); // Clear previous messages

//     try {
//       if (!formData.email || !formData.fullName) throw new Error("Please fill in all fields.");
      
//       // 1. Normalize email to lowercase
//       const emailId = formData.email.toLowerCase();

//       // 2. CHANGED: Use setDoc with the email as the ID
//       // This combined with your Security Rules (allow update: if false) is what prevents duplicates.
//       await setDoc(doc(db, "waitlist", emailId), {
//         fullName: formData.fullName,
//         email: emailId, // MUST match the ID for your security rules
//         createdAt: serverTimestamp(),
//         source: "landing_page_v1"
//       });

//       setStatus('success');
//       setMessage("You're on the list! Watch your inbox.");
//       setFormData({ fullName: '', email: '' });
      
//     } catch (error: any) {
//       console.error("Submission Error:", error);
//       setStatus('error');

//       // 3. Smart Error Handling
//       // If Firestore blocks the write (because update is false), it means the email exists.
//       if (error.code === 'permission-denied') {
//         setMessage("You are already on the waitlist!");
//       } else {
//         setMessage("Something went wrong. Please try again.");
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F0F4FF] text-slate-800 overflow-x-hidden font-sans selection:bg-blue-200">
      
//       {/* 1. BACKGROUND BLOBS */}
//       <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
//         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-3xl opacity-50 animate-pulse" />
//         <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-3xl opacity-50" />
//       </div>

//       <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-20">
        
//         {/* 2. HERO SECTION */}
//         <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          
//           {/* Left: Copy */}
//           <div className="space-y-8 text-center lg:text-left">
//             <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-blue-100 text-blue-600 text-sm font-medium shadow-sm">
//               <span className="relative flex h-2 w-2 mr-2">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
//               </span>
//               Early Access Opening Soon
//             </div>

//             <img 
//               src="/logo.svg" 
//               alt="PW360 Logo" 
//               className="w-40 lg:w-56 h-auto mx-auto lg:mx-0 mb-4"
//             />

//             <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
//               Dream. Learn. <br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500">
//                 Earn.
//               </span>
//             </h1>
            
//             <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
//               Break into Web3 with one subscription. Master DeFi, Dev, and Marketing at your own pace.
//             </p>

//             {/* Social Proof */}
//             <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
//               <div className="flex -space-x-3">
//                 {[1, 2, 3, 4].map((i) => (
//                   <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden">
//                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
//                   </div>
//                 ))}
//               </div>
//               <p className="text-sm font-medium text-slate-600">Join <span className="text-slate-900 font-bold">2,400+</span> students</p>
//             </div>
//           </div>

//           {/* Right: Glassmorphism Form */}
//           <div className="relative group">
//             <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
//             <div className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl">
//               <div className="mb-6">
//                 <h3 className="text-2xl font-bold text-slate-900">Secure your spot</h3>
//                 <p className="text-slate-500">Get early bird pricing when we launch.</p>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
//                   <input
//                     id="fullName"
//                     type="text"
//                     required
//                     className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
//                     placeholder="Satoshi Nakamoto"
//                     value={formData.fullName}
//                     onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                   />
//                 </div>
                
//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
//                   <input
//                     id="email"
//                     type="email"
//                     required
//                     className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
//                     placeholder="you@example.com"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   />
//                 </div>

//                 <button
//                   disabled={status === 'loading' || status === 'success'}
//                   className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   {status === 'loading' ? <Loader2 className="animate-spin" /> : 
//                    status === 'success' ? <CheckCircle2 /> : 
//                    <>Join Waitlist <ArrowRight size={20} /></>}
//                 </button>
                
//                 {status === 'success' && <p className="text-green-600 text-center text-sm font-medium">{message}</p>}
                
//                 {/* Enhanced Error Display */}
//                 {status === 'error' && (
//                   <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
//                     <AlertCircle size={16} />
//                     <p>{message}</p>
//                   </div>
//                 )}
//               </form>
//             </div>
//           </div>
//         </div>

//         {/* 3. FEATURES GRID */}
//         <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
//           {[
//             { icon: "/clock-icon.png", color: 'blue', title: "Learn at Your Pace", text: "No fixed schedules. Access high-quality Web3 curriculum whenever you want." },
//             { icon: "/subscription-icon.png", color: 'purple', title: "One Sub, All Access", text: "Unlock our entire library of DeFi, Development, and Marketing courses for one fee." },
//             { icon: "/badge-icon.png", color: 'yellow', title: "On-Chain Proof", text: "Don't just learn. Prove it. Earn verifiable blockchain badges for every skill." }
//           ].map((feature, idx) => (
//             <div key={idx} className={`bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-xl hover:shadow-lg transition-all text-center`}>
//               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto
//                 ${feature.color === 'blue' ? 'bg-blue-100' : 
//                   feature.color === 'purple' ? 'bg-purple-100' : 
//                   'bg-yellow-100'}`}
//               >
//                 <img src={feature.icon} alt={feature.title} className="w-8 h-8 object-contain" />
//               </div>
//               <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
//               <p className="text-slate-600 leading-relaxed">{feature.text}</p>
//             </div>
//           ))}
//         </div>

//         {/* 4. FOLLOW ON X CTA */}
//         <div className="mt-16 text-center">
//           <div className="inline-flex flex-col items-center gap-4 bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-xl">
//             <p className="text-lg text-slate-700 font-medium">Stay updated on our launch</p>
//             <a 
//               href="https://x.com/thePW3acad" 
//               target="_blank" 
//               rel="noopener noreferrer"
//               className="inline-flex items-center gap-3 px-6 py-3 bg-black hover:bg-slate-800 text-white font-bold rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg"
//             >
//               <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
//               </svg>
//               Follow Profunda Web3 Academy
//             </a>
//           </div>
//         </div>

//         {/* 5. FOOTER */}
//         <footer className="mt-24 text-center border-t border-slate-200 pt-8 text-slate-500 text-sm">
//           <p>© 2026 PW360. Built for the Next Billion.</p>
//         </footer>

//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs,
  query, 
  where,
  orderBy, 
  limit, 
  increment,
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  getCountFromServer // Added for stats
} from 'firebase/firestore';
import { db, auth, googleProvider } from '@/lib/firebase';
import { Loader2, Copy, Share2, Trophy, Users, Star, CheckCircle2, LogOut, X, User as UserIcon } from 'lucide-react';

// --- Types ---
interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  referralCode: string;
  referredBy?: string | null; // CHANGED: Allow null
  points: number;
  referralCount: number;
}

export default function WaitlistPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true); // New state for specific loading
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ peopleAhead: 0, totalUsers: 0 });

  // --- 1. LOGIC: Auth & Data Fetching ---
  useEffect(() => {
    // A. Capture Referral Code from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) localStorage.setItem('pw360_referrer', ref);
    }

    // B. Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        await fetchOrCreateUser(currentUser);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    // C. Leaderboard Listener (Real-time)
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10)); // CHANGED: Limit 10
    const unsubscribeLeaderboard = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => doc.data() as UserData);
      setLeaderboard(users);
      setLeaderboardLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeLeaderboard();
    };
  }, []);

  // --- 1.5. LOGIC: Stats Fetching ---
  useEffect(() => {
    if (!userData) return;
    
    const fetchStats = async () => {
        try {
            // Count people with MORE points than current user
            const qAhead = query(collection(db, "users"), where("points", ">", userData.points));
            const snapshotAhead = await getCountFromServer(qAhead);
            
            // Count total users
            const coll = collection(db, "users");
            const snapshotTotal = await getCountFromServer(coll);

            setStats({
                peopleAhead: snapshotAhead.data().count,
                totalUsers: snapshotTotal.data().count
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };
    
    fetchStats();
  }, [userData?.points]); // Re-run if user's points change

  // --- 2. LOGIC: User Actions ---
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  const fetchOrCreateUser = async (currentUser: User) => {
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // User exists, let's load them
      const data = userSnap.data() as UserData;
      
      // --- AUTO-REPAIR LOGIC ---
      // If points are missing or 0 (due to previous crash), fix them now.
      if (!data.points || data.points === 0) {
        await updateDoc(userRef, { points: 100 });
        data.points = 100; // Update local state immediately
      }
      
      setUserData(data);
    } else {
      // --- CREATE NEW USER ---
      const baseName = (currentUser.displayName || "User").replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();
      const newReferralCode = `${baseName}${Math.floor(1000 + Math.random() * 9000)}`;
      const storedRef = localStorage.getItem('pw360_referrer');
      
      const newUser: UserData = {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Anonymous",
        email: currentUser.email || "",
        photoURL: currentUser.photoURL || "",
        referralCode: newReferralCode,
        points: 100, // Welcome Bonus
        referralCount: 0,
        // CRITICAL FIX: Use 'null' instead of 'undefined'
        referredBy: storedRef || null 
      };

      // Create the document
      await setDoc(userRef, { 
        ...newUser, 
        createdAt: serverTimestamp() 
      });
      
      setUserData(newUser);

      // Award referral points if applicable
      if (storedRef) await awardReferrerPoints(storedRef);
    }
  };

  const awardReferrerPoints = async (referralCode: string) => {
    try {
      const q = query(collection(db, "users"), where("referralCode", "==", referralCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        await updateDoc(referrerDoc.ref, {
          points: increment(10),
          referralCount: increment(1)
        });
      }
    } catch (error) {
      console.error("Error awarding points:", error);
    }
  };

  const copyToClipboard = () => {
    if (!userData) return;
    const link = `${window.location.origin}?ref=${userData.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareOnX = () => {
    if (!userData) return;
    const link = `${window.location.origin}?ref=${userData.referralCode}`;
    const text = `I just joined the waitlist for @thePW3acad - The Web3 Education Platform we've been waiting for! 🚀\n\nJoin me on the waitlist and earn points for a discounted subscription price:\n${link}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --- 3. RENDER ---
  return (
    <div className="min-h-screen bg-[#F0F4FF] text-slate-800 overflow-x-hidden font-sans selection:bg-blue-200">
      
      {/* 1. BACKGROUND BLOBS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-20">
        
        {/* TOP BAR */}
        {user && (
          <div className="absolute top-0 right-6 z-50">
            <button onClick={() => auth.signOut()} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-md">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}

        {/* 2. HERO / DASHBOARD SWITCHER */}
        {!user ? (
          /* --- STATE A: LOGGED OUT (LANDING PAGE) --- */
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-blue-100 text-blue-600 text-sm font-medium shadow-sm">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Early Access Opening Soon
              </div>

              <img src="/logo.svg" alt="PW360 Logo" className="w-40 lg:w-56 h-auto mx-auto lg:mx-0 mb-4" />

              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Dream. Learn. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500">
                  Earn.
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Break into Web3 with one subscription. Master DeFi, Dev, and Marketing at your own pace.
              </p>

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

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-white/70 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl text-center lg:text-left">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Join the viral waitlist</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    Earn points for every friend you refer and unlock a discounted subscription price when we launch.
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg shadow-blue-500/30 transform transition hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* --- STATE B: LOGGED IN (VIRAL DASHBOARD) --- */
          <div className="mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <img src="/logo.svg" alt="PW360 Logo" className="w-32 lg:w-40 h-auto mb-10 mx-auto lg:mx-0" />

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
               <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-lg flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                   <Star size={24} fill="currentColor" />
                 </div>
                 <div>
                   <p className="text-slate-500 text-sm font-medium">Your Points</p>
                   <p className="text-3xl font-bold text-slate-900">{userData?.points || 0}</p>
                 </div>
               </div>
               <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-lg flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                   <Users size={24} />
                 </div>
                 <div>
                   <p className="text-slate-500 text-sm font-medium">Referrals</p>
                   <p className="text-3xl font-bold text-slate-900">{userData?.referralCount || 0}</p>
                 </div>
               </div>
               <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-lg flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                   <Trophy size={24} />
                 </div>
                 <div>
                   <p className="text-slate-500 text-sm font-medium">Rank</p>
                   <p className="text-3xl font-bold text-slate-900">
                     #{leaderboard.findIndex(u => u.uid === user.uid) !== -1 
                       ? leaderboard.findIndex(u => u.uid === user.uid) + 1 
                       : "-"}
                   </p>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Share Actions */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 md:p-8 rounded-[2.5rem] shadow-xl">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">Invite friends, earn badges.</h2>
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 mb-8">
                  <ul className="text-sm text-slate-600 space-y-3">
                    <li className="flex gap-2 items-center"><span className="text-lg">🎯</span> <strong>100 Points</strong> for joining</li>
                    <li className="flex gap-2 items-center"><span className="text-lg">🚀</span> <strong>10 Points</strong> per referral</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-500 ml-1">Your Unique Invite Link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-mono text-sm truncate flex items-center">
                      {typeof window !== 'undefined' ? window.location.origin : ''}?ref={userData?.referralCode}
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl transition-colors"
                    >
                      {copySuccess ? <CheckCircle2 size={20} className="text-green-600" /> : <Copy size={20} />}
                    </button>
                  </div>
                  <button onClick={shareOnX} className="w-full py-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl">
                    <Share2 size={18} /> Post on X (Twitter)
                  </button>
                </div>
              </div>

              {/* Right: Leaderboard */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 md:p-8 rounded-[2.5rem] shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="text-yellow-500" /> Leaderboard
                  </h2>
                  <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg">LIVE</span>
                </div>
                <div className="space-y-3">
                  {/* Loading State */}
                  {leaderboardLoading && (
                     <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                        <Loader2 className="animate-spin text-blue-500" />
                        <span className="text-sm">Refreshing ranks...</span>
                     </div>
                  )}

                  {/* Empty State */}
                  {!leaderboardLoading && leaderboard.length === 0 && (
                     <div className="text-center py-10 text-slate-400">
                        <p>No players yet. Be the first!</p>
                     </div>
                  )}

                  {/* List Container */}
                  <div className="space-y-3">
                    {/* PINNED USER ROW (If not in Top 10) */}
                    {!leaderboardLoading && user && !leaderboard.find(u => u.uid === user.uid) && userData && (
                      <div className="flex items-center justify-between p-3 rounded-2xl border bg-blue-50 border-blue-200 mb-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-slate-200 text-slate-700">
                             {/* Calculated Rank would be complex to get real-time without index, showing "-" for now or we rely on stats.peopleAhead + 1 */}
                             {(stats.peopleAhead + 1).toLocaleString()}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                             {userData.photoURL ? (
                               <img 
                                 src={userData.photoURL} 
                                 alt="You" 
                                 className="w-full h-full object-cover"
                               />
                             ) : (
                               <img 
                                 src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.uid}`} 
                                 alt="avatar" 
                                 className="w-full h-full object-cover"
                               />
                             )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">You</p>
                            <p className="text-xs text-slate-400">{userData.points} Points</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scrollable Leaderboard (Max height ~ 5 items) */}
                    <div className="max-h-[320px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                      {!leaderboardLoading && leaderboard.map((player, index) => (
                        <div key={player.uid} className={`flex items-center justify-between p-3 rounded-2xl border ${player.uid === user.uid ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm min-w-8 ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-slate-200 text-slate-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-slate-50 text-slate-500'
                            }`}>
                              {index + 1}
                            </div>
                            {/* Avatar Fallback Logic */}
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative min-w-10">
                              {player.photoURL ? (
                                <img 
                                  src={player.photoURL} 
                                  alt={player.displayName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.uid}`;
                                  }}
                                />
                              ) : (
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.uid}`} 
                                  alt="avatar" 
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm truncate max-w-[120px]">
                                {player.uid === user.uid ? "You" : player.displayName}
                              </p>
                              <p className="text-xs text-slate-400">{player.points} Points</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* People Ahead Stats Card (COMPACT) */}
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-200 text-center">
                    <p className="text-2xl font-extrabold text-slate-900 mb-0 font-serif">
                       {stats.peopleAhead.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-900 font-medium mb-1">people ahead of you.</p>
                    <p className="text-xs text-slate-500">
                       {stats.totalUsers > 0 ? (stats.totalUsers - 1).toLocaleString() : 0} others on the waitlist.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
      {/* 6. AUTH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-sm bg-black border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center space-y-6 text-white">
              <h3 className="text-2xl font-bold">Continue with</h3>
              
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-3 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
                Connect with Google
              </button>

              <p className="text-slate-500 text-sm">
                We'll only use your email to hold your waitlist spot.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}