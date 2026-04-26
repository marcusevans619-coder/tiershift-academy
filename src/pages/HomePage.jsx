export default function HomePage({ onGetStarted, onSignIn }) {
  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#060a12", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"white", textAlign:"center", padding:"2rem", fontFamily:"Outfit,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{ width:"72px", height:"72px", background:"linear-gradient(135deg,#00e5ff,#a78bfa)", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", fontWeight:"900", color:"#060a12", margin:"0 auto 1rem" }}>TS</div>
      <h1 style={{ fontSize:"3rem", margin:0, fontWeight:800 }}>Tier<span style={{ color:"#00e5ff" }}>Shift</span></h1>
      <p style={{ color:"#64748b", fontSize:"1rem", margin:"4px 0 2rem" }}>Academy</p>
      <p style={{ fontSize:"1.2rem", color:"#94a3b8", maxWidth:"480px", marginBottom:"2.5rem", lineHeight:1.6 }}>Level up your IT career with hands-on labs, certifications, and real-world scenarios.</p>
      <div style={{ display:"flex", gap:"1rem", marginBottom:"2.5rem", flexWrap:"wrap", justifyContent:"center" }}>
        {["60+ Interactive Labs","8 Certification Exams","Auto-Graded Badges"].map(f=>(
          <div key={f} style={{ background:"#101828", border:"1px solid #1c2d44", borderRadius:"8px", padding:"0.75rem 1.25rem", color:"#00e5ff", fontSize:"0.9rem", fontWeight:600 }}>{f}</div>
        ))}
      </div>
      <div style={{ display:"flex", gap:"1rem" }}>
        <button onClick={onGetStarted} style={{ background:"linear-gradient(135deg,#00e5ff,#a78bfa)", color:"#060a12", border:"none", padding:"0.85rem 2rem", borderRadius:"8px", fontSize:"1rem", fontWeight:800, cursor:"pointer" }}>Get Started Free</button>
        <button onClick={onSignIn} style={{ background:"transparent", color:"white", border:"1px solid #1c2d44", padding:"0.85rem 2rem", borderRadius:"8px", fontSize:"1rem", cursor:"pointer" }}>Sign In</button>
      </div>
      <p style={{ marginTop:"3rem", color:"#475569", fontSize:"0.8rem" }}>Built for IT professionals. No fluff, just skills.</p>
    </div>
  );
}