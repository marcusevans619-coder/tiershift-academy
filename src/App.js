// build 20260531084849
// build: 20260427190525
import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { LabsPage, LabViewer } from "./Labs";
import { BadgesPage } from "./Badges";
import { LearningPathsPage, LearningPathViewer } from "./LearningPaths";
import { ProfilePage } from "./Profile";
import HomePage from "./pages/HomePage";
import LessonViewer from "./pages/LessonViewer";
import AdminDashboard from "./pages/AdminDashboard";
import ModuleBrowser from "./pages/ModuleBrowser";
import { CertificationsPage } from "./Certifications";
const EMOJI_MODULES = String.fromCodePoint(0x1F4DA);
const EMOJI_HOURS   = String.fromCodePoint(0x23F1);
const EMOJI_STREAK  = String.fromCodePoint(0x1F525);
const EMOJI_BADGES  = String.fromCodePoint(0x2B50);

const T = {
  bg:"#060a12",surface:"#101828",card:"#131e30",cardHi:"#182640",
  border:"#1c2d44",borderHi:"#263c58",
  cyan:"#00e5ff",violet:"#a78bfa",rose:"#fb7185",emerald:"#34d399",
  amber:"#fbbf24",sky:"#38bdf8",pink:"#ff6b9d",fuchsia:"#d946ef",
  text:"#e8edf5",sub:"#94a3b8",muted:"#64748b",dim:"#475569",
  success:"#10b981",warning:"#f59e0b",danger:"#ef4444",
};
const dim=(c,a=0.10)=>c+Math.round(a*255).toString(16).padStart(2,'0');

const Bar=({pct,color=T.cyan,h=6})=>(
  <div style={{width:"100%",height:h,borderRadius:h,background:T.border,overflow:"hidden"}}>
    <div style={{width:pct+"%",height:"100%",borderRadius:h,background:color,transition:"width 0.5s"}}/>
  </div>
);

const StatCard=({icon,value,label,color=T.cyan,sub})=>(
  <div style={{padding:"20px",background:T.card,border:"1px solid "+T.border,borderRadius:12,flex:1,minWidth:0}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <span style={{fontSize:18,color}}>{icon}</span>
      <span style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>{label}</span>
    </div>
    <div style={{fontSize:28,fontWeight:800,color,fontFamily:"'JetBrains Mono',monospace"}}>{value}</div>
    {sub&&<div style={{fontSize:12,color:T.muted,marginTop:4}}>{sub}</div>}
  </div>
);

function AuthPage({ onAuth, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = isSignUp ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) onAuth(data.user);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{ background: T.card, padding: 40, borderRadius: 16, width: 380, border: '1px solid '+T.border }}>
        {onBack && <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:"#64748b",cursor:"pointer",fontSize:13,marginBottom:16,padding:0,fontFamily:"inherit" }}>u{2190} Back to Home</button>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, '+T.cyan+', '+T.violet+')', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: T.bg }}>TS</div>
          <div><div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>Tier<span style={{ color: T.cyan }}>Shift</span></div><div style={{ fontSize: 11, color: T.muted }}>Academy</div></div>
        </div>
        <p style={{ color: T.muted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>Sign in to continue your training</p>
        <div style={{ display: 'flex', marginBottom: 24, background: T.surface, borderRadius: 8, padding: 4 }}>
          <button onClick={() => setIsSignUp(false)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: !isSignUp ? T.cyan : 'transparent', color: !isSignUp ? T.bg : T.muted, fontWeight: 700, cursor: 'pointer' }}>Sign In</button>
          <button onClick={() => setIsSignUp(true)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: isSignUp ? T.cyan : 'transparent', color: isSignUp ? T.bg : T.muted, fontWeight: 700, cursor: 'pointer' }}>Create Account</button>
        </div>
        {error && <div style={{ color: T.danger, marginBottom: 16, padding: 12, background: dim(T.danger, 0.1), borderRadius: 8, fontSize: 13 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}><label style={{ display: 'block', color: T.sub, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>EMAIL</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={{ width: '100%', padding: 12, background: T.surface, border: '1px solid '+T.border, borderRadius: 8, color: T.text, fontSize: 14, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 24 }}><label style={{ display: 'block', color: T.sub, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>PASSWORD</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters" required style={{ width: '100%', padding: 12, background: T.surface, border: '1px solid '+T.border, borderRadius: 8, color: T.text, fontSize: 14, boxSizing: 'border-box' }} /></div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: T.cyan, color: T.bg, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>{loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user, profile, modules, userModules, userTracks, userBadges, tracks, onModuleClick, isMobile }) {
  const name = profile?.full_name || user?.email?.split("@")[0] || "Learner";
  const completedModules = userModules?.filter(m => m.completed)?.length || 0;
  const totalHours = userModules?.reduce((sum, m) => sum + (m.hours_spent || 0), 0) || 0;
  const badgeCount = userBadges?.length || 0;
  const streak = 3;
  const recentModuleIds = userModules?.slice(0, 5).map(um => um.module_id) || [];
  const recentModules = modules?.filter(m => recentModuleIds.includes(m.id)) || [];
  const trackProgress = tracks?.map(track => {
    const trackModules = modules?.filter(m => m.track_id === track.id) || [];
    const completedInTrack = userModules?.filter(um => um.completed && trackModules.some(tm => tm.id === um.module_id))?.length || 0;
    const total = trackModules.length;
    const pct = total > 0 ? Math.round((completedInTrack / total) * 100) : 0;
    return { ...track, completedInTrack, total, pct };
  }).filter(t => t.total > 0) || [];
  const TRACK_COLORS = { "network": T.emerald, "security": T.rose, "cloud": T.amber, "aisec": T.pink, "t1t2": T.cyan, "t2t3": T.violet };
  return (
    <div>
      <div style={{marginBottom:32}}>
        <h1 style={{color:T.text,fontSize:isMobile?20:28,fontWeight:800,marginBottom:4}}>Welcome back, {name}!</h1>
        <p style={{color:T.muted,fontSize:15}}>Continue your IT career journey</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:16,marginBottom:32}}>
        <StatCard icon={EMOJI_MODULES} value={completedModules} label="Modules" color={T.cyan} sub={modules?.length ? "of "+modules.length+" total" : null}/>
        <StatCard icon={EMOJI_HOURS} value={totalHours.toFixed(1)} label="Hours" color={T.violet} sub="studied"/>
        <StatCard icon={EMOJI_STREAK} value={streak} label="Day Streak" color={T.amber} sub="keep it up!"/>
        <StatCard icon={EMOJI_BADGES} value={badgeCount} label="Badges" color={T.emerald} sub="earned"/>
      </div>
      <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:24,marginBottom:32}}>
        <h2 style={{color:T.text,fontSize:18,fontWeight:700,marginBottom:20}}>Track Progress</h2>
        {trackProgress.length === 0 ? (<p style={{color:T.muted}}>No tracks available yet.</p>) : (
          <div style={{display:"grid",gap:16}}>
            {trackProgress.slice(0, 6).map(track => (
              <div key={track.id}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{color:T.text,fontSize:14,fontWeight:500}}>{track.name || track.title || "Unknown Track"}</span>
                  <span style={{color:T.muted,fontSize:13}}>{track.completedInTrack}/{track.total} modules</span>
                </div>
                <Bar pct={track.pct} color={TRACK_COLORS[track.slug] || T.cyan} h={8}/>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:24}}>
        <h2 style={{color:T.text,fontSize:18,fontWeight:700,marginBottom:20}}>{recentModules.length > 0 ? "Continue Learning" : "Get Started"}</h2>
        {modules?.length === 0 ? (<p style={{color:T.muted}}>No modules available yet.</p>) : recentModules.length > 0 ? (
          <div style={{display:"grid",gap:12}}>
            {recentModules.map(mod => {
              const progress = userModules?.find(um => um.module_id === mod.id);
              const pct = progress?.progress_pct || 0;
              return (<div key={mod.id} onClick={() => onModuleClick(mod)} style={{display:"flex",alignItems:"center",gap:16,padding:16,background:T.surface,border:"1px solid "+T.border,borderRadius:8,cursor:"pointer"}}><div style={{flex:1}}><div style={{color:T.text,fontWeight:600,marginBottom:4}}>{mod.name}</div><Bar pct={pct} color={T.cyan} h={4}/></div><div style={{color:T.cyan,fontSize:13,fontWeight:600}}>{pct}%</div></div>);
            })}
          </div>
        ) : (
          <div style={{display:"grid",gap:12}}>
            {modules?.slice(0, 3).map(mod => (<div key={mod.id} onClick={() => onModuleClick(mod)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:16,background:T.surface,border:"1px solid "+T.border,borderRadius:8,cursor:"pointer"}}><div style={{color:T.text,fontWeight:600}}>{mod.name}</div><span style={{color:T.cyan,fontSize:13}}>Start</span></div>))}
          </div>
        )}
      </div>
    </div>
  );
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "#" },
  { id: "tracks", label: "Career Tracks", icon: ">" },
  { id: "paths", label: "Learning Paths", icon: "P" },
  { id: "labs", label: "Labs", icon: "L" },
  { id: "badges", label: "Badges", icon: "B" },
  { id: "certs", label: "Certifications", icon: "C" },
  
  { id: "admin", label: "Admin", icon: "A" },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [showLanding, setShowLanding] = useState(!sessionStorage.getItem('visited'));
  const dismissLanding = () => { sessionStorage.setItem('visited', '1'); setShowLanding(false); };
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [modules, setModules] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [userModules, setUserModules] = useState([]);
  const [userTracks, setUserTracks] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); if (s?.user) load(s.user.id); else setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => { setSession(s); if (s?.user) load(s.user.id); else { setProfile(null); setLoading(false); } });
    return () => subscription.unsubscribe();
  }, []);

  const load = async (uid) => {
    setLoading(true);
    const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(p);
    const { data: m } = await supabase.from("modules").select("*").eq("is_active", true).order("sort_order");
    setModules(m || []);
    const { data: t } = await supabase.from("tracks").select("*").order("sort_order");
    setTracks(t || []);
    const { data: um } = await supabase.from("user_modules").select("*").eq("user_id", uid);
    setUserModules(um || []);
    const { data: ut } = await supabase.from("user_tracks").select("*").eq("user_id", uid);
    setUserTracks(ut || []);
    const { data: ub } = await supabase.from("user_badges").select("*").eq("user_id", uid);
    setUserBadges(ub || []);
    setLoading(false);
  };

  useEffect(() => { const r = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  const handleModuleClick = (mod) => { setSelectedModule(mod); setPage("study"); };
  const handleNavClick = (navId) => { setPage(navId); setSelectedModule(null); setSelectedLab(null); setSelectedPath(null); setNavOpen(false); };

  if (showLanding) return <HomePage onGetStarted={dismissLanding} onSignIn={dismissLanding} />;
  if (loading) return <div style={{ height: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.cyan }}>Loading...</div>;
  if (!session) return <AuthPage onAuth={(u) => { setSession({ user: u }); load(u.id); }} onBack={() => { sessionStorage.removeItem('visited'); setShowLanding(true); }} />;

  const user = session.user;
  const name = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard user={user} profile={profile} modules={modules} userModules={userModules} userTracks={userTracks} userBadges={userBadges} tracks={tracks} onModuleClick={handleModuleClick} isMobile={isMobile} />;
      case "tracks": return <ModuleBrowser onSelectModule={handleModuleClick} />;
      case "paths": if (selectedPath) { return <LearningPathViewer path={selectedPath} user={user} onBack={() => setSelectedPath(null)} onLabClick={(lab) => { setSelectedLab(lab); setPage("labs"); }} />; } return <LearningPathsPage user={user} onPathClick={setSelectedPath} />;
      case "labs": if (selectedLab) { return <LabViewer lab={selectedLab} user={user} onBack={() => setSelectedLab(null)} />; } return <LabsPage user={user} onLabClick={setSelectedLab} />;
      case "badges": return <BadgesPage user={user} />;
      case "certs": return <CertificationsPage user={user} onPathClick={(path) => { setSelectedPath(path); setPage("paths"); }} />;
      case "profile": return <ProfilePage user={user} onNavigate={handleNavClick} />;
      case "study": return selectedModule ? <LessonViewer module={selectedModule} user={user} onBack={() => { setSelectedModule(null); setPage("dashboard"); }} onComplete={() => { setSelectedModule(null); setPage("dashboard"); }} /> : <Dashboard user={user} profile={profile} modules={modules} userModules={userModules} userTracks={userTracks} userBadges={userBadges} tracks={tracks} onModuleClick={handleModuleClick} />;
      case "admin": return <AdminDashboard user={user} onSignOut={async () => { await supabase.auth.signOut(); setSession(null); }} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, color: T.text, fontFamily: "'Outfit',sans-serif", overflowX: "hidden", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {isMobile && navOpen && <div onClick={() => setNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }} />}
      {isMobile && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, width: '100vw', height: 56, background: T.surface, borderBottom: '1px solid ' + T.border, zIndex: 60, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 12, boxSizing: 'border-box' }}><button onClick={() => setNavOpen(o => !o)} style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 8, color: T.cyan, fontSize: 20, width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{navOpen ? 'X' : '='}</button><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,' + T.cyan + ',' + T.violet + ')', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: T.bg }}>TS</div><div style={{ fontSize: 15, fontWeight: 800 }}>Tier<span style={{ color: T.cyan }}>Shift</span></div></div></div>}
      <nav style={{ width: 240, background: T.surface, borderRight: "1px solid " + T.border, display: "flex", flexDirection: "column", padding: "18px 0", ...(isMobile ? { position: "fixed", top: 0, left: navOpen ? 0 : -260, height: "100vh", zIndex: 50, transition: "left 0.25s ease", boxShadow: "4px 0 24px rgba(0,0,0,0.5)" } : {}) }}>
        <div style={{ padding: "0 18px 16px", borderBottom: '1px solid ' + T.border, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,' + T.cyan + ',' + T.violet + ')', borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.bg }}>TS</div>
          <div><div style={{ fontSize: 17, fontWeight: 800 }}>Tier<span style={{ color: T.cyan }}>Shift</span></div><div style={{ fontSize: 10, color: T.muted }}>Academy</div></div>
        </div>
        {NAV.map(n => (<button key={n.id} onClick={() => handleNavClick(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "calc(100% - 14px)", padding: "11px 14px", margin: "2px 7px", borderRadius: 8, background: page === n.id ? dim(T.cyan, 0.1) : "transparent", border: "none", color: page === n.id ? T.cyan : T.muted, fontSize: 13, fontWeight: page === n.id ? 700 : 500, cursor: "pointer", textAlign: "left" }}><span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}</button>))}
        <div style={{ flex: 1 }} />
        <button onClick={async () => { await supabase.auth.signOut(); setSession(null); setShowLanding(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "calc(100% - 28px)", padding: "10px 14px", margin: "4px 14px", borderRadius: 8, background: "transparent", border: "1px solid " + T.border, color: T.muted, fontSize: 13, cursor: "pointer" }}><span>X</span> Sign Out</button>
        <div style={{ padding: "14px 18px", borderTop: '1px solid ' + T.border, marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,' + T.cyan + ',' + T.violet + ')', display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: T.bg }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div><div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div></div>
        </div>
      </nav>
      <main style={{ flex: 1, overflowX: "hidden", overflowY: "auto", minWidth: 0, padding: isMobile ? "72px 20px 24px" : "24px 32px" }}><div style={{ maxWidth: 1000, width: "100%" }}>{renderPage()}</div></main>
    </div>
  );
}




// cache-bust 20260530-210006
