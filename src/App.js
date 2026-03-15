import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ─────────────────────────────────────────────────
const C = {
  night: "#060b14",
  deep: "#0b1120",
  surface: "#111a2e",
  surfaceLight: "#162038",
  border: "#1c2a45",
  cyan: "#00e5ff",
  cyanDim: "rgba(0,229,255,0.10)",
  cyanGlow: "rgba(0,229,255,0.30)",
  emerald: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  violet: "#a78bfa",
  slate: "#94a3b8",
  muted: "#64748b",
  text: "#e8edf5",
  white: "#ffffff",
};

const TRACKS = [
  {
    from: "Tier 1",
    to: "Tier 2",
    icon: "▲",
    color: C.cyan,
    duration: "14 weeks",
    modules: 13,
    desc: "Move from reactive troubleshooting to root cause analysis. Master AD/GPO, VLANs, PowerShell scripting, and SIEM log analysis.",
    skills: ["Advanced Networking", "Infrastructure & Identity", "PowerShell Automation", "Security Operations"],
  },
  {
    from: "Tier 2",
    to: "Tier 3",
    icon: "◆",
    color: C.violet,
    duration: "18 weeks",
    modules: 16,
    desc: "Architect solutions instead of fixing them. Design infrastructure, automate at scale, lead incident response, and mentor junior staff.",
    skills: ["Systems Architecture", "Advanced Automation", "Incident Command", "Capacity Planning"],
  },
  {
    from: "Tier 2/3",
    to: "Security Engineer",
    icon: "◉",
    color: C.rose,
    duration: "20 weeks",
    modules: 18,
    desc: "Specialize in offensive and defensive security. Threat hunting, vulnerability management, SOAR playbooks, and compliance frameworks.",
    skills: ["Threat Intelligence", "Vuln Management", "SOAR/SIEM Engineering", "Compliance & GRC"],
  },
  {
    from: "Tier 2/3",
    to: "Network Engineer",
    icon: "⬡",
    color: C.emerald,
    duration: "16 weeks",
    modules: 14,
    desc: "Own the network stack end-to-end. BGP/OSPF routing, SD-WAN, firewall policy design, and wireless architecture.",
    skills: ["Routing Protocols", "SD-WAN & SASE", "Firewall Engineering", "Wireless Design"],
  },
  {
    from: "Tier 2/3",
    to: "Cloud Engineer",
    icon: "☁",
    color: C.amber,
    duration: "18 weeks",
    modules: 15,
    desc: "Build and manage cloud infrastructure. Azure/AWS administration, IaC with Terraform, containerization, and cost optimization.",
    skills: ["Azure / AWS Admin", "Infrastructure as Code", "Containers & K8s", "Cloud Security"],
  },
  {
    from: "Any Level",
    to: "AI Security Specialist",
    icon: "⟁",
    color: "#ff6b9d",
    duration: "12 weeks",
    modules: 10,
    desc: "Emerging specialization. Secure AI/ML pipelines, understand LLM attack surfaces, prompt injection defense, and AI governance.",
    skills: ["AI/ML Security", "LLM Attack Surfaces", "Data Pipeline Defense", "AI Governance"],
  },
];

const FEATURES = [
  {
    title: "Escalation Lab Simulator",
    desc: "Practice with realistic escalated tickets. Each scenario includes the Tier 1 report, why it failed, and a guided Tier 2/3 investigation path with revealable root causes.",
    icon: "▣",
    color: C.cyan,
  },
  {
    title: "Manager Dashboards",
    desc: "Track your team's progress across career tracks. See module completion rates, lab scores, time-to-competency metrics, and identify who's ready for promotion.",
    icon: "◫",
    color: C.violet,
  },
  {
    title: "Custom Content Engine",
    desc: "Add your own lab tickets, internal runbooks, and company-specific procedures. Make the platform reflect your environment, not a generic textbook.",
    icon: "✎",
    color: C.emerald,
  },
  {
    title: "Certification Integration",
    desc: "Every career track maps to industry certifications — CompTIA, Microsoft, Cisco, AWS. Built-in study guides and practice question sets aligned to each module.",
    icon: "△",
    color: C.amber,
  },
  {
    title: "Progress Tracking & Badges",
    desc: "Learners earn badges and visible progression markers. Competency assessments gate advancement to the next tier — no shortcuts, just verified skills.",
    icon: "★",
    color: C.rose,
  },
  {
    title: "Hands-On Lab Environments",
    desc: "Sandboxed virtual labs for Active Directory, DNS, VMware, Linux, and cloud environments. Break things safely. Fix them under guidance.",
    icon: "⚙",
    color: "#ff6b9d",
  },
];

const AUDIENCES = [
  {
    title: "MSP Companies",
    desc: "Accelerate your bench depth. Stop losing Tier 1 techs to competitors — promote them internally with a structured path that proves they're ready.",
    stat: "40%",
    statLabel: "avg. reduction in time-to-competency",
  },
  {
    title: "Internal IT Departments",
    desc: "Standardize skill development across your team. Replace tribal knowledge with documented, repeatable training that scales with your org.",
    stat: "6",
    statLabel: "career tracks from helpdesk to specialist",
  },
  {
    title: "Career Changers",
    desc: "You've got the CompTIA cert but no real-world experience. TierShift fills the gap between textbook knowledge and the skills that get you hired.",
    stat: "106+",
    statLabel: "hours of hands-on lab practice",
  },
  {
    title: "IT Directors & Managers",
    desc: "See exactly who's progressing, who's stuck, and who's ready. Make promotion decisions based on demonstrated competency, not just tenure.",
    stat: "Real-time",
    statLabel: "team analytics & readiness scoring",
  },
];

// ─── Animated counter ──────────────────────────────────────────────
function Counter({ end, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const num = parseInt(end);
          if (isNaN(num)) { setVal(end); return; }
          const step = Math.ceil(num / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= num) { setVal(num); clearInterval(timer); }
            else setVal(current);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref}>
      {typeof val === "number" ? val : end}
      {suffix}
    </span>
  );
}

// ─── Section wrapper with fade-in ──────────────────────────────────
function Section({ children, id, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────
export default function TierShiftLanding() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTrack, setActiveTrack] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Tracks", href: "#tracks" },
    { label: "Features", href: "#features" },
    { label: "For Teams", href: "#audiences" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <div style={{ background: C.night, color: C.text, fontFamily: "'Outfit', 'DM Sans', sans-serif", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: ${C.cyan}40; color: ${C.white}; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes gridMove { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 20px ${C.cyanGlow}; } 50% { box-shadow: 0 0 40px ${C.cyanGlow}, 0 0 80px ${C.cyanDim}; } }
        .track-card:hover { transform: translateY(-4px) !important; border-color: var(--card-color) !important; }
        .feature-card:hover { transform: translateY(-2px) !important; background: ${C.surfaceLight} !important; }
        .nav-link:hover { color: ${C.cyan} !important; }
        .cta-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 30px ${C.cyanGlow} !important; }
        .cta-btn-outline:hover { background: ${C.cyanDim} !important; }
      `}</style>

      {/* ── Navigation ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 40px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrollY > 50 ? `${C.night}ee` : "transparent",
          backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
          borderBottom: scrollY > 50 ? `1px solid ${C.border}` : "1px solid transparent",
          transition: "all 0.3s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 900,
              color: C.night,
            }}
          >
            TS
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Tier<span style={{ color: C.cyan }}>Shift</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link"
              style={{
                color: C.slate,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                transition: "color 0.2s",
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#pricing"
            className="cta-btn"
            style={{
              padding: "8px 20px",
              background: C.cyan,
              color: C.night,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Get Early Access
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 40px 80px",
          overflow: "hidden",
        }}
      >
        {/* Animated grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${C.border}30 1px, transparent 1px), linear-gradient(90deg, ${C.border}30 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            animation: "gridMove 20s linear infinite",
            opacity: 0.4,
          }}
        />
        {/* Gradient orbs */}
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyan}08 0%, transparent 70%)`, filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.violet}08 0%, transparent 70%)`, filter: "blur(40px)" }} />

        <div style={{ position: "relative", textAlign: "center", maxWidth: 800, animation: "slideUp 1s ease forwards" }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              background: C.cyanDim,
              border: `1px solid ${C.cyan}30`,
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              color: C.cyan,
              marginBottom: 28,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            NOW IN DEVELOPMENT — EARLY ACCESS COMING SOON
          </div>
          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: 24,
            }}
          >
            Stop Resetting Passwords.
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Start Engineering Solutions.
            </span>
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.65,
              color: C.slate,
              maxWidth: 620,
              margin: "0 auto 40px",
            }}
          >
            TierShift Academy is the structured training platform that takes IT professionals from
            entry-level support through advanced engineering roles — with hands-on labs, real
            escalation scenarios, and career tracks that actually map to promotions.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="#tracks"
              className="cta-btn"
              style={{
                padding: "14px 32px",
                background: C.cyan,
                color: C.night,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s",
                animation: "glowPulse 3s ease infinite",
              }}
            >
              Explore Career Tracks
            </a>
            <a
              href="#features"
              className="cta-btn-outline"
              style={{
                padding: "14px 32px",
                background: "transparent",
                color: C.text,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              See Platform Features
            </a>
          </div>

          {/* Stat bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 48,
              marginTop: 64,
              paddingTop: 32,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            {[
              { val: "6", label: "Career Tracks" },
              { val: "86", suffix: "+", label: "Training Modules" },
              { val: "500", suffix: "+", label: "Hours of Content" },
              { val: "30", suffix: "+", label: "Lab Scenarios" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: C.cyan,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "-0.03em",
                  }}
                >
                  <Counter end={s.val} suffix={s.suffix || ""} />
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Career Tracks ── */}
      <Section id="tracks" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.cyan, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              Career Tracks
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Six Paths. One Platform.
            </h2>
            <p style={{ fontSize: 17, color: C.slate, maxWidth: 560, margin: "0 auto" }}>
              Every track includes structured modules, hands-on labs, certification alignment, and
              competency assessments that prove you're ready.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TRACKS.map((track, i) => (
              <div
                key={i}
                className="track-card"
                onClick={() => setActiveTrack(i)}
                style={{
                  "--card-color": track.color + "60",
                  padding: "28px 24px",
                  background: activeTrack === i ? C.surfaceLight : C.surface,
                  border: `1px solid ${activeTrack === i ? track.color + "50" : C.border}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {activeTrack === i && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${track.color}, transparent)` }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 24, color: track.color }}>{track.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {track.from} →
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>
                      {track.to}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.6, marginBottom: 16 }}>
                  {track.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                  {track.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: track.color,
                        background: track.color + "12",
                        border: `1px solid ${track.color}25`,
                        borderRadius: 4,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                  <span>{track.modules} modules</span>
                  <span>·</span>
                  <span>{track.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── The TierShift Difference ── */}
      <Section style={{ padding: "100px 40px", background: C.deep }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.violet, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              The TierShift Difference
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Not Another Video Course.
            </h2>
            <p style={{ fontSize: 17, color: C.slate, maxWidth: 600, margin: "0 auto" }}>
              Most training platforms teach you to pass a test. TierShift teaches you to solve
              problems you've never seen before — because that's what Tier 2+ actually is.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ padding: "32px 28px", background: `${C.rose}08`, border: `1px solid ${C.rose}20`, borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.rose, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
                ✕ TYPICAL TRAINING
              </div>
              {[
                "Watch a 40-minute video, take a quiz",
                "Generic scenarios disconnected from real work",
                "No progression tracking or competency validation",
                "Same content for beginners and experienced techs",
                "Manager has no visibility into team readiness",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: C.slate, lineHeight: 1.5, marginBottom: 10 }}>
                  <span style={{ color: C.rose, fontSize: 11, marginTop: 3 }}>—</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "32px 28px", background: C.cyanDim, border: `1px solid ${C.cyan}20`, borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.cyan, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
                ◆ TIERSHIFT ACADEMY
              </div>
              {[
                "Investigate realistic escalated tickets hands-on",
                "Scenarios modeled after actual MSP/enterprise environments",
                "Competency gates — advance only when you demonstrate skill",
                "Customizable content: add your own tickets and runbooks",
                "Manager dashboards with real-time team analytics",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: C.text, lineHeight: 1.5, marginBottom: 10 }}>
                  <span style={{ color: C.cyan, fontSize: 11, marginTop: 3 }}>●</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Features ── */}
      <Section id="features" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.emerald, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              Platform Features
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Built for How Techs Actually Learn.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className="feature-card"
                style={{
                  padding: "28px 24px",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: feat.color + "12",
                    border: `1px solid ${feat.color}25`,
                    borderRadius: 10,
                    fontSize: 20,
                    color: feat.color,
                    marginBottom: 16,
                  }}
                >
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: "-0.01em" }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Audiences ── */}
      <Section id="audiences" style={{ padding: "100px 40px", background: C.deep }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              Who It's For
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-0.03em" }}>
              Built for Every Side of the Org Chart.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
            {AUDIENCES.map((aud, i) => (
              <div
                key={i}
                style={{
                  padding: "32px 28px",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  display: "flex",
                  gap: 24,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 10, letterSpacing: "-0.02em" }}>
                    {aud.title}
                  </h3>
                  <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.6 }}>{aud.desc}</p>
                </div>
                <div
                  style={{
                    minWidth: 110,
                    textAlign: "center",
                    padding: "16px 12px",
                    background: C.cyanDim,
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.cyan, fontFamily: "'JetBrains Mono', monospace" }}>
                    {aud.stat}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.4 }}>
                    {aud.statLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA / Pricing placeholder ── */}
      <Section id="pricing" style={{ padding: "100px 40px" }}>
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            textAlign: "center",
            padding: "64px 48px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${C.cyan}10 0%, transparent 70%)` }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${C.violet}10 0%, transparent 70%)` }} />
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "inline-block",
                padding: "5px 14px",
                background: C.amber + "15",
                border: `1px solid ${C.amber}30`,
                borderRadius: 16,
                fontSize: 12,
                fontWeight: 700,
                color: C.amber,
                marginBottom: 24,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              EARLY ACCESS PROGRAM
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Be the First to TierShift.
            </h2>
            <p style={{ fontSize: 16, color: C.slate, lineHeight: 1.65, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
              We're building TierShift Academy in partnership with real MSPs and IT teams. Join the
              early access program to shape the platform and get founding-member pricing.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="cta-btn"
                style={{
                  padding: "14px 36px",
                  background: C.cyan,
                  color: C.night,
                  border: "none",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onClick={() => alert("Early access form coming soon!")}
              >
                Request Early Access
              </button>
              <button
                className="cta-btn-outline"
                style={{
                  padding: "14px 36px",
                  background: "transparent",
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onClick={() => alert("Demo booking coming soon!")}
              >
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "48px 40px 32px",
          borderTop: `1px solid ${C.border}`,
          marginTop: 60,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 900,
                  color: C.night,
                }}
              >
                TS
              </div>
              <span style={{ fontSize: 16, fontWeight: 800 }}>
                Tier<span style={{ color: C.cyan }}>Shift</span> Academy
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.muted, maxWidth: 400, lineHeight: 1.5 }}>
              The structured training platform for IT professionals ready to level up. From helpdesk to engineering — with proof you're ready.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
              © 2026 TierShift Academy. All rights reserved.
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              Built with purpose. Designed for technicians.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
