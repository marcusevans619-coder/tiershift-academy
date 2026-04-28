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
  {
    icon: "⚡",
    title: "Interactive Labs",
    desc: "Hands-on terminal, ticket, and config labs that mirror real IT environments. No theory — just doing.",
    color: CYAN,
    tag: "60+ Labs"
  },
  {
    icon: "🎯",
    title: "Career Tracks",
    desc: "Structured paths from Tier 1 to Tier 3, Security Engineer, Cloud, and AI Security roles.",
    color: VIOLET,
    tag: "9 Tracks"
  },
  {
    icon: "🏆",
    title: "Certifications",
    desc: "Timed exams with auto-scoring. Earn verifiable credentials that prove your skills.",
    color: "#34d399",
    tag: "8 Exams"
  },
  {
    icon: "🔖",
    title: "Badge System",
    desc: "Auto-awarded badges for completing labs, tracks, and certifications. Build your portfolio.",
    color: "#fbbf24",
    tag: "Auto-awarded"
  },
  {
    icon: "🖥️",
    title: "Terminal Simulator",
    desc: "Real command-line practice with scenario-based challenges and instant feedback.",
    color: "#fb7185",
    tag: "Realistic"
  },
  {
    icon: "📊",
    title: "Progress Tracking",
    desc: "Visual dashboards showing hours logged, modules done, streak, and skill growth over time.",
    color: "#38bdf8",
    tag: "Data-driven"
  },
];

const stats = [
  { value: "60+", label: "Interactive Labs" },
  { value: "9", label: "Career Tracks" },
  { value: "8", label: "Cert Exams" },
  { value: "120+", label: "Quiz Questions" },
];

const tracks = [
  { name: "Tier 1 → Tier 2", icon: "▲", color: CYAN, modules: 12 },
  { name: "Tier 2 → Tier 3", icon: "◆", color: VIOLET, modules: 16 },
  { name: "Security Engineer", icon: "◉", color: "#fb7185", modules: 18 },
  { name: "Network Engineer", icon: "◎", color: "#34d399", modules: 14 },
  { name: "Cloud Engineer", icon: "☁", color: "#fbbf24", modules: 15 },
  { name: "AI Security", icon: "△", color: "#fb7185", modules: 10 },
];

const terminalLines = [
  { text: "$ ping 192.168.1.1", color: CYAN },
  { text: "PING 192.168.1.1: 56 data bytes", color: TEXT },
  { text: "64 bytes from 192.168.1.1: icmp_seq=0 ttl=64 time=1.2ms", color: "#34d399" },
  { text: "$ traceroute google.com", color: CYAN },
  { text: "traceroute to google.com (142.250.80.46)", color: TEXT },
  { text: "1  192.168.1.1  1.234ms  0.987ms", color: "#34d399" },
  { text: "2  10.0.0.1  5.432ms  4.876ms", color: "#34d399" },
  { text: "$ nmap -sV 192.168.1.0/24", color: CYAN },
  { text: "Starting Nmap 7.94 ( https://nmap.org )", color: TEXT },
  { text: "✓ Lab objective complete! +250 XP earned", color: "#fbbf24" },
];

export default function HomePage({ onGetStarted, onSignIn }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [activeTrack, setActiveTrack] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines(v => v < terminalLines.length ? v + 1 : v);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTrack(t => (t + 1) % tracks.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ backgroundColor: BG, color: TEXT, fontFamily: "'Outfit', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes scanline { 0% { transform:translateY(-100%); } 100% { transform:translateY(100vh); } }
        @keyframes glow { 0%,100% { box-shadow:0 0 20px rgba(0,229,255,0.3); } 50% { box-shadow:0 0 40px rgba(0,229,255,0.6); } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
        .fadeUp { animation: fadeUp 0.7s ease forwards; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(0,229,255,0.4); }
        .btn-secondary:hover { transform:translateY(-2px); border-color:rgba(0,229,255,0.6); color:${CYAN}; }
        .feature-card:hover { transform:translateY(-4px); border-color:rgba(0,229,255,0.3); }
        .track-item:hover { background:rgba(0,229,255,0.05); }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#0d1520; } ::-webkit-scrollbar-thumb { background:#1e2d40; border-radius:3px; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrollY > 50 ? "rgba(6,10,18,0.95)" : "transparent",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        borderBottom: scrollY > 50 ? `1px solid ${BORDER}` : "none",
        transition: "all 0.3s ease"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: BG }}>TS</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Tier<span style={{ color: CYAN }}>Shift</span></div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: -2 }}>Academy</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onSignIn} className="btn-secondary" style={{ padding: "9px 20px", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, color: SUB, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>Sign In</button>
          <button onClick={onGetStarted} className="btn-primary" style={{ padding: "9px 20px", background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`, border: "none", borderRadius: 8, color: BG, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 48px 80px", position: "relative", overflow: "hidden" }}>
        {/* Background grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${BORDER}33 1px, transparent 1px), linear-gradient(90deg, ${BORDER}33 1px, transparent 1px)`, backgroundSize: "60px 60px", opacity: 0.4 }}/>
        <div style={{ position: "absolute", top: "20%", left: "50%", width: 600, height: 600, background: `radial-gradient(circle, ${CYAN}15 0%, transparent 70%)`, transform: "translate(-50%,-50%)", pointerEvents: "none" }}/>

        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          {/* Left */}
          <div className="fadeUp">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: `${CYAN}15`, border: `1px solid ${CYAN}40`, borderRadius: 20, fontSize: 12, color: CYAN, fontWeight: 600, marginBottom: 24, fontFamily: "'JetBrains Mono', monospace" }}>
              ⚡ Now with AI Security Track
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, margin: "0 0 24px" }}>
              Train Like a<br/>
              <span style={{ background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Real IT Pro</span>
            </h1>
            <p style={{ fontSize: 18, color: SUB, lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
              Hands-on labs, certification exams, and career tracks built for IT support professionals ready to level up. No fluff — just real skills.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={onGetStarted} className="btn-primary" style={{ padding: "14px 32px", background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`, border: "none", borderRadius: 10, color: BG, fontSize: 16, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>
                Start Free Today →
              </button>
              <button onClick={onSignIn} className="btn-secondary" style={{ padding: "14px 28px", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT, fontSize: 16, cursor: "pointer", transition: "all 0.2s" }}>
                Sign In
              </button>
            </div>
            {/* Social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40 }}>
              <div style={{ display: "flex" }}>
                {["ML","JR","AK","TC"].map((init, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`, border: `2px solid ${BG}`, marginLeft: i > 0 ? -8 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: BG }}>{init}</div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: MUTED }}>Join <span style={{ color: TEXT, fontWeight: 600 }}>500+</span> IT professionals training now</div>
            </div>
          </div>

          {/* Right - Terminal */}
          <div style={{ animation: "float 4s ease-in-out infinite" }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 40px ${CYAN}20` }}>
              {/* Terminal header */}
              <div style={{ padding: "12px 16px", background: SURFACE, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }}/>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fbbf24" }}/>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#34d399" }}/>
                <span style={{ marginLeft: 8, fontSize: 12, color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>lab-terminal — Network Fundamentals</span>
              </div>
              {/* Terminal body */}
              <div style={{ padding: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.8, minHeight: 280 }}>
                {terminalLines.slice(0, visibleLines).map((line, i) => (
                  <div key={i} style={{ color: line.color, opacity: 1 }}>{line.text}</div>
                ))}
                <span style={{ display: "inline-block", width: 8, height: 16, background: CYAN, animation: "pulse 1s infinite", verticalAlign: "middle" }}/>
              </div>
              {/* Progress bar */}
              <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>Lab Progress</span>
                <div style={{ flex: 1, height: 4, background: BORDER, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(visibleLines / terminalLines.length) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${CYAN}, ${VIOLET})`, borderRadius: 4, transition: "width 0.4s" }}/>
                </div>
                <span style={{ fontSize: 11, color: CYAN, fontFamily: "'JetBrains Mono', monospace" }}>{Math.round((visibleLines / terminalLines.length) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "60px 48px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: CYAN, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: MUTED, marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: CYAN, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Platform Features</div>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, margin: "0 0 16px" }}>Everything You Need to Level Up</h2>
            <p style={{ fontSize: 17, color: SUB, maxWidth: 520, margin: "0 auto" }}>Built specifically for IT support professionals ready to move into engineering roles.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card" style={{ padding: 28, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, transition: "all 0.3s", cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, background: `${f.color}15`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{f.icon}</div>
                  <span style={{ fontSize: 11, color: f.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", background: `${f.color}15`, padding: "3px 8px", borderRadius: 6 }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: TEXT }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: SUB, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAREER TRACKS */}
      <section style={{ padding: "100px 48px", background: SURFACE }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: VIOLET, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>Career Tracks</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800, marginBottom: 20 }}>Structured Paths to Your Next Role</h2>
            <p style={{ fontSize: 16, color: SUB, lineHeight: 1.8, marginBottom: 40 }}>Whether you're moving from helpdesk to sysadmin or pivoting into security, we have a track for your exact career move.</p>
            <button onClick={onGetStarted} className="btn-primary" style={{ padding: "12px 28px", background: `linear-gradient(135deg, ${VIOLET}, ${CYAN})`, border: "none", borderRadius: 10, color: BG, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
              Explore All Tracks →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tracks.map((t, i) => (
              <div key={i} className="track-item" style={{ padding: "16px 20px", background: i === activeTrack ? `${t.color}10` : CARD, border: `1px solid ${i === activeTrack ? t.color + "40" : BORDER}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 16, transition: "all 0.4s", cursor: "pointer" }} onClick={() => setActiveTrack(i)}>
                <div style={{ width: 36, height: 36, background: `${t.color}20`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: t.color }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: i === activeTrack ? TEXT : SUB }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{t.modules} modules</div>
                </div>
                {i === activeTrack && <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, animation: "pulse 1.5s infinite" }}/>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: CYAN, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>How It Works</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 800 }}>From Zero to Certified in 4 Steps</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, position: "relative" }}>
            <div style={{ position: "absolute", top: 24, left: "12.5%", right: "12.5%", height: 1, background: `linear-gradient(90deg, ${CYAN}40, ${VIOLET}40)`, zIndex: 0 }}/>
            {[
              { step: "01", icon: "🎯", title: "Pick a Track", desc: "Choose the career path that matches where you want to go." },
              { step: "02", icon: "🖥️", title: "Do the Labs", desc: "Complete hands-on terminal, ticket, and scenario labs." },
              { step: "03", icon: "📝", title: "Take the Exam", desc: "Prove your knowledge with timed certification exams." },
              { step: "04", icon: "🏆", title: "Earn Your Badge", desc: "Download your certificate and share your credentials." },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: BG, margin: "0 auto 20px", fontFamily: "'JetBrains Mono', monospace" }}>{s.step}</div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ padding: "64px 48px", background: `linear-gradient(135deg, ${CYAN}10, ${VIOLET}10)`, border: `1px solid ${CYAN}30`, borderRadius: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle, ${VIOLET}20, transparent 70%)`, pointerEvents: "none" }}/>
            <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, background: `radial-gradient(circle, ${CYAN}20, transparent 70%)`, pointerEvents: "none" }}/>
            <div style={{ fontSize: 12, color: CYAN, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, fontFamily: "'JetBrains Mono', monospace" }}>Ready to Start?</div>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, marginBottom: 16 }}>Your Next IT Role Starts Here</h2>
            <p style={{ fontSize: 16, color: SUB, marginBottom: 40, lineHeight: 1.7 }}>Join hundreds of IT professionals using TierShift Academy to earn real skills and certifications that get them hired.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={onGetStarted} className="btn-primary" style={{ padding: "14px 36px", background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`, border: "none", borderRadius: 10, color: BG, fontSize: 16, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>
                Get Started Free →
              </button>
              <button onClick={onSignIn} className="btn-secondary" style={{ padding: "14px 28px", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT, fontSize: 16, cursor: "pointer", transition: "all 0.2s" }}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "32px 48px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${CYAN}, ${VIOLET})`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: BG }}>TS</div>
          <span style={{ fontSize: 13, color: MUTED }}>TierShift Academy © 2025</span>
        </div>
        <div style={{ fontSize: 12, color: MUTED }}>Built for IT professionals. No fluff, just skills.</div>
      </footer>
    </div>
  );
}
