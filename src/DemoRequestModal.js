import { useState } from "react";
import { supabase } from "./supabase";

const T = {
  bg:"#060a12", surface:"#0d1520", card:"#111827", border:"#1e2d40",
  cyan:"#00e5ff", violet:"#a78bfa", text:"#e8edf5", sub:"#94a3b8", muted:"#64748b",
  success:"#34d399", danger:"#ef4444",
};

export default function DemoRequestModal({ onClose }) {
  const [form, setForm] = useState({ name:"", email:"", company:"", department:"" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from("demo_requests")
        .insert([{ name: form.name, email: form.email, company: form.company, department: form.department }]);
      if (err) throw err;
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:"100%", padding:"11px 14px",
    background:T.surface, border:`1px solid ${T.border}`,
    borderRadius:8, color:T.text, fontSize:14,
    boxSizing:"border-box", outline:"none",
    fontFamily:"inherit",
  };

  const labelStyle = {
    display:"block", color:T.sub,
    fontSize:12, fontWeight:600,
    marginBottom:6, letterSpacing:"0.05em",
    textTransform:"uppercase",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:2000,
        background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:T.card, border:`1px solid ${T.border}`,
          borderRadius:20, width:"100%", maxWidth:480,
          boxShadow:`0 24px 80px rgba(0,0,0,0.8), 0 0 40px ${T.cyan}15`,
          overflow:"hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding:"24px 28px 0", position:"relative",
          borderBottom:`1px solid ${T.border}`, paddingBottom:20,
        }}>
          <button
            onClick={onClose}
            style={{
              position:"absolute", top:16, right:16,
              background:"transparent", border:`1px solid ${T.border}`,
              borderRadius:8, color:T.muted, width:32, height:32,
              cursor:"pointer", fontSize:18, lineHeight:1,
            }}
          >'\u00D7'</button>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <div style={{
              width:40, height:40,
              background:`linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
              borderRadius:10, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:14, fontWeight:900, color:T.bg,
            }}>TS</div>
            <div>
              <div style={{ fontSize:11, color:T.cyan, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"monospace" }}>TierShift Academy</div>
              <div style={{ fontSize:18, fontWeight:800, color:T.text }}>Request a Demo</div>
            </div>
          </div>
          <p style={{ fontSize:13, color:T.muted, margin:0 }}>
            Fill in your details and we will reach out within 24 hours to schedule your walkthrough.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding:"24px 28px" }}>
          {submitted ? (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>'\uD83C\uDF89'</div>
              <h3 style={{ color:T.success, fontSize:20, fontWeight:800, marginBottom:10 }}>Request Received!</h3>
              <p style={{ color:T.sub, fontSize:14, lineHeight:1.7, marginBottom:24 }}>
                Thanks <strong style={{ color:T.text }}>{form.name}</strong>! We will be in touch at <strong style={{ color:T.cyan }}>{form.email}</strong> within 24 hours to schedule your demo.
              </p>
              <div style={{
                padding:"14px 16px", background:`${T.cyan}10`,
                border:`1px solid ${T.cyan}30`, borderRadius:10,
                fontSize:13, color:T.sub, marginBottom:24, textAlign:"left",
              }}>
                <div style={{ fontWeight:700, color:T.cyan, marginBottom:6, fontFamily:"monospace", fontSize:11, textTransform:"uppercase" }}>What to Expect</div>
                {["20-minute walkthrough of the platform","We will customize it around your team size and needs","See the manager dashboard and lab experience live","No hard sell - just an honest look at the product"].map((item,i) => (
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:4 }}>
                    <span style={{ color:T.success }}>(check)</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                style={{
                  padding:"11px 28px",
                  background:`linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
                  border:"none", borderRadius:10,
                  color:T.bg, fontSize:14, fontWeight:800, cursor:"pointer",
                }}
              >Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding:"10px 14px", background:`${T.danger}15`,
                  border:`1px solid ${T.danger}40`, borderRadius:8,
                  color:T.danger, fontSize:13, marginBottom:16,
                }}>
                  {error}
                </div>
              )}

              {/* Name */}
              <div style={{ marginBottom:16 }}>
                <label style={labelStyle}>Full Name <span style={{ color:T.danger }}>*</span></label>
                <input
                  name="name" type="text" required
                  placeholder="Marcus Evans"
                  value={form.name} onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom:16 }}>
                <label style={labelStyle}>Work Email <span style={{ color:T.danger }}>*</span></label>
                <input
                  name="email" type="email" required
                  placeholder="you@company.com"
                  value={form.email} onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Company */}
              <div style={{ marginBottom:16 }}>
                <label style={labelStyle}>Company / Organization <span style={{ color:T.danger }}>*</span></label>
                <input
                  name="company" type="text" required
                  placeholder="Acme Corp"
                  value={form.company} onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Department */}
              <div style={{ marginBottom:24 }}>
                <label style={labelStyle}>Department / Team <span style={{ color:T.muted, fontWeight:400, textTransform:"none" }}>(optional)</span></label>
                <input
                  name="department" type="text"
                  placeholder="IT Support, Help Desk, Operations..."
                  value={form.department} onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width:"100%", padding:"13px",
                  background:loading?"#1e2d40":`linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
                  border:"none", borderRadius:10,
                  color:loading?T.muted:T.bg,
                  fontSize:15, fontWeight:800, cursor:loading?"not-allowed":"pointer",
                  transition:"all 0.2s",
                }}
              >
                {loading ? "Submitting..." : "Request Demo >"}
              </button>

              <p style={{ textAlign:"center", fontSize:12, color:T.muted, marginTop:12 }}>
                No spam. No hard sell. Just a 20-minute walkthrough.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}