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
import { Loader2, Copy, Share2, Trophy, Users, Star, CheckCircle2, LogOut, X, User as UserIcon, ExternalLink } from 'lucide-react';

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  referralCode: string;
  referredBy?: string | null;
  points: number;
  referralCount: number;
  createdAt?: any; // Firestore Timestamp
}

type TabType = 'leaderboard' | 'quests';

// Helper to mask email:
const maskEmail = (email: string): string => {
  if (!email) return '****';
  const [localPart, domain] = email.split('@');
  if (!domain) return '****';
  const visibleChars = Math.min(3, localPart.length);
  const masked = localPart.slice(0, visibleChars) + '****';
  return `${masked}@${domain}`;
};

export default function WaitlistPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({ peopleAhead: 0, totalUsers: 0 });
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

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

    // C. Leaderboard Listener (Real-time) - Sort by points DESC, then createdAt ASC (earlier = higher rank)
    const q = query(
      collection(db, "users"), 
      orderBy("points", "desc"), 
      orderBy("createdAt", "asc"), 
      limit(10)
    );
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
    if (!userData || userData.points === undefined) return;
    
    const fetchStats = async () => {
        try {
            // Count people with MORE points than current user
            const qAhead = query(collection(db, "users"), where("points", ">", userData.points));
            const snapshotAhead = await getCountFromServer(qAhead);
            
            // Count people with SAME points but joined BEFORE current user (they rank higher)
            let samePointsAhead = 0;
            if (userData.createdAt) {
              const qSamePoints = query(
                collection(db, "users"), 
                where("points", "==", userData.points),
                where("createdAt", "<", userData.createdAt)
              );
              const snapshotSame = await getCountFromServer(qSamePoints);
              samePointsAhead = snapshotSame.data().count;
            }
            
            // Count total users
            const coll = collection(db, "users");
            const snapshotTotal = await getCountFromServer(coll);

            setStats({
                peopleAhead: snapshotAhead.data().count + samePointsAhead,
                totalUsers: snapshotTotal.data().count
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };
    
    fetchStats();
  }, [userData?.points, userData?.createdAt]);

  // --- 2. LOGIC: User Actions ---
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsModalOpen(false); // Close modal on success
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

              {/* Right: Leaderboard / Quests */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 md:p-8 rounded-[2.5rem] shadow-xl">
                {/* Tab Switcher */}
                <div className="flex items-center justify-center mb-6">
                  <div className="inline-flex bg-slate-100 rounded-full p-1">
                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        activeTab === 'leaderboard' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Leaderboard
                    </button>
                    <button
                      onClick={() => setActiveTab('quests')}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all relative ${
                        activeTab === 'quests' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Quests
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                    </button>
                  </div>
                </div>

                {/* TAB CONTENT */}
                {activeTab === 'leaderboard' ? (
                  /* LEADERBOARD TAB */
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
                               {(stats.peopleAhead + 1).toLocaleString()}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative">
                               <img 
                                 src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.uid}`} 
                                 alt="avatar" 
                                 className="w-full h-full object-cover"
                               />
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
                              {/* Avatar - Always Dicebear */}
                              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative min-w-10">
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.uid}`} 
                                  alt="avatar" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm truncate max-w-[120px]">
                                  {player.uid === user.uid ? "You" : maskEmail(player.email)}
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
                ) : (
                  /* QUESTS TAB */
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 text-center mb-4">Complete quests to earn extra points!</p>
                    
                    {/* Quest: Follow on X */}
                    <a 
                      href="https://x.com/thepw3acad" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Follow on X</p>
                          <p className="text-xs text-slate-400">@thepw3acad</p>
                        </div>
                      </div>
                      <ExternalLink size={18} className="text-slate-400 group-hover:text-blue-500" />
                    </a>

                    {/* Quest: Join Telegram */}
                    <a 
                      href="https://t.me/pw360_channel" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Join TG Community</p>
                          <p className="text-xs text-slate-400">t.me/profunda</p>
                        </div>
                      </div>
                      <ExternalLink size={18} className="text-slate-400 group-hover:text-blue-500" />
                    </a>

                    {/* Quest: Follow on Instagram */}
                    <a 
                      href="https://www.instagram.com/thepw3acad?igsh=eGJrcXYwYTNqazkz" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Follow on Instagram</p>
                          <p className="text-xs text-slate-400">@thepw3acad</p>
                        </div>
                      </div>
                      <ExternalLink size={18} className="text-slate-400 group-hover:text-blue-500" />
                    </a>

                    {/* Quest: Invite a Friend */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Invite a Friend</p>
                          <p className="text-xs text-slate-400">+10 points per referral</p>
                        </div>
                      </div>
                      <button 
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                      >
                        {copySuccess ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copySuccess ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  </div>
                )}
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