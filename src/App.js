function SimpleTracksPage({ modules, tracks, onStudyClick, isMobile }) {
  const [search, setSearch] = useState('');
  const [allModules, setAllModules] = useState([]);
  useEffect(() => {
    supabase.from('modules').select('*').order('sort_order').then(({ data }) => setAllModules(data || []));
  }, []);
  const display = allModules.length > 0 ? allModules : modules;
  const filtered = display.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()) || m.description?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: T.text, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Course Library</h1>
        <p style={{ color: T.muted, fontSize: 15 }}>{display.length} modules across {tracks?.length || 0} tracks</p>
      </div>
      <input type="text" placeholder="Search modules..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: T.card, border: '1px solid ' + T.border, borderRadius: 10, color: T.text, fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div style={{ width: 9, height: 9, borderRadius: '50%', background: T.emerald }} /><span style={{ color: T.sub, fontSize: 13 }}>Lessons available</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><div style={{ width: 9, height: 9, borderRadius: '50%', background: T.muted }} /><span style={{ color: T.sub, fontSize: 13 }}>Coming soon</span></div>
        <span style={{ color: T.dim, fontSize: 13, marginLeft: 'auto' }}>{filtered.length} modules</span>
      </div>
      {filtered.length === 0 ? (<div style={{ background: T.card, padding: 40, borderRadius: 12, textAlign: 'center' }}><p style={{ color: T.muted }}>No modules match your search</p></div>) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map(mod => {
            const available = mod.is_active;
            return (
              <div key={mod.id} onClick={() => available && onStudyClick(mod)} style={{ background: T.card, border: '1px solid ' + T.border, borderRadius: 12, padding: '18px 20px', cursor: available ? 'pointer' : 'default', opacity: available ? 1 : 0.65 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h3 style={{ color: available ? T.text : T.sub, margin: 0, fontSize: 15, fontWeight: 600 }}>{mod.name}</h3>
                  {available ? (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: dim(T.emerald, 0.12), border: '1px solid ' + T.emerald, borderRadius: 20, fontSize: 11, fontWeight: 600, color: T.emerald, flexShrink: 0 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: T.emerald, display: 'inline-block' }} />Lessons available</span>) : (<span style={{ fontSize: 12, color: T.muted }}>Coming soon</span>)}
                </div>
                {mod.description && <p style={{ color: T.muted, margin: '8px 0 0', fontSize: 13, lineHeight: 1.5 }}>{mod.description}</p>}
              </div>
            );
          })}
        </div>
      )}
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
  const [navOpen, setNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); if (s?.user) load(s.user.id); else setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => { setSession(s); if (s?.user) load(s.user.id); else { setProfile(null); setLoading(false); } });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    <div style={{ display: "flex", height: "100vh", background: T.bg, color: T.text, fontFamily: "'Outfit',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {isMobile && navOpen && (<div onClick={() => setNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 40 }} />)}
      <nav style={{ width: 240, background: T.surface, borderRight: '1px solid ' + T.border, display: "flex", flexDirection: "column", padding: "18px 0", ...(isMobile ? { position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50, transform: navOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease' } : {}) }}>
        <div style={{ padding: "0 18px 16px", borderBottom: '1px solid ' + T.border, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,' + T.cyan + ',' + T.violet + ')', borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.bg }}>TS</div>
          <div><div style={{ fontSize: 17, fontWeight: 800 }}>Tier<span style={{ color: T.cyan }}>Shift</span></div><div style={{ fontSize: 10, color: T.muted }}>Academy</div></div>
        </div>
        {NAV.map(n => (<button key={n.id} onClick={() => handleNavClick(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "calc(100% - 14px)", padding: "11px 14px", margin: "2px 7px", borderRadius: 8, background: page === n.id ? dim(T.cyan, 0.1) : "transparent", border: "none", color: page === n.id ? T.cyan : T.muted, fontSize: 13, fontWeight: page === n.id ? 700 : 500, cursor: "pointer", textAlign: "left" }}><span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}</button>))}
        <div style={{ flex: 1 }} />
        <button onClick={async () => { await supabase.auth.signOut(); setSession(null); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "calc(100% - 28px)", padding: "10px 14px", margin: "4px 14px", borderRadius: 8, background: "transparent", border: '1px solid ' + T.border, color: T.muted, fontSize: 13, cursor: "pointer" }}><span>X</span> Sign Out</button>
        <div style={{ padding: "14px 18px", borderTop: '1px solid ' + T.border, marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,' + T.cyan + ',' + T.violet + ')', display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: T.bg }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div><div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div></div>
        </div>
      </nav>
      <main style={{ flex: 1, overflow: "auto", padding: isMobile ? '16px' : '24px 32px' }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid ' + T.border }}>
            <button onClick={() => setNavOpen(true)} style={{ background: 'transparent', border: 'none', color: T.text, fontSize: 22, cursor: 'pointer', padding: '4px 6px', lineHeight: 1 }}>{String.fromCharCode(9776)}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,' + T.cyan + ',' + T.violet + ')', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: T.bg }}>TS</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>Tier<span style={{ color: T.cyan }}>Shift</span></div>
            </div>
          </div>
        )}
        <div style={{ maxWidth: 1000 }}>{renderPage()}</div>
      </main>
    </div>
  );
}