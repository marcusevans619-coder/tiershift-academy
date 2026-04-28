import { useState, useEffect } from "react";

const CYAN = "#00e5ff";
const VIOLET = "#a78bfa";
const BG = "#060a12";
const SURFACE = "#0d1520";
const CARD = "#111827";
const BORDER = "#1e2d40";
const TEXT = "#e8edf5";
const MUTED = "#64748b";
const SUB = "#94a3b8";

const features = [
  { icon:"⚡", title:"Interactive Labs", desc:"Hands-on terminal, ticket, and config labs that mirror real IT environments. No theory — just doing.", color:"#00e5ff", tag:"60+ Labs", modalTitle:"Interactive Labs", modalDesc:"Every lab simulates a real-world IT scenario you would face on the job. No multiple choice — you actually do the work.", examples:[{label:"Terminal Lab",text:"SSH into a Linux server, diagnose a failed service, and restart it using systemctl commands."},{label:"Ticket Lab",text:"A user submits a ticket: Cannot connect to VPN. Troubleshoot step by step — check credentials, firewall, split tunneling config."},{label:"Config Lab",text:"Configure a VLAN on a Cisco switch using CLI commands. Wrong config? The lab tells you exactly what failed."},{label:"Scenario Lab",text:"A company DNS is down. Walk through nslookup, dig, and ping to isolate whether it is the resolver, forwarder, or zone file."}], stats:[{v:"60+",l:"Labs"},{v:"4",l:"Lab Types"},{v:"Instant",l:"Feedback"}] },
  { icon:"🎯", title:"Career Tracks", desc:"Structured paths from Tier 1 to Tier 3, Security Engineer, Cloud, and AI Security roles.", color:"#a78bfa", tag:"9 Tracks", modalTitle:"Career Tracks", modalDesc:"Each track is a curated sequence of modules, labs, and exams designed to get you job-ready for a specific IT role.", examples:[{label:"Tier 1 to Tier 2",text:"12 modules covering escalation procedures, advanced troubleshooting, scripting basics, and Active Directory."},{label:"Security Engineer",text:"18 modules on threat detection, SIEM tools, incident response, vulnerability scanning, and security frameworks."},{label:"Cloud Engineer",text:"15 modules covering AWS and Azure fundamentals, IAM, VPCs, storage, and deploying cloud infrastructure."},{label:"AI Security Specialist",text:"10 modules on LLM security, prompt injection, AI threat modeling, and securing ML pipelines."}], stats:[{v:"9",l:"Tracks"},{v:"85+",l:"Modules"},{v:"750h",l:"Content"}] },
  { icon:"🏆", title:"Certifications", desc:"Timed exams with auto-scoring. Earn verifiable credentials that prove your skills.", color:"#34d399", tag:"8 Exams", modalTitle:"Certification Exams", modalDesc:"TierShift certs are timed exams with 15 questions each. Pass with 70 percent or more to earn a downloadable certificate.", examples:[{label:"Timed Format",text:"Each exam is 30 minutes, 15 questions. A live countdown keeps the pressure real — just like CompTIA exams."},{label:"Auto-Scoring",text:"Submit your exam and get your score instantly. See exactly which questions you missed and why."},{label:"Downloadable Certificate",text:"Pass an exam and download a branded PDF certificate with your name, score, date, and a unique credential ID."},{label:"Credential Verification",text:"Share a public verification link. Employers can verify your cert is real without needing an account."}], stats:[{v:"8",l:"Exams"},{v:"120+",l:"Questions"},{v:"70%",l:"Pass Mark"}] },
  { icon:"🔖", title:"Badge System", desc:"Auto-awarded badges for completing labs, tracks, and certifications. Build your portfolio.", color:"#fbbf24", tag:"Auto-awarded", modalTitle:"Badge System", modalDesc:"Badges are automatically awarded the moment you hit a milestone. No manual claiming — just complete the work and they appear.", examples:[{label:"Lab Badges",text:"Complete a lab and instantly earn a badge. Finish all labs in a category to unlock a category master badge."},{label:"Track Badges",text:"Complete an entire career track and earn a track completion badge — one of the rarest on the platform."},{label:"Cert Badges",text:"Pass a certification exam and earn both a certificate and a digital badge you can add to your LinkedIn profile."},{label:"Streak Badges",text:"Log in and complete labs 7 days in a row to earn the Consistency badge. 30 days equals Elite status."}], stats:[{v:"Auto",l:"Awarded"},{v:"4",l:"Badge Types"},{v:"Share",l:"Profiles"}] },
  { icon:"🖥️", title:"Terminal Simulator", desc:"Real command-line practice with scenario-based challenges and instant feedback.", color:"#fb7185", tag:"Realistic", modalTitle:"Terminal Simulator", modalDesc:"The terminal simulator runs real Linux and networking commands in a sandboxed environment. Make mistakes safely.", examples:[{label:"Linux Commands",text:"Practice ls, grep, chmod, systemctl, journalctl, cron, and more in a real bash-like environment."},{label:"Network Diagnostics",text:"Run ping, traceroute, nslookup, dig, netstat, and nmap against simulated network targets."},{label:"Scenario Objectives",text:"Each terminal lab has objectives. The system checks your work automatically — did you actually fix the problem?"},{label:"Instant Feedback",text:"Wrong command? You get an explanation of what went wrong and a hint for the right approach."}], stats:[{v:"Real",l:"Commands"},{v:"Safe",l:"Sandbox"},{v:"Hints",l:"On Demand"}] },
  { icon:"📊", title:"Progress Tracking", desc:"Visual dashboards showing hours logged, modules done, streak, and skill growth over time.", color:"#38bdf8", tag:"Data-driven", modalTitle:"Progress Tracking", modalDesc:"Your dashboard gives you a real-time view of everything — hours put in, what you completed, and where to go next.", examples:[{label:"Hours Logged",text:"Every minute in a lab or exam counts. See your total study hours and track if you are hitting your weekly goal."},{label:"Track Progress",text:"Visual progress bars for each career track show exactly how far along you are and what is left to complete."},{label:"Day Streak",text:"Your streak counter updates daily. Miss a day and it resets — a simple motivator to keep showing up."},{label:"Continue Learning",text:"The dashboard surfaces your most recent modules so you can pick up exactly where you left off."}], stats:[{v:"Live",l:"Updates"},{v:"6",l:"Metrics"},{v:"Visual",l:"Dashboards"}] },
];

const tracks = [
  {name:"Tier 1 to Tier 2",icon:"▲",color:"#00e5ff",modules:12,hours:"136h",tag:"Most Popular",modalDesc:"The foundational track for helpdesk and Tier 1 support pros ready to move into a Tier 2 role. Covers everything from advanced troubleshooting to scripting and Active Directory management.",skills:["Active Directory & Group Policy","PowerShell scripting basics","Advanced Windows troubleshooting","Network fundamentals (DNS, DHCP, VPN)","Ticket escalation & documentation","Remote support tools & RMM platforms"],examples:[{label:"Lab: AD User Provisioning",text:"Create a new user in Active Directory, assign them to the correct OU, apply a Group Policy, and verify login access."},{label:"Lab: PowerShell Automation",text:"Write a script that pulls all disabled accounts from AD and exports them to a CSV report."},{label:"Exam: Tier 2 Certification",text:"15 questions covering escalation procedures, Windows event logs, network troubleshooting, and AD administration."}]},
  {name:"Tier 2 to Tier 3",icon:"◆",color:"#a78bfa",modules:16,hours:"180h",tag:"Advanced",modalDesc:"For experienced Tier 2 engineers ready to step into a systems or infrastructure engineer role. Deep dives into server management, virtualization, and enterprise networking.",skills:["Windows Server administration","VMware/Hyper-V virtualization","Enterprise networking (BGP, OSPF, VLANs)","Linux server management","Backup & disaster recovery","ITSM frameworks (ITIL)"],examples:[{label:"Lab: VM Deployment",text:"Deploy a Windows Server 2022 VM in Hyper-V, configure networking, join it to a domain, and install IIS."},{label:"Lab: Linux Admin",text:"Troubleshoot a failed Apache web server on Ubuntu — check logs, fix config errors, and restart services."},{label:"Exam: Systems Engineer Cert",text:"15 questions covering virtualization, server roles, enterprise networking, and infrastructure best practices."}]},
  {name:"Security Engineer",icon:"◉",color:"#fb7185",modules:18,hours:"200h",tag:"High Demand",modalDesc:"The most comprehensive track on the platform. Built for IT pros moving into cybersecurity engineering roles. Covers threat detection, incident response, and security frameworks.",skills:["SIEM tools (Splunk, Microsoft Sentinel)","Threat detection & analysis","Incident response procedures","Vulnerability scanning (Nessus, OpenVAS)","Security frameworks (NIST, ISO 27001)","Firewall & endpoint security"],examples:[{label:"Lab: SIEM Alert Triage",text:"Analyze a Splunk dashboard showing suspicious login attempts. Identify the attack pattern and document your incident response."},{label:"Lab: Vulnerability Scan",text:"Run an Nmap and Nessus scan against a test environment, analyze findings, and prioritize remediation steps."},{label:"Exam: Security Engineer Cert",text:"15 questions covering threat modeling, incident response, SIEM analysis, and security compliance frameworks."}]},
  {name:"Network Engineer",icon:"◎",color:"#34d399",modules:14,hours:"155h",tag:"Evergreen",modalDesc:"A hands-on networking track covering everything from VLAN configuration to BGP routing. Perfect for IT pros targeting network engineering or infrastructure roles.",skills:["Cisco CLI & IOS configuration","VLAN & trunking setup","Routing protocols (OSPF, BGP, EIGRP)","Network troubleshooting methodology","Wireless networking & 802.11","Network monitoring & SNMP"],examples:[{label:"Lab: VLAN Configuration",text:"Configure VLANs on a Cisco switch, set up inter-VLAN routing on a Layer 3 switch, and verify connectivity between segments."},{label:"Lab: BGP Routing",text:"Set up a BGP peering session between two routers, advertise a network prefix, and verify route propagation."},{label:"Exam: Network Engineer Cert",text:"15 questions covering switching, routing protocols, troubleshooting methodology, and network design fundamentals."}]},
  {name:"Cloud Engineer",icon:"☁",color:"#fbbf24",modules:15,hours:"165h",tag:"Future-Proof",modalDesc:"Covers AWS and Azure fundamentals through to deploying production infrastructure. Built for IT pros targeting cloud or DevOps-adjacent roles.",skills:["AWS core services (EC2, S3, VPC, IAM)","Azure fundamentals & resource groups","Infrastructure as Code (Terraform basics)","Cloud networking & security groups","Load balancers & auto-scaling","Cost management & billing alerts"],examples:[{label:"Lab: AWS VPC Setup",text:"Create a VPC with public and private subnets, configure route tables, set up an internet gateway, and launch an EC2 instance."},{label:"Lab: IAM Policy Creation",text:"Create an IAM role with least-privilege permissions for an S3 bucket, attach it to an EC2 instance, and test access."},{label:"Exam: Cloud Engineer Cert",text:"15 questions covering AWS and Azure core services, cloud networking, IAM, and infrastructure deployment best practices."}]},
  {name:"AI Security",icon:"△",color:"#fb7185",modules:10,hours:"110h",tag:"Cutting Edge",modalDesc:"The newest track on the platform. Covers securing AI and ML systems — from prompt injection attacks to LLM threat modeling. Built for security pros entering the AI space.",skills:["LLM threat modeling","Prompt injection & jailbreak attacks","Securing ML pipelines","AI governance & compliance","Data poisoning detection","Red teaming AI systems"],examples:[{label:"Lab: Prompt Injection",text:"Attempt to bypass safety guardrails on a simulated LLM using various prompt injection techniques. Document each vector."},{label:"Lab: ML Pipeline Security",text:"Audit a sample ML training pipeline for data poisoning vulnerabilities and implement input validation controls."},{label:"Exam: AI Security Cert",text:"15 questions covering LLM attack vectors, AI governance frameworks, ML pipeline security, and emerging AI threats."}]},
];

const statsBar = [
  {value:"60+",label:"Interactive Labs"},
  {value:"9",label:"Career Tracks"},
  {value:"8",label:"Cert Exams"},
  {value:"120+",label:"Quiz Questions"},
];

const terminalLines = [
  {text:"$ ping 192.168.1.1",color:"#00e5ff"},
  {text:"PING 192.168.1.1: 56 data bytes",color:"#e8edf5"},
  {text:"64 bytes from 192.168.1.1: icmp_seq=0 ttl=64 time=1.2ms",color:"#34d399"},
  {text:"$ traceroute google.com",color:"#00e5ff"},
  {text:"traceroute to google.com (142.250.80.46)",color:"#e8edf5"},
  {text:"1  192.168.1.1  1.234ms  0.987ms",color:"#34d399"},
  {text:"$ nmap -sV 192.168.1.0/24",color:"#00e5ff"},
  {text:"Starting Nmap 7.94",color:"#e8edf5"},
  {text:"✓ Lab objective complete! +250 XP earned",color:"#fbbf24"},
];

function TrackModal({track,onClose,onGetStarted}) {
  useEffect(()=>{
    const h=(e)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);
    return ()=>document.removeEventListener("keydown",h);
  },[onClose]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0d1520",border:`1px solid ${track.color}40`,borderRadius:20,width:"100%",maxWidth:640,maxHeight:"88vh",overflowY:"auto",boxShadow:`0 24px 80px rgba(0,0,0,0.8),0 0 40px ${track.color}15`}}>
        <div style={{padding:"28px 28px 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"transparent",border:"1px solid #1e2d40",borderRadius:8,color:"#64748b",width:32,height:32,cursor:"pointer",fontSize:18,lineHeight:1}}>x</button>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:52,height:52,background:`${track.color}15`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:track.color}}>{track.icon}</div>
            <div>
              <div style={{fontSize:11,color:track.color,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3,fontFamily:"monospace"}}>{track.tag}</div>
              <h2 style={{fontSize:21,fontWeight:800,color:"#e8edf5",margin:0}}>{track.name}</h2>
            </div>
          </div>
          <p style={{fontSize:14,color:"#94a3b8",lineHeight:1.7,margin:"0 0 20px"}}>{track.modalDesc}</p>
          <div style={{display:"flex",gap:16,marginBottom:24}}>
            {[{v:track.modules,l:"Modules"},{v:track.hours,l:"Est. Time"},{v:"Cert",l:"Included"}].map((s,i)=>(
              <div key={i} style={{flex:1,padding:12,background:"#111827",border:"1px solid #1e2d40",borderRadius:10,textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:800,color:track.color,fontFamily:"monospace"}}>{s.v}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:"0 28px 28px"}}>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12,fontFamily:"monospace"}}>Skills You Will Learn</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {track.skills.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"#111827",border:"1px solid #1e2d40",borderRadius:8}}>
                <span style={{color:track.color,fontSize:12}}>✓</span>
                <span style={{fontSize:12,color:"#94a3b8"}}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12,fontFamily:"monospace"}}>What You Will Do</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {track.examples.map((ex,i)=>(
              <div key={i} style={{padding:"14px 16px",background:"#111827",border:"1px solid #1e2d40",borderRadius:10,borderLeft:`3px solid ${track.color}`}}>
                <div style={{fontSize:12,fontWeight:700,color:track.color,marginBottom:5,fontFamily:"monospace"}}>{ex.label}</div>
                <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.65}}>{ex.text}</div>
              </div>
            ))}
          </div>
          <button onClick={onGetStarted} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${track.color},#a78bfa)`,border:"none",borderRadius:10,color:"#060a12",fontSize:14,fontWeight:800,cursor:"pointer"}}>
            Start {track.name} Track Free
          </button>
        </div>
      </div>
    </div>
  );
}
function FeatureModal({feature,onClose,onGetStarted}) {
  useEffect(()=>{
    const h=(e)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h);
    return ()=>document.removeEventListener("keydown",h);
  },[onClose]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0d1520",border:`1px solid ${feature.color}40`,borderRadius:20,width:"100%",maxWidth:620,maxHeight:"88vh",overflowY:"auto",boxShadow:`0 24px 80px rgba(0,0,0,0.8),0 0 40px ${feature.color}15`}}>
        <div style={{padding:"28px 28px 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"transparent",border:"1px solid #1e2d40",borderRadius:8,color:"#64748b",width:32,height:32,cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:52,height:52,background:`${feature.color}15`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{feature.icon}</div>
            <div>
              <div style={{fontSize:11,color:feature.color,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3,fontFamily:"monospace"}}>{feature.tag}</div>
              <h2 style={{fontSize:21,fontWeight:800,color:"#e8edf5",margin:0}}>{feature.modalTitle}</h2>
            </div>
          </div>
          <p style={{fontSize:14,color:"#94a3b8",lineHeight:1.7,margin:"0 0 20px"}}>{feature.modalDesc}</p>
          <div style={{display:"flex",gap:12,marginBottom:24}}>
            {feature.stats.map((s,i)=>(
              <div key={i} style={{flex:1,padding:12,background:"#111827",border:"1px solid #1e2d40",borderRadius:10,textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:800,color:feature.color,fontFamily:"monospace"}}>{s.v}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:"0 28px 28px"}}>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12,fontFamily:"monospace"}}>Real Examples</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {feature.examples.map((ex,i)=>(
              <div key={i} style={{padding:"14px 16px",background:"#111827",border:"1px solid #1e2d40",borderRadius:10,borderLeft:`3px solid ${feature.color}`}}>
                <div style={{fontSize:12,fontWeight:700,color:feature.color,marginBottom:5,fontFamily:"monospace"}}>{ex.label}</div>
                <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.65}}>{ex.text}</div>
              </div>
            ))}
          </div>
          <button onClick={onGetStarted} style={{width:"100%",marginTop:20,padding:13,background:`linear-gradient(135deg,${feature.color},#a78bfa)`,border:"none",borderRadius:10,color:"#060a12",fontSize:14,fontWeight:800,cursor:"pointer"}}>
            Try {feature.modalTitle} Free
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage({onGetStarted,onSignIn}) {
  const [visibleLines,setVisibleLines] = useState(0);
  const [scrollY,setScrollY] = useState(0);
  const [activeTrack,setActiveTrack] = useState(0);
  const [selectedFeature,setSelectedFeature] = useState(null);
  const [selectedTrack,setSelectedTrack] = useState(null);

  useEffect(()=>{
    const t=setInterval(()=>setVisibleLines(v=>v<terminalLines.length?v+1:v),400);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    const h=()=>setScrollY(window.scrollY);
    window.addEventListener("scroll",h);
    return ()=>window.removeEventListener("scroll",h);
  },[]);

  useEffect(()=>{
    const t=setInterval(()=>setActiveTrack(t=>(t+1)%tracks.length),2000);
    return ()=>clearInterval(t);
  },[]);

  return (
    <div style={{backgroundColor:"#060a12",color:"#e8edf5",fontFamily:"Outfit,sans-serif",minHeight:"100vh",overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .fadeUp{animation:fadeUp .7s ease forwards}
        .bp:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,229,255,.4)}
        .bs:hover{transform:translateY(-2px);border-color:rgba(0,229,255,.6)!important;color:#00e5ff!important}
        .fc{cursor:pointer;transition:all .25s}
        .fc:hover{transform:translateY(-5px);box-shadow:0 10px 40px rgba(0,0,0,.5)}
        *{box-sizing:border-box}
      `}</style>

      {selectedFeature&&<FeatureModal feature={selectedFeature} onClose={()=>setSelectedFeature(null)} onGetStarted={()=>{setSelectedFeature(null);onGetStarted();}}/>}
      {selectedTrack&&<TrackModal track={selectedTrack} onClose={()=>setSelectedTrack(null)} onGetStarted={()=>{setSelectedTrack(null);onGetStarted();}}/>}

      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"14px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",background:scrollY>50?"rgba(6,10,18,.95)":"transparent",backdropFilter:scrollY>50?"blur(20px)":"none",borderBottom:scrollY>50?"1px solid #1e2d40":"none",transition:"all .3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,#00e5ff,#a78bfa)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#060a12"}}>TS</div>
          <div><div style={{fontSize:17,fontWeight:800}}>Tier<span style={{color:"#00e5ff"}}>Shift</span></div><div style={{fontSize:10,color:"#64748b"}}>Academy</div></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onSignIn} className="bs" style={{padding:"8px 18px",background:"transparent",border:"1px solid #1e2d40",borderRadius:8,color:"#94a3b8",fontSize:14,cursor:"pointer",transition:"all .2s"}}>Sign In</button>
          <button onClick={onGetStarted} className="bp" style={{padding:"8px 18px",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",border:"none",borderRadius:8,color:"#060a12",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>Get Started</button>
        </div>
      </nav>

      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",padding:"110px 48px 80px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(#1e2d4033 1px,transparent 1px),linear-gradient(90deg,#1e2d4033 1px,transparent 1px)",backgroundSize:"60px 60px",opacity:.4}}/>
        <div style={{position:"absolute",top:"20%",left:"50%",width:600,height:600,background:"radial-gradient(circle,#00e5ff15 0%,transparent 70%)",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1200,margin:"0 auto",width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>
          <div className="fadeUp">
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 12px",background:"#00e5ff15",border:"1px solid #00e5ff40",borderRadius:20,fontSize:12,color:"#00e5ff",fontWeight:600,marginBottom:22,fontFamily:"monospace"}}>⚡ Now with AI Security Track</div>
            <h1 style={{fontSize:"clamp(2.5rem,5vw,3.75rem)",fontWeight:900,lineHeight:1.1,margin:"0 0 22px"}}>Train Like a<br/><span style={{background:"linear-gradient(135deg,#00e5ff,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Real IT Pro</span></h1>
            <p style={{fontSize:17,color:"#94a3b8",lineHeight:1.7,marginBottom:36,maxWidth:460}}>Hands-on labs, certification exams, and career tracks built for IT support professionals ready to level up. No fluff — just real skills.</p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <button onClick={onGetStarted} className="bp" style={{padding:"13px 28px",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",border:"none",borderRadius:10,color:"#060a12",fontSize:15,fontWeight:800,cursor:"pointer",transition:"all .2s"}}>Start Free Today →</button>
              <button onClick={onSignIn} className="bs" style={{padding:"13px 24px",background:"transparent",border:"1px solid #1e2d40",borderRadius:10,color:"#e8edf5",fontSize:15,cursor:"pointer",transition:"all .2s"}}>Sign In</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14,marginTop:36}}>
              <div style={{display:"flex"}}>{["ML","JR","AK","TC"].map((x,i)=>(<div key={i} style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",border:"2px solid #060a12",marginLeft:i>0?-8:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#060a12"}}>{x}</div>))}</div>
              <span style={{fontSize:13,color:"#64748b"}}>Join <strong style={{color:"#e8edf5"}}>500+</strong> IT professionals training now</span>
            </div>
          </div>
          <div style={{animation:"float 4s ease-in-out infinite"}}>
            <div style={{background:"#111827",border:"1px solid #1e2d40",borderRadius:16,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.6),0 0 40px #00e5ff20"}}>
              <div style={{padding:"10px 14px",background:"#0d1520",borderBottom:"1px solid #1e2d40",display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:11,height:11,borderRadius:"50%",background:"#ef4444"}}/><div style={{width:11,height:11,borderRadius:"50%",background:"#fbbf24"}}/><div style={{width:11,height:11,borderRadius:"50%",background:"#34d399"}}/>
                <span style={{marginLeft:8,fontSize:12,color:"#64748b",fontFamily:"monospace"}}>lab-terminal — Network Fundamentals</span>
              </div>
              <div style={{padding:18,fontFamily:"monospace",fontSize:13,lineHeight:1.8,minHeight:260}}>
                {terminalLines.slice(0,visibleLines).map((l,i)=>(<div key={i} style={{color:l.color}}>{l.text}</div>))}
                <span style={{display:"inline-block",width:8,height:15,background:"#00e5ff",animation:"pulse 1s infinite",verticalAlign:"middle"}}/>
              </div>
              <div style={{padding:"10px 18px",borderTop:"1px solid #1e2d40",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:11,color:"#64748b",fontFamily:"monospace"}}>Lab Progress</span>
                <div style={{flex:1,height:4,background:"#1e2d40",borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:`${(visibleLines/terminalLines.length)*100}%`,height:"100%",background:"linear-gradient(90deg,#00e5ff,#a78bfa)",transition:"width .4s"}}/>
                </div>
                <span style={{fontSize:11,color:"#00e5ff",fontFamily:"monospace"}}>{Math.round((visibleLines/terminalLines.length)*100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{padding:"50px 48px",borderTop:"1px solid #1e2d40",borderBottom:"1px solid #1e2d40"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32}}>
          {statsBar.map((s,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{fontSize:44,fontWeight:900,color:"#00e5ff",fontFamily:"monospace",lineHeight:1}}>{s.value}</div><div style={{fontSize:13,color:"#64748b",marginTop:6}}>{s.label}</div></div>))}
        </div>
      </section>

      <section style={{padding:"90px 48px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:11,color:"#00e5ff",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14,fontFamily:"monospace"}}>Platform Features</div>
            <h2 style={{fontSize:"clamp(2rem,4vw,2.75rem)",fontWeight:800,margin:"0 0 14px"}}>Everything You Need to Level Up</h2>
            <p style={{fontSize:16,color:"#94a3b8",maxWidth:500,margin:"0 auto 6px"}}>Built specifically for IT support professionals ready to move into engineering roles.</p>
            <p style={{fontSize:12,color:"#64748b",fontFamily:"monospace"}}>↓ Click any card to see real examples</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginTop:44}}>
            {features.map((f,i)=>(
              <div key={i} className="fc" onClick={()=>setSelectedFeature(f)} style={{padding:24,background:"#111827",border:"1px solid #1e2d40",borderRadius:14,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,background:`radial-gradient(circle,${f.color}12,transparent 70%)`,pointerEvents:"none"}}/>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{width:44,height:44,background:`${f.color}15`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{f.icon}</div>
                  <span style={{fontSize:10,color:f.color,fontWeight:700,fontFamily:"monospace",background:`${f.color}15`,padding:"3px 7px",borderRadius:5}}>{f.tag}</span>
                </div>
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:8,color:"#e8edf5"}}>{f.title}</h3>
                <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.65,margin:"0 0 14px"}}>{f.desc}</p>
                <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:f.color,fontWeight:600}}>
                  <span>See examples</span><span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:"90px 48px",background:"#0d1520"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:"#a78bfa",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14,fontFamily:"monospace"}}>Career Tracks</div>
            <h2 style={{fontSize:"clamp(1.75rem,3vw,2.5rem)",fontWeight:800,marginBottom:18}}>Structured Paths to Your Next Role</h2>
            <p style={{fontSize:15,color:"#94a3b8",lineHeight:1.8,marginBottom:36}}>Whether you are moving from helpdesk to sysadmin or pivoting into security, we have a track for your exact career move.</p>
            <button onClick={onGetStarted} className="bp" style={{padding:"11px 24px",background:"linear-gradient(135deg,#a78bfa,#00e5ff)",border:"none",borderRadius:10,color:"#060a12",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all .2s"}}>Explore All Tracks →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {tracks.map((t,i)=>(
              <div key={i} onClick={()=>{setActiveTrack(i);setSelectedTrack(t);}} style={{padding:"14px 18px",background:i===activeTrack?`${t.color}10`:"#111827",border:`1px solid ${i===activeTrack?t.color+"40":"#1e2d40"}`,borderRadius:10,display:"flex",alignItems:"center",gap:14,transition:"all .4s",cursor:"pointer"}}>
                <div style={{width:34,height:34,background:`${t.color}20`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:t.color}}>{t.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:i===activeTrack?"#e8edf5":"#94a3b8"}}>{t.name}</div>
                  <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{t.modules} modules</div>
                </div>
                <div style={{fontSize:11,color:i===activeTrack?t.color:"#64748b",fontFamily:"monospace",whiteSpace:"nowrap"}}>{i===activeTrack?"View →":"→"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:"90px 48px"}}>
        <div style={{maxWidth:860,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <div style={{fontSize:11,color:"#00e5ff",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14,fontFamily:"monospace"}}>How It Works</div>
            <h2 style={{fontSize:"clamp(1.75rem,3vw,2.5rem)",fontWeight:800}}>From Zero to Certified in 4 Steps</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:28,position:"relative"}}>
            <div style={{position:"absolute",top:22,left:"12.5%",right:"12.5%",height:1,background:"linear-gradient(90deg,#00e5ff40,#a78bfa40)",zIndex:0}}/>
            {[{step:"01",icon:"🎯",title:"Pick a Track",desc:"Choose the career path that matches where you want to go."},{step:"02",icon:"🖥️",title:"Do the Labs",desc:"Complete hands-on terminal, ticket, and scenario labs."},{step:"03",icon:"📝",title:"Take the Exam",desc:"Prove your knowledge with timed certification exams."},{step:"04",icon:"🏆",title:"Earn Your Badge",desc:"Download your certificate and share your credentials."}].map((s,i)=>(
              <div key={i} style={{textAlign:"center",position:"relative",zIndex:1}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#060a12",margin:"0 auto 18px",fontFamily:"monospace"}}>{s.step}</div>
                <div style={{fontSize:26,marginBottom:10}}>{s.icon}</div>
                <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>{s.title}</div>
                <div style={{fontSize:12,color:"#64748b",lineHeight:1.6}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:"80px 48px"}}>
        <div style={{maxWidth:660,margin:"0 auto",textAlign:"center"}}>
          <div style={{padding:"56px 44px",background:"linear-gradient(135deg,#00e5ff10,#a78bfa10)",border:"1px solid #00e5ff30",borderRadius:20,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-50,right:-50,width:180,height:180,background:"radial-gradient(circle,#a78bfa20,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"absolute",bottom:-50,left:-50,width:180,height:180,background:"radial-gradient(circle,#00e5ff20,transparent 70%)",pointerEvents:"none"}}/>
            <div style={{fontSize:11,color:"#00e5ff",fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:18,fontFamily:"monospace"}}>Ready to Start?</div>
            <h2 style={{fontSize:"clamp(1.75rem,4vw,2.25rem)",fontWeight:900,marginBottom:14}}>Your Next IT Role Starts Here</h2>
            <p style={{fontSize:15,color:"#94a3b8",marginBottom:36,lineHeight:1.7}}>Join hundreds of IT professionals using TierShift Academy to earn real skills and certifications that get them hired.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={onGetStarted} className="bp" style={{padding:"13px 32px",background:"linear-gradient(135deg,#00e5ff,#a78bfa)",border:"none",borderRadius:10,color:"#060a12",fontSize:15,fontWeight:800,cursor:"pointer",transition:"all .2s"}}>Get Started Free →</button>
              <button onClick={onSignIn} className="bs" style={{padding:"13px 24px",background:"transparent",border:"1px solid #1e2d40",borderRadius:10,color:"#e8edf5",fontSize:15,cursor:"pointer",transition:"all .2s"}}>Sign In</button>
            </div>
          </div>
        </div>
      </section>

      <footer style={{padding:"28px 48px",borderTop:"1px solid #1e2d40",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,background:"linear-gradient(135deg,#00e5ff,#a78bfa)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#060a12"}}>TS</div>
          <span style={{fontSize:12,color:"#64748b"}}>TierShift Academy © 2025</span>
        </div>
        <div style={{fontSize:11,color:"#64748b"}}>Built for IT professionals. No fluff, just skills.</div>
      </footer>
    </div>
  );
}