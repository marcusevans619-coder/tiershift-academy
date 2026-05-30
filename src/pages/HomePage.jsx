import { useState, useEffect, useRef } from "react";
import DemoRequestModal from "../DemoRequestModal";

const C = {
  bg:"#060a12",surface:"#0d1520",card:"#111827",border:"#1e2d40",
  cyan:"#00e5ff",violet:"#a78bfa",emerald:"#34d399",amber:"#fbbf24",
  rose:"#fb7185",sky:"#38bdf8",text:"#e8edf5",sub:"#94a3b8",muted:"#64748b",
};

const testimonials = [
  {quote:"We onboarded 4 new Tier 1 techs in half the usual time. Structured tracks meant they knew exactly what to learn and in what order.",name:"Sarah M.",role:"IT Manager",company:"Regional MSP, 45 techs",initials:"SM",color:"#00e5ff"},
  {quote:"My team actually wants to do the training. The hands-on labs are way more engaging than sitting through PowerPoints or watching videos.",name:"James R.",role:"Help Desk Supervisor",company:"Healthcare IT Department",initials:"JR",color:"#a78bfa"},
  {quote:"I went from Tier 1 to a Tier 2 role in 4 months. The learning path was clear and the certs gave me something concrete to show in my review.",name:"Alex K.",role:"IT Support Specialist",company:"Enterprise Corp",initials:"AK",color:"#34d399"},
  {quote:"The progress dashboard is exactly what I needed. I can see at a glance who has completed what and who needs a push. No more guessing on skill levels.",name:"Lisa T.",role:"Training Coordinator",company:"Managed Service Provider",initials:"LT",color:"#fbbf24"},
];

const roiStats = [
  {value:"47%",label:"Faster Onboarding",desc:"New hires reach productivity in weeks, not months"},
  {value:"3x",label:"More Engagement",desc:"vs traditional video-based training platforms"},
  {value:"89%",label:"Cert Pass Rate",desc:"First attempt across all TierShift certification exams"},
  {value:"60%",label:"Less Escalations",desc:"Teams report fewer Tier 1 issues escalating after training"},
];

const teamFeatures = [
  {icon:"\uD83D\uDCCB", title:"Assign Learning Paths", desc:"Push specific tracks to individual techs or your entire team. New hire? Assign Tier 1 to Tier 2 on day one.", color:"#00e5ff"},
  {icon:"\uD83D\uDCCA", title:"Real-Time Progress Dashboard", desc:"See exactly where every tech is - hours logged, labs completed, certs earned. No more chasing people for updates.", color:"#a78bfa"},
  {icon:"\uD83D\uDD0D", title:"Skill Gap Analysis", desc:"Identify which techs need what training before problems surface. Get ahead of knowledge gaps proactively.", color:"#34d399"},
  {icon:"\uD83C\uDFC6", title:"Team Leaderboards", desc:"Friendly competition drives completion. See who is leading on certifications and lab completions.", color:"#fbbf24"},
  {icon:"\uD83D\uDCC4", title:"Completion Reports", desc:"Export certification reports for HR reviews, compliance audits, or client-facing proof of team competency.", color:"#fb7185"},
  {icon:"\uD83D\uDD27", title:"Custom Content", desc:"Work with us to build tracks specific to your tools, ticketing system, and internal processes.", color:"#38bdf8"},
];

const comparisonData = [
  {feature:"Hands-on labs (not just videos)",ts:true,youtube:false,cbt:false},
  {feature:"IT-specific career tracks",ts:true,youtube:false,cbt:true},
  {feature:"Auto-graded certification exams",ts:true,youtube:false,cbt:true},
  {feature:"Manager progress dashboard",ts:true,youtube:false,cbt:false},
  {feature:"Assign tracks to team members",ts:true,youtube:false,cbt:false},
  {feature:"Terminal simulator labs",ts:true,youtube:false,cbt:false},
  {feature:"Completion reports and exports",ts:true,youtube:false,cbt:false},
  {feature:"Built for IT support teams",ts:true,youtube:false,cbt:false},
];

const faqs = [
  {q:"Can managers assign specific tracks to their techs?",a:"Yes. The team admin dashboard lets you assign any learning path to individual team members or your entire team at once. New hires get a structured path from day one."},
  {q:"How do we know if techs are actually learning?",a:"Every lab is hands-on and auto-graded. Certification exams are timed and scored automatically. The manager dashboard shows hours logged, labs completed, and certs earned per person in real time."},
  {q:"Is this better than CBT Nuggets or Udemy for Business?",a:"TierShift is built specifically for IT support teams, not general learners. Labs mirror real helpdesk scenarios -  ticket systems, terminal commands, network configs - not generic tech content."},
  {q:"How long does a certification track take to complete?",a:"It depends on the track. Tier 1 to Tier 2 is roughly 136 hours of content. Most techs complete it in 6-8 weeks training part-time alongside their regular work."},
  {q:"Can you build custom content for our specific tools?",a:"Yes. We work with IT managers to build tracks tailored to your specific ticketing system, internal tools, and escalation procedures. Contact us to discuss."},
  {q:"How is this different from just sending techs to CompTIA courses?",a:"CompTIA teaches theory. TierShift teaches application. Your techs practice real scenarios in labs, not just memorize answers for a multiple choice test."},
];

const terminalLines = [
  {text:"$ ping 192.168.1.1",color:"#00e5ff"},
  {text:"64 bytes from 192.168.1.1: time=1.2ms",color:"#34d399"},
  {text:"$ nmap -sV 192.168.1.0/24",color:"#00e5ff"},
  {text:"Starting Nmap 7.94...",color:"#e8edf5"},
  {text:"22/tcp open  ssh     OpenSSH 8.9",color:"#34d399"},
  {text:"80/tcp open  http    Apache 2.4.52",color:"#34d399"},
  {text:"$ systemctl status apache2",color:"#00e5ff"},
  {text:"apache2.service - ACTIVE (running)",color:"#34d399"},
  {text:"Lab complete! +250 XP earned",color:"#fbbf24"},
];
function useCountUp(target, duration, start) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const num = parseInt(target.replace(/\D/g,""));
    const step = num / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [start]);
  return count + target.replace(/[\d]/g,"");
}

function StatCounter({value, label, desc, started}) {
  const display = useCountUp(value, 1800, started);
  return (
    <div style={{textAlign:"center",padding:"28px 20px",background:"#111827",border:"1px solid #1e2d40",borderRadius:14}}>
      <div style={{fontSize:44,fontWeight:900,color:"#00e5ff",fontFamily:"monospace",lineHeight:1,marginBottom:8}}>{started?display:"0"}</div>
      <div style={{fontSize:15,fontWeight:700,color:"#e8edf5",marginBottom:6}}>{label}</div>
      <div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{desc}</div>
    </div>
  );
}

function FAQItem({q, a}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{border:`1px solid ${open?"#00e5ff40":"#1e2d40"}`,borderRadius:12,overflow:"hidden",transition:"all 0.3s",background:open?"#00e5ff05":"#111827"}}>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",padding:"16px 20px",background:"transparent",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",textAlign:"left"}}>
        <span style={{fontSize:14,fontWeight:600,color:"#e8edf5"}}>{q}</span>
        <span style={{fontSize:20,color:"#00e5ff",transform:open?"rotate(45deg)":"rotate(0)",transition:"transform 0.3s",flexShrink:0,marginLeft:16}}>+</span>
      </button>
      {open&&<div style={{padding:"0 20px 16px",fontSize:13,color:"#94a3b8",lineHeight:1.75}}>{a}</div>}
    </div>
  );
}
export default function HomePage({onGetStarted, onSignIn}) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [statsStarted, setStatsStarted] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeTab, setActiveTab] = useState("teams");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => { const r = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  const statsRef = useRef(null);

  useEffect(()=>{
    const t=setInterval(()=>setVisibleLines(v=>v<terminalLines.length?v+1:v),380);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    const h=()=>setScrollY(window.scrollY);
    window.addEventListener("scroll",h);
    return ()=>window.removeEventListener("scroll",h);
  },[]);

  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setStatsStarted(true);},{threshold:0.3});
    if(statsRef.current)obs.observe(statsRef.current);
    return ()=>obs.disconnect();
  },[]);

  return (
    <div style={{backgroundColor:"#060a12",color:"#e8edf5",fontFamily:"Outfit,sans-serif",minHeight:"100vh",overflowX:"hidden"}}>
      {showDemoModal && <DemoRequestModal onClose={()=>setShowDemoModal(false)} />}
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .fadeUp{animation:fadeUp .7s ease forwards}
        .bp:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,229,255,.35)}
        .bs:hover{transform:translateY(-2px);border-color:#00e5ff60!important;color:#00e5ff!important}
        .ch:hover{transform:translateY(-4px);border-color:#00e5ff30!important;box-shadow:0 12px 40px rgba(0,0,0,.4)}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0d1520}::-webkit-scrollbar-thumb{background:#1e2d40;border-radius:3px}
      `}</style>

      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:isMobile?"12px 16px":"14px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",background:scrollY>40?"rgba(6,10,18,.96)":"transparent",backdropFilter:scrollY>40?"blur(20px)":"none",borderBottom:scrollY>40?"1px solid #1e2d40":"none",transition:"all .3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,#00e5ff,#a78bfa)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#060a12"}}>TS</div>
          <div><div style={{fontSize:17,fontWeight:800}}>Tier<span style={{color:"#00e5ff"}}>Shift</span></div><div style={{fontSize:10,color:"#64748b"}}>Academy</div></div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={onSignIn} className="bs" style={{padding:"8px 18px",background:"transparent",border:"1px solid #1e2d40",borderRadius:8,color:"#94a3b8",fontSize:14,cursor:"pointer",transition:"all .2s"}}>Sign In</button>
          <button onClick={()=>setShowDemoModal(true)} className="bs" style={{padding:"8px 18px",background:"transparent",border:"1px solid #00e5ff60",borderRadius:8,color:"#00e5ff",fontSize:14,cursor:"pointer",transition:"all .2s"}}>Request Demo</button>
          {!isMobile && <button onClick={()=>setShowDemoModal(true)} className="bp" style={{padding:"8px 18px",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",border:"none",borderRadius:8,color:"#060a12",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>Get Started</button>}
        </div>
      </nav>

      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",padding:isMobile?"90px 20px 50px":"110px 48px 80px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(#1e2d4033 1px,transparent 1px),linear-gradient(90deg,#1e2d4033 1px,transparent 1px)",backgroundSize:"60px 60px",opacity:.4}}/>
        <div style={{position:"absolute",top:"15%",right:"5%",width:500,height:500,background:"radial-gradient(circle,#a78bfa12 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:"10%",left:"5%",width:400,height:400,background:"radial-gradient(circle,#00e5ff10 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1200,margin:"0 auto",width:"100%",display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:isMobile?32:72,alignItems:"center"}}>
          <div className="fadeUp">
            <div style={{display:"flex",gap:8,marginBottom:28}}>
              <button onClick={()=>setActiveTab("teams")} style={{padding:"6px 14px",background:activeTab==="teams"?"#00e5ff20":"transparent",border:`1px solid ${activeTab==="teams"?"#00e5ff60":"#1e2d40"}`,borderRadius:20,fontSize:12,color:activeTab==="teams"?"#00e5ff":"#64748b",cursor:"pointer",fontWeight:600,transition:"all .2s"}}>For IT Managers</button>
              <button onClick={()=>setActiveTab("learners")} style={{padding:"6px 14px",background:activeTab==="learners"?"#a78bfa20":"transparent",border:`1px solid ${activeTab==="learners"?"#a78bfa60":"#1e2d40"}`,borderRadius:20,fontSize:12,color:activeTab==="learners"?"#a78bfa":"#64748b",cursor:"pointer",fontWeight:600,transition:"all .2s"}}>For IT Professionals</button>
            </div>
            {activeTab==="teams"?(
              <div>
                <h1 style={{fontSize:"clamp(2.2rem,4.5vw,3.5rem)",fontWeight:900,lineHeight:1.1,margin:"0 0 20px"}}>Train Your IT Team<br/><span style={{background:"linear-gradient(135deg,#00e5ff,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>on Real Skills</span></h1>
                <p style={{fontSize:16,color:"#94a3b8",lineHeight:1.75,marginBottom:20,maxWidth:480}}>Assign tracks, track progress, and certify your techs - all from one dashboard. Built for IT managers who need results, not just completion percentages.</p>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:32}}>
                  {["Assign learning paths to specific techs or your whole team","Real-time progress dashboard - see who needs a push","Auto-graded labs and certification exams","Exportable completion reports for HR and compliance"].map((item,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#94a3b8"}}><span style={{color:"#34d399"}}>{'\u2713'}</span>{item}</div>))}
                </div>
              </div>
            ):(
              <div>
                <h1 style={{fontSize:"clamp(2.2rem,4.5vw,3.5rem)",fontWeight:900,lineHeight:1.1,margin:"0 0 20px"}}>Level Up Your<br/><span style={{background:"linear-gradient(135deg,#00e5ff,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>IT Career</span></h1>
                <p style={{fontSize:16,color:"#94a3b8",lineHeight:1.75,marginBottom:20,maxWidth:480}}>Hands-on labs, certification exams, and career tracks built for IT support professionals ready to level up. No fluff -  just real skills.</p>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:32}}>
                  {["60+ hands-on terminal, ticket, and config labs","9 career tracks from Tier 1 to Security Engineer","8 certification exams with downloadable credentials","Track your progress with a real-time dashboard"].map((item,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:13,color:"#94a3b8"}}><span style={{color:"#34d399"}}>{'\u2713'}</span>{item}</div>))}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button onClick={()=>setShowDemoModal(true)} className="bp" style={{padding:"13px 28px",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",border:"none",borderRadius:10,color:"#060a12",fontSize:15,fontWeight:800,cursor:"pointer",transition:"all .2s"}}>{activeTab==="teams"?"Schedule a Demo >":"Start Free Today >"}</button>
              <button onClick={onSignIn} className="bs" style={{padding:"13px 22px",background:"transparent",border:"1px solid #1e2d40",borderRadius:10,color:"#e8edf5",fontSize:15,cursor:"pointer",transition:"all .2s"}}>Sign In</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14,marginTop:28}}>
              <div style={{display:"flex"}}>{["SM","JR","AK","LT"].map((x,i)=>(<div key={i} style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",border:"2px solid #060a12",marginLeft:i>0?-8:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#060a12"}}>{x}</div>))}</div>
              <span style={{fontSize:12,color:"#64748b"}}>Trusted by <strong style={{color:"#e8edf5"}}>IT teams</strong> across MSPs and enterprises</span>
            </div>
          </div>
          {!isMobile && <div style={{animation:"float 4s ease-in-out infinite", display: isMobile ? "none" : "block"}}>
            <div style={{background:"#111827",border:"1px solid #1e2d40",borderRadius:16,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.6),0 0 40px #00e5ff15"}}>
              <div style={{padding:"10px 14px",background:"#0d1520",borderBottom:"1px solid #1e2d40",display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:11,height:11,borderRadius:"50%",background:"#ef4444"}}/><div style={{width:11,height:11,borderRadius:"50%",background:"#fbbf24"}}/><div style={{width:11,height:11,borderRadius:"50%",background:"#34d399"}}/>
                <span style={{marginLeft:8,fontSize:11,color:"#64748b",fontFamily:"monospace"}}>lab-terminal - Network Fundamentals</span>
              </div>
              <div style={{padding:16,fontFamily:"monospace",fontSize:12,lineHeight:1.9,minHeight:220}}>
                {terminalLines.slice(0,visibleLines).map((l,i)=>(<div key={i} style={{color:l.color}}>{l.text}</div>))}
                <span style={{display:"inline-block",width:7,height:14,background:"#00e5ff",animation:"pulse 1s infinite",verticalAlign:"middle"}}/>
              </div>
              <div style={{padding:"10px 16px",borderTop:"1px solid #1e2d40",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:11,color:"#64748b",fontFamily:"monospace"}}>Progress</span>
                <div style={{flex:1,height:4,background:"#1e2d40",borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:`${(visibleLines/terminalLines.length)*100}%`,height:"100%",background:"linear-gradient(90deg,#00e5ff,#a78bfa)",transition:"width .4s"}}/>
                </div>
                <span style={{fontSize:11,color:"#00e5ff",fontFamily:"monospace"}}>{Math.round((visibleLines/terminalLines.length)*100)}%</span>
              </div>
              <div style={{margin:"0 16px 16px",padding:"12px 14px",background:"#34d39910",border:"1px solid #34d39930",borderRadius:10}}>
                <div style={{fontSize:11,color:"#34d399",fontWeight:700,marginBottom:6,fontFamily:"monospace"}}>MANAGER VIEW - LIVE</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[{l:"Completed",v:"14/18"},{l:"Avg Score",v:"87%"},{l:"Certs Earned",v:"6"}].map((s,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:"#34d399",fontFamily:"monospace"}}>{s.v}</div><div style={{fontSize:10,color:"#64748b"}}>{s.l}</div></div>))}
                </div>
              </div>
            </div>
          </div>}
        </div>
      </section>

      <section ref={statsRef} style={{padding:isMobile?"40px 20px":"60px 48px",borderTop:"1px solid #1e2d40",borderBottom:"1px solid #1e2d40",background:"#0d1520"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <div style={{fontSize:11,color:"#00e5ff",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10,fontFamily:"monospace"}}>Proven Results</div>
            <h2 style={{fontSize:"clamp(1.5rem,3vw,2rem)",fontWeight:800,margin:0}}>What IT Teams See After Implementing TierShift</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:16}}>
            {roiStats.map((s,i)=>(<StatCounter key={i} {...s} started={statsStarted}/>))}
          </div>}
        </div>
      </section>

      <section style={{padding:isMobile?"40px 20px":"80px 48px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <div style={{fontSize:11,color:"#a78bfa",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontFamily:"monospace"}}>For IT Managers</div>
            <h2 style={{fontSize:"clamp(1.75rem,3.5vw,2.5rem)",fontWeight:800,margin:"0 0 12px"}}>Everything You Need to Run a High-Performing IT Team</h2>
            <p style={{fontSize:15,color:"#94a3b8",maxWidth:540,margin:"0 auto"}}>Stop guessing who knows what. TierShift gives you visibility, structure, and proof that your team is actually learning.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(3,1fr)",gap:18}}>
            {teamFeatures.map((f,i)=>(
              <div key={i} className="ch" style={{padding:22,background:"#111827",border:"1px solid #1e2d40",borderRadius:14,transition:"all .25s",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,background:`radial-gradient(circle,${f.color}10,transparent 70%)`}}/>
                <div style={{width:42,height:42,background:`${f.color}15`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,marginBottom:12}}>{f.icon}</div>
                <h3 style={{fontSize:14,fontWeight:700,marginBottom:7,color:"#e8edf5"}}>{f.title}</h3>
                <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.65,margin:0}}>{f.desc}</p>
              </div>
            ))}
          </div>}
        </div>
      </section>

      <section style={{padding:isMobile?"40px 20px":"80px 48px",background:"#0d1520"}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <div style={{fontSize:11,color:"#00e5ff",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontFamily:"monospace"}}>The Workflow</div>
            <h2 style={{fontSize:"clamp(1.75rem,3.5vw,2.25rem)",fontWeight:800,margin:0}}>How Your Team Uses TierShift</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:24,position:"relative"}}>
            <div style={{position:"absolute",top:24,left:"12.5%",right:"12.5%",height:1,background:"linear-gradient(90deg,#00e5ff40,#a78bfa40)",zIndex:0}}/>
            {[
              {step:"01",icon:"??",title:"Admin Setup",role:"You (Manager)",desc:"Create your team, invite techs, assign the right learning paths to each person."},
              {step:"02",icon:"???",title:"Techs Train",role:"Your Team",desc:"Each tech works through labs, scenarios, and exams at their own pace."},
              {step:"03",icon:"??",title:"You Monitor",role:"You (Manager)",desc:"Watch progress in real time. See who is ahead, who is falling behind, and intervene early."},
              {step:"04",icon:"??",title:"Certs Earned",role:"Everyone Wins",desc:"Techs earn verified credentials. You get a more capable team."},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center",position:"relative",zIndex:1}}>
                <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#060a12",margin:"0 auto 14px",fontFamily:"monospace"}}>{s.step}</div>
                <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:3}}>{s.title}</div>
                <div style={{fontSize:10,color:"#00e5ff",fontWeight:600,fontFamily:"monospace",marginBottom:6,textTransform:"uppercase"}}>{s.role}</div>
                <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{s.desc}</div>
              </div>
            ))}
          </div>}
        </div>
      </section>

      <section style={{padding:isMobile?"40px 20px":"80px 48px"}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{fontSize:11,color:"#00e5ff",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontFamily:"monospace"}}>Why TierShift</div>
            <h2 style={{fontSize:"clamp(1.75rem,3.5vw,2.25rem)",fontWeight:800,margin:"0 0 12px"}}>Not All Training is Created Equal</h2>
            <p style={{fontSize:14,color:"#94a3b8"}}>See how TierShift compares to the alternatives your team might already be using.</p>
          </div>
          <div style={{background:"#111827",border:"1px solid #1e2d40",borderRadius:16,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",background:"#0d1520",padding:"12px 20px",borderBottom:"1px solid #1e2d40"}}>
              <div style={{fontSize:12,color:"#64748b"}}>Feature</div>
              {[{n:"TierShift",c:"#00e5ff"},{n:"YouTube",c:"#64748b"},{n:"CBT Nuggets",c:"#64748b"}].map((h,i)=>(<div key={i} style={{textAlign:"center",fontSize:13,fontWeight:700,color:h.c}}>{h.n}</div>))}
            </div>
            {comparisonData.map((row,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"11px 20px",borderBottom:i<comparisonData.length-1?"1px solid #1e2d40":"none",background:i%2===0?"transparent":"#0d152060"}}>
                <div style={{fontSize:13,color:"#94a3b8"}}>{row.feature}</div>
                {[row.ts,row.youtube,row.cbt].map((v,j)=>(<div key={j} style={{textAlign:"center",fontSize:16}}>{v?<span style={{color:"#34d399"}}>{'\u2713'}</span>:<span style={{color:"#1e2d40"}}>?</span>}</div>))}
              </div>
            ))}
          </div>}
        </div>
      </section>



      <section style={{padding:isMobile?"40px 20px":"80px 48px"}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{fontSize:11,color:"#00e5ff",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12,fontFamily:"monospace"}}>FAQ</div>
            <h2 style={{fontSize:"clamp(1.75rem,3.5vw,2.25rem)",fontWeight:800,margin:0}}>Questions IT Managers Ask Us</h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {faqs.map((f,i)=>(<FAQItem key={i} {...f}/>))}
          </div>}
        </div>
      </section>

      <section id="demo-section" style={{padding:isMobile?"40px 20px":"80px 48px",background:"#0d1520"}}>
        <div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
          <div style={{padding:"56px 44px",background:"linear-gradient(135deg,#00e5ff10,#a78bfa10)",border:"1px solid #00e5ff30",borderRadius:22,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-50,right:-50,width:180,height:180,background:"radial-gradient(circle,#a78bfa20,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-50,left:-50,width:180,height:180,background:"radial-gradient(circle,#00e5ff15,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{fontSize:11,color:"#00e5ff",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14,fontFamily:"monospace"}}>For IT Managers and Decision Makers</div>
            <h2 style={{fontSize:"clamp(1.75rem,4vw,2.25rem)",fontWeight:900,marginBottom:14}}>See TierShift in Action</h2>
            <p style={{fontSize:14,color:"#94a3b8",marginBottom:32,lineHeight:1.75,maxWidth:480,margin:"0 auto 32px"}}>Schedule a 20-minute walkthrough built around your team needs. We will show you how to assign tracks, read the progress dashboard, and run your first team certification.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:18}}>
              <button onClick={()=>setShowDemoModal(true)} className="bp" style={{padding:"13px 28px",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",border:"none",borderRadius:10,color:"#060a12",fontSize:15,fontWeight:800,cursor:"pointer",transition:"all .2s"}}>Request a Demo</button>
              <button onClick={()=>setShowDemoModal(true)} className="bs" style={{padding:"13px 22px",background:"transparent",border:"1px solid #1e2d40",borderRadius:10,color:"#e8edf5",fontSize:15,cursor:"pointer",transition:"all .2s"}}>Start Free Trial</button>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
              {["No credit card required","Setup in under 10 minutes","Cancel anytime"].map((item,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#64748b"}}><span style={{color:"#34d399"}}>{'\u2713'}</span>{item}</div>))}
            </div>
          </div>}
        </div>
      </section>

      <footer style={{padding:"24px 48px",borderTop:"1px solid #1e2d40",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,background:"linear-gradient(135deg,#00e5ff,#a78bfa)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#060a12"}}>TS</div>
          <span style={{fontSize:12,color:"#64748b"}}>TierShift Academy {'\u00A9'} 2025</span>
        </div>
        <div style={{fontSize:11,color:"#64748b"}}>Built for IT professionals. No fluff, just skills.</div>
      </footer>
    </div>
  );
}