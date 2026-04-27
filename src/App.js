import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { LabsPage, LabViewer } from "./Labs";
import { BadgesPage } from "./Badges";
import { LearningPathsPage, LearningPathViewer } from "./LearningPaths";
import { ProfilePage } from "./Profile";
import { CertificationsPage } from "./Certifications";
import HomePage from "./pages/HomePage";

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
  <div style={{padding:"20px",background:T.card,border:"1px solid "+T.border,borderRadius:12,flex:1,minWidth:140}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <span style={{fontSize:18,color}}>{icon}</span>
      <span style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>{label}</span>
    </div>
    <div style={{fontSize:28,fontWeight:800,color,fontFamily:"'JetBrains Mono',monospace"}}>{value}</div>
    {sub&&<div style={{fontSize:12,color:T.muted,marginTop:4}}>{sub}</div>}
  </div>
);

function AuthPage({ onAuth }) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, '+T.cyan+', '+T.violet+')', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: T.bg }}>TS</div>
          <div><div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>Tier<span style={{ color: T.cyan }}>Shift</span></div><div style={{ fontSize: 11, color: T.muted }}>Academy</div></div>
        </div>
        <h2 style={{ color: T.text, marginBottom: 8, fontSize: 24, fontWeight: 700, textAlign: 'center' }}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        {error && <div style={{ color: T.danger, marginBottom: 16, padding: 12, background: dim(T.danger, 0.1), borderRadius: 8, fontSize: 13 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}><label style={{ display: 'block', color: T.sub, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 12, background: T.surface, border: '1px solid '+T.border, borderRadius: 8, color: T.text, fontSize: 14, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 24 }}><label style={{ display: 'block', color: T.sub, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 12, background: T.surface, border: '1px solid '+T.border, borderRadius: 8, color: T.text, fontSize: 14, boxSizing: 'border-box' }} /></div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, '+T.cyan+', '+T.violet+')', color: T.bg, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}</button>
        </form>
        <p style={{ marginTop: 20, color: T.muted, fontSize: 13, textAlign: 'center' }}>{isSignUp ? 'Have an account?' : "No account?"} <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: T.cyan, cursor: 'pointer' }}>{isSignUp ? 'Sign In' : 'Sign Up'}</span></p>
      </div>
    </div>
  );
}

function Dashboard({ user, profile, modules, userModules, userTracks, userBadges, tracks, onModuleClick }) {
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
        <h1 style={{color:T.text,fontSize:28,fontWeight:800,marginBottom:4}}>Welcome back, {name}!</h1>
        <p style={{color:T.muted,fontSize:15}}>Continue your IT career journey</p>
      </div>
      <div style={{display:"flex",gap:16,marginBottom:32,flexWrap:"wrap"}}>
        <StatCard icon="M" value={completedModules} label="Modules" color={T.cyan} sub={modules?.length ? "of "+modules.length+" total" : null}/>
        <StatCard icon="H" value={totalHours.toFixed(1)} label="Hours" color={T.violet} sub="studied"/>
        <StatCard icon="*" value={streak} label="Day Streak" color={T.amber} sub="keep it up!"/>
        <StatCard icon="+" value={badgeCount} label="Badges" color={T.emerald} sub="earned"/>
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
            {modules?.slice(0, 3).map(mod => (<div key={mod.id} onClick={() => onModuleClick(mod)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:16,background:T.surface,border:"1px solid "+T.border,borderRadius:8,cursor:"pointer"}}><div style={{color:T.text,fontWeight:600}}>{mod.name}</div><span style={{color:T.cyan,fontSize:13}}>Start ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢</span></div>))}
          </div>
        )}
      </div>
    </div>
  );
}

function SimpleTracksPage({ modules, onStudyClick }) {
  return (
    <div>
      <h1 style={{ color: T.text, fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Career Tracks</h1>
      <p style={{ color: T.muted, marginBottom: 32 }}>Choose a module to begin</p>
      {modules.length === 0 ? <div style={{ background: T.card, padding: 40, borderRadius: 12, textAlign: 'center' }}><div style={{ fontSize: 48 }}>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â¡</div><h3 style={{ color: T.text }}>No Modules Available</h3></div> : (
        <div style={{ display: 'grid', gap: 16 }}>
          {modules.map(mod => (
            <div key={mod.id} style={{ background: T.card, padding: 24, borderRadius: 12, border: '1px solid '+T.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h3 style={{ color: T.text, margin: 0 }}>{mod.name}</h3><p style={{ color: T.muted, margin: '8px 0 0', fontSize: 14 }}>{mod.description || 'Start learning'}</p></div>
              <button onClick={() => onStudyClick(mod)} style={{ padding: '10px 20px', background: T.cyan, color: T.bg, border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Study</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LessonsViewer({ moduleId, onComplete, user }) {
  const [lessons, setLessons] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('lessons').select('*').eq('module_id', moduleId).order('lesson_number').then(({ data }) => { setLessons(data || []); setLoading(false); }); }, [moduleId]);
  const lesson = lessons[idx];
  if (loading) return <div style={{color:T.muted}}>Loading...</div>;
  if (!lesson) return <div style={{color:T.muted}}>No lessons available for this module yet.</div>;
  return (
    <div style={{display:'flex',gap:24}}>
      <div style={{width:220,background:T.surface,borderRadius:12,padding:16}}>{lessons.map((l,i) => <div key={l.id} onClick={()=>setIdx(i)} style={{padding:10,borderRadius:8,cursor:'pointer',background:i===idx?dim(T.cyan,0.1):'transparent',color:i===idx?T.cyan:T.muted,fontSize:13,marginBottom:4}}>{l.lesson_number}. {l.title}</div>)}</div>
      <div style={{flex:1}}><h2 style={{color:T.text}}>{lesson.title}</h2><div style={{color:T.text,marginTop:16,lineHeight:1.7}} dangerouslySetInnerHTML={{__html:lesson.content}}/><div style={{marginTop:24,display:'flex',justifyContent:'space-between'}}><button onClick={()=>setIdx(Math.max(0,idx-1))} disabled={idx===0} style={{padding:'10px 20px',background:T.surface,color:T.text,border:'1px solid '+T.border,borderRadius:8,cursor:'pointer',opacity:idx===0?0.5:1}}>Previous</button><button onClick={()=>{if(idx<lessons.length-1)setIdx(idx+1);else onComplete?.();}} style={{padding:'10px 20px',background:T.cyan,color:T.bg,border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{idx===lessons.length-1?'Complete':'Next'}</button></div></div>
    </div>
  );
}

function QuizViewer({ moduleId, user, onComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchQuiz = async () => {
      const { data: quizData } = await supabase.from('quizzes').select('*').eq('module_id', moduleId).single();
      if (quizData) { setQuiz(quizData); const { data: questionsData } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quizData.id).order('question_number'); setQuestions(questionsData || []); }
      setLoading(false);
    };
    fetchQuiz();
  }, [moduleId]);
  const handleSubmit = () => { const correct = questions.filter(q => answers[q.id] === q.correct_answer).length; const pct = Math.round((correct / questions.length) * 100); setResults({ score: correct, total: questions.length, pct, passed: pct >= (quiz?.passing_score || 70) }); setSubmitted(true); };
  if (loading) return <div style={{color:T.muted}}>Loading quiz...</div>;
  if (!quiz || questions.length === 0) return <div style={{color:T.muted}}>No quiz available for this module yet.</div>;
  if (submitted && results) { return (<div style={{textAlign:'center',padding:40}}><div style={{fontSize:64,marginBottom:16}}>{results.passed ? 'ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â°' : 'ÃƒÂ°Ã…Â¸Ã‹Å“Ã¢â‚¬Â¦'}</div><h2 style={{color:results.passed?T.success:T.danger}}>{results.passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2><div style={{fontSize:48,fontWeight:900,color:results.passed?T.success:T.danger,margin:'16px 0'}}>{results.pct}%</div><p style={{color:T.muted}}>{results.score} of {results.total} correct (need {quiz.passing_score}% to pass)</p><button onClick={onComplete} style={{marginTop:24,padding:'12px 24px',background:T.cyan,color:T.bg,border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{results.passed ? 'Continue' : 'Try Again'}</button></div>); }
  const q = questions[currentIdx];
  const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
  return (
    <div>
      <div style={{marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center'}}><h3 style={{color:T.text,margin:0}}>{quiz.title}</h3><span style={{color:T.muted}}>Question {currentIdx+1} of {questions.length}</span></div>
      <div style={{background:T.surface,borderRadius:12,padding:24,marginBottom:24}}><h3 style={{color:T.text,marginBottom:20}}>{q.question_text}</h3>{opts && opts.map(opt => (<label key={opt.id} style={{display:'block',padding:'12px 16px',background:answers[q.id]===opt.id?dim(T.cyan,0.15):T.card,border:answers[q.id]===opt.id?'1px solid '+T.cyan:'1px solid '+T.border,borderRadius:8,marginBottom:8,cursor:'pointer',color:T.text}}><input type="radio" name="answer" checked={answers[q.id]===opt.id} onChange={()=>setAnswers({...answers,[q.id]:opt.id})} style={{marginRight:12}}/>{opt.text}</label>))}</div>
      <div style={{display:'flex',justifyContent:'space-between'}}><button onClick={()=>setCurrentIdx(Math.max(0,currentIdx-1))} disabled={currentIdx===0} style={{padding:'10px 20px',background:T.surface,color:T.text,border:'1px solid '+T.border,borderRadius:8,cursor:'pointer',opacity:currentIdx===0?0.5:1}}>Previous</button>{currentIdx===questions.length-1 ? (<button onClick={handleSubmit} disabled={Object.keys(answers).length<questions.length} style={{padding:'10px 20px',background:T.cyan,color:T.bg,border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Submit Quiz</button>) : (<button onClick={()=>setCurrentIdx(currentIdx+1)} style={{padding:'10px 20px',background:T.cyan,color:T.bg,border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Next</button>)}</div>
    </div>
  );
}

function CourseResources({ moduleId }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('course_resources').select('*').eq('module_id', moduleId).then(({ data }) => { setResources(data || []); setLoading(false); }); }, [moduleId]);
  const getIcon = (type) => { switch(type) { case 'video': return 'ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¬'; case 'pdf': return 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Å¾'; case 'article': return 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â°'; case 'link': return 'ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬â€'; case 'code': return 'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â»'; default: return 'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â'; } };
  if (loading) return <div style={{color:T.muted}}>Loading resources...</div>;
  if (resources.length === 0) return <div style={{color:T.muted}}>No resources available for this module yet.</div>;
  return (<div><h3 style={{color:T.text,marginBottom:16}}>Additional Resources</h3><div style={{display:'grid',gap:12}}>{resources.map(r => (<a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:16,padding:16,background:T.card,border:'1px solid '+T.border,borderRadius:8,textDecoration:'none'}}><span style={{fontSize:24}}>{getIcon(r.resource_type)}</span><div style={{flex:1}}><h4 style={{color:T.text,margin:0}}>{r.title}</h4><p style={{color:T.muted,margin:'4px 0 0',fontSize:13}}>{r.description}</p></div><span style={{color:T.sub,fontSize:11,textTransform:'uppercase'}}>{r.resource_type}</span></a>))}</div></div>);
}

function ModuleStudyPage({ moduleId, user, onBack }) {
  const [mod, setMod] = useState(null);
  const [tab, setTab] = useState('lessons');
  useEffect(() => { supabase.from('modules').select('*').eq('id', moduleId).single().then(({ data }) => setMod(data)); }, [moduleId]);
  if (!mod) return <div style={{color:T.muted}}>Loading...</div>;
  return (
    <div>
      <button onClick={onBack} style={{background:'transparent',border:'none',color:T.cyan,cursor:'pointer',marginBottom:16,fontSize:14}}>ÃƒÂ¢Ã¢â‚¬Â Ã‚Â Back to Modules</button>
      <h1 style={{color:T.text,marginBottom:8}}>{mod.name}</h1>
      <p style={{color:T.muted,marginBottom:24}}>{mod.description}</p>
      <div style={{display:'flex',gap:8,marginBottom:24}}>{['lessons','quiz','resources'].map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'10px 20px',background:tab===t?dim(T.cyan,0.1):'transparent',border:'1px solid '+(tab===t?T.cyan:T.border),borderRadius:8,color:tab===t?T.cyan:T.muted,cursor:'pointer',textTransform:'capitalize',fontWeight:tab===t?600:400}}>{t}</button>)}</div>
      {tab==='lessons'&&<LessonsViewer moduleId={moduleId} user={user} onComplete={()=>setTab('quiz')}/>}
      {tab==='quiz'&&<QuizViewer moduleId={moduleId} user={user} onComplete={onBack}/>}
      {tab==='resources'&&<CourseResources moduleId={moduleId}/>}
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
  { id: "profile", label: "Profile", icon: "U" },
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

  const handleModuleClick = (mod) => { setSelectedModule(mod); setPage("study"); };
  const handleNavClick = (navId) => { setPage(navId); setSelectedModule(null); setSelectedLab(null); setSelectedPath(null); };

  if (showLanding) return <HomePage onGetStarted={() => setShowLanding(false)} onSignIn={() => setShowLanding(false)} />;
  if (showLanding) return <HomePage onGetStarted={dismissLanding} onSignIn={dismissLanding} />;
  if (loading) return <div style={{ height: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.cyan }}>Loading...</div>;
  if (!session) {
    if (showLanding) return <HomePage onGetStarted={() => setShowLanding(false)} onSignIn={() => setShowLanding(false)} />;
    return <AuthPage onAuth={(u) => { setSession({ user: u }); load(u.id); }} />;
  }

  const user = session.user;
  const name = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard user={user} profile={profile} modules={modules} userModules={userModules} userTracks={userTracks} userBadges={userBadges} tracks={tracks} onModuleClick={handleModuleClick} />;
      case "tracks": return <SimpleTracksPage modules={modules} onStudyClick={handleModuleClick} />;
      case "study": return selectedModule ? <ModuleStudyPage moduleId={selectedModule.id} user={user} onBack={() => { setSelectedModule(null); setPage("tracks"); }} /> : <div>Loading...</div>;
      case "paths": if (selectedPath) { return <LearningPathViewer path={selectedPath} user={user} onBack={() => setSelectedPath(null)} onLabClick={(lab) => { setSelectedLab(lab); setPage("labs"); }} />; } return <LearningPathsPage user={user} onPathClick={setSelectedPath} />;
      case "labs": if (selectedLab) { return <LabViewer lab={selectedLab} user={user} onBack={() => setSelectedLab(null)} />; } return <LabsPage user={user} onLabClick={setSelectedLab} />;
      case "badges": return <BadgesPage user={user} />;
      case "certs": return <CertificationsPage user={user} onPathClick={(path) => { setSelectedPath(path); setPage("paths"); }} />;
      case "profile": return <ProfilePage user={user} onNavigate={handleNavClick} />;
      default: return <Dashboard user={user} profile={profile} modules={modules} userModules={userModules} userTracks={userTracks} userBadges={userBadges} tracks={tracks} onModuleClick={handleModuleClick} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, color: T.text, fontFamily: "'Outfit',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <nav style={{ width: 240, background: T.surface, borderRight: '1px solid ' + T.border, display: "flex", flexDirection: "column", padding: "18px 0" }}>
        <div style={{ padding: "0 18px 16px", borderBottom: '1px solid ' + T.border, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,' + T.cyan + ',' + T.violet + ')', borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.bg }}>TS</div>
          <div><div style={{ fontSize: 17, fontWeight: 800 }}>Tier<span style={{ color: T.cyan }}>Shift</span></div><div style={{ fontSize: 10, color: T.muted }}>Academy</div></div>
        </div>
        {NAV.map(n => (<button key={n.id} onClick={() => handleNavClick(n.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "calc(100% - 14px)", padding: "11px 14px", margin: "2px 7px", borderRadius: 8, background: page === n.id ? dim(T.cyan, 0.1) : "transparent", border: "none", color: page === n.id ? T.cyan : T.muted, fontSize: 13, fontWeight: page === n.id ? 700 : 500, cursor: "pointer", textAlign: "left" }}><span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}</button>))}
        <div style={{ flex: 1 }} />
        <button onClick={async () => { await supabase.auth.signOut(); setSession(null); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "calc(100% - 28px)", padding: "10px 14px", margin: "4px 14px", borderRadius: 8, background: "transparent", border: "1px solid " + T.border, color: T.muted, fontSize: 13, cursor: "pointer" }}><span>X</span> Sign Out</button>
        <div style={{ padding: "14px 18px", borderTop: '1px solid ' + T.border, marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,' + T.cyan + ',' + T.violet + ')', display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: T.bg }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div><div style={{ fontSize: 11, color: T.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div></div>
        </div>
      </nav>
      <main style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}><div style={{ maxWidth: 1000 }}>{renderPage()}</div></main>
    </div>
  );
}

