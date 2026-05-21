import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const T = {
  bg:"#060a12",surface:"#101828",card:"#131e30",border:"#1c2d44",
  cyan:"#00e5ff",violet:"#a78bfa",rose:"#fb7185",emerald:"#34d399",
  amber:"#fbbf24",text:"#e8edf5",muted:"#64748b",
  success:"#10b981",warning:"#f59e0b",danger:"#ef4444",
};
const dim=(c,a=0.10)=>c+Math.round(a*255).toString(16).padStart(2,"0");

// ============================================
// BADGE NOTIFICATION TOAST
// ============================================
function BadgeToast({ badges, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!badges || badges.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
      {badges.map((badge, idx) => (
        <div
          key={idx}
          style={{
            background: `linear-gradient(135deg, ${T.card} 0%, ${dim(T.amber, 0.2)} 100%)`,
            padding: "16px 24px",
            borderRadius: 12,
            border: `2px solid ${T.amber}`,
            boxShadow: `0 8px 32px ${dim(T.amber, 0.3)}`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            animation: "badgeSlideIn 0.3s ease-out"
          }}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: dim(T.amber, 0.2),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24
          }}>
            🏆
          </div>
          <div>
            <div style={{ color: T.amber, fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
              Badge Earned!
            </div>
            <div style={{ color: T.text, fontSize: 16, fontWeight: 700 }}>
              {badge}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: T.muted,
              cursor: "pointer",
              fontSize: 18,
              marginLeft: 8
            }}
          >
            ×
          </button>
        </div>
      ))}
      <style>{`
        @keyframes badgeSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function LabsPage({ user, onLabClick }) {
  const [labs, setLabs] = useState([]);
  const [userLabs, setUserLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => { const r = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);

  useEffect(() => {
    const fetchLabs = async () => {
      const { data: labsData } = await supabase.from("labs").select("*").eq("is_active", true).order("sort_order");
      setLabs(labsData || []);
      const { data: userLabsData } = await supabase.from("user_labs").select("*").eq("user_id", user.id);
      setUserLabs(userLabsData || []);
      setLoading(false);
    };
    fetchLabs();
  }, [user]);

  const typeIcons = { terminal: ">", scenario: "?", ticket: "T", config: "C", external: "E" };
  const typeColors = { terminal: T.cyan, scenario: T.violet, ticket: T.amber, config: T.emerald, external: T.rose };
  const diffColors = { beginner: T.success, intermediate: T.amber, advanced: T.danger };
  const filteredLabs = filter === "all" ? labs : labs.filter(l => l.lab_type === filter);

  if (loading) return <div style={{color:T.muted}}>Loading labs...</div>;

  return (
    <div>
      <h1 style={{color:T.text,fontSize:28,fontWeight:800,marginBottom:8}}>Lab Simulator</h1>
      <p style={{color:T.muted,marginBottom:24}}>Practice real-world IT scenarios</p>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {["all","terminal","scenario","ticket","config","external"].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{padding:"8px 16px",background:filter===t?dim(T.cyan,0.15):"transparent",border:"1px solid "+(filter===t?T.cyan:T.border),borderRadius:20,color:filter===t?T.cyan:T.muted,cursor:"pointer",fontSize:13,textTransform:"capitalize"}}>{t === "all" ? "All Labs" : t}</button>
        ))}
      </div>
      {filteredLabs.length === 0 ? (
        <div style={{background:T.card,padding:40,borderRadius:12,textAlign:"center"}}>
          <h3 style={{color:T.text}}>No labs available</h3>
          <p style={{color:T.muted}}>Check back soon!</p>
        </div>
      ) : (
        <div style={{display:"grid",gap:16}}>
          {filteredLabs.map(lab => {
            const completed = userLabs.some(ul => ul.lab_id === lab.id && ul.completed_at);
            return (
              <div key={lab.id} onClick={() => onLabClick(lab)} style={{background:T.card,padding:isMobile?16:24,borderRadius:12,border:"1px solid "+T.border,cursor:"pointer",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{width:48,height:48,borderRadius:12,background:dim(typeColors[lab.lab_type],0.15),display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:typeColors[lab.lab_type]}}>{typeIcons[lab.lab_type]}</div>
                <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <h3 style={{color:T.text,margin:0}}>{lab.title}</h3>
                    {completed && <span style={{color:T.success,fontSize:12}}>Done</span>}
                  </div>
                  <p style={{color:T.muted,margin:0,fontSize:14}}>{lab.description}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <span style={{display:"block",padding:"4px 12px",background:dim(diffColors[lab.difficulty],0.15),color:diffColors[lab.difficulty],borderRadius:20,fontSize:11,fontWeight:600,marginBottom:8}}>{lab.difficulty}</span>
                  <span style={{color:T.muted,fontSize:12}}>{lab.estimated_minutes} min</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Config form definitions for different config types
const CONFIG_FORMS = {
  firewall: {
    title: "Add Firewall Rule",
    fields: [
      { name: "name", label: "Rule name", type: "text", placeholder: "Rule name" },
      { name: "port", label: "Port", type: "number", placeholder: "Port" },
      { name: "protocol", label: "Protocol", type: "select", options: ["TCP", "UDP"] },
      { name: "action", label: "Action", type: "select", options: ["ALLOW", "BLOCK"] }
    ],
    defaultValues: { name: "", port: "", protocol: "TCP", action: "ALLOW" },
    itemLabel: (item) => item.name,
    itemDetails: (item) => "Port " + item.port + "/" + item.protocol,
    itemBadge: (item) => ({ text: item.action, color: item.action === "ALLOW" ? T.success : T.danger })
  },
  dns: {
    title: "Add DNS Record",
    fields: [
      { name: "name", label: "Record name", type: "text", placeholder: "www, mail, etc." },
      { name: "type", label: "Type", type: "select", options: ["A", "AAAA", "CNAME", "MX", "TXT"] },
      { name: "value", label: "Value", type: "text", placeholder: "IP or hostname" },
      { name: "priority", label: "Priority (MX only)", type: "number", placeholder: "10" }
    ],
    defaultValues: { name: "", type: "A", value: "", priority: "" },
    itemLabel: (item) => item.name + " (" + item.type + ")",
    itemDetails: (item) => item.value + (item.priority ? " (priority: " + item.priority + ")" : ""),
    itemBadge: (item) => ({ text: item.type, color: T.cyan })
  },
  vlan: {
    title: "Add VLAN",
    fields: [
      { name: "id", label: "VLAN ID", type: "number", placeholder: "10, 20, 30..." },
      { name: "name", label: "VLAN Name", type: "text", placeholder: "Management, Guest..." },
      { name: "subnet", label: "Subnet", type: "text", placeholder: "192.168.10.0/24" }
    ],
    defaultValues: { id: "", name: "", subnet: "" },
    itemLabel: (item) => "VLAN " + item.id + ": " + item.name,
    itemDetails: (item) => item.subnet,
    itemBadge: (item) => ({ text: "ID " + item.id, color: T.violet })
  },
  router: {
    title: "Add Interface",
    fields: [
      { name: "name", label: "Interface", type: "text", placeholder: "GigabitEthernet0/0" },
      { name: "ip", label: "IP Address", type: "text", placeholder: "192.168.1.1" },
      { name: "subnet", label: "Subnet Mask", type: "text", placeholder: "255.255.255.0" },
      { name: "status", label: "Status", type: "select", options: ["up", "down"] }
    ],
    defaultValues: { name: "", ip: "", subnet: "", status: "up" },
    itemLabel: (item) => item.name,
    itemDetails: (item) => item.ip + " / " + item.subnet,
    itemBadge: (item) => ({ text: item.status.toUpperCase(), color: item.status === "up" ? T.success : T.danger })
  },
  access_control: {
    title: "Add Access Rule",
    fields: [
      { name: "name", label: "Rule Name", type: "text", placeholder: "Admin Full Access" },
      { name: "role", label: "Role", type: "text", placeholder: "admin, developer, intern" },
      { name: "resource", label: "Resource", type: "text", placeholder: "* or specific resource" },
      { name: "permission", label: "Permission", type: "select", options: ["full", "read_write", "read", "none"] }
    ],
    defaultValues: { name: "", role: "", resource: "", permission: "read" },
    itemLabel: (item) => item.name,
    itemDetails: (item) => item.role + " -> " + item.resource,
    itemBadge: (item) => ({ text: item.permission, color: item.permission === "full" ? T.success : item.permission === "none" ? T.danger : T.amber })
  },
  s3_bucket: {
    title: "Add S3 Policy",
    fields: [
      { name: "name", label: "Policy Name", type: "text", placeholder: "Block Public Access" },
      { name: "setting", label: "Setting", type: "text", placeholder: "BlockPublicAcls" },
      { name: "value", label: "Value", type: "text", placeholder: "true, false, AES256, etc." }
    ],
    defaultValues: { name: "", setting: "", value: "" },
    itemLabel: (item) => item.name,
    itemDetails: (item) => item.setting + " = " + item.value,
    itemBadge: (item) => ({ text: "S3", color: T.amber })
  },
  group_policy: {
    title: "Add Group Policy Setting",
    fields: [
      { name: "name", label: "Policy Name", type: "text", placeholder: "Password Minimum Length" },
      { name: "setting", label: "Setting Key", type: "text", placeholder: "MinPasswordLength" },
      { name: "value", label: "Value", type: "text", placeholder: "12" }
    ],
    defaultValues: { name: "", setting: "", value: "" },
    itemLabel: (item) => item.name,
    itemDetails: (item) => item.setting + ": " + item.value,
    itemBadge: (item) => ({ text: "GPO", color: T.violet })
  },
  linux_permissions: {
    title: "Add Permission Rule",
    fields: [
      { name: "path", label: "Path", type: "text", placeholder: "/var/www" },
      { name: "owner", label: "Owner", type: "text", placeholder: "www-data" },
      { name: "group", label: "Group", type: "text", placeholder: "www-data" },
      { name: "mode", label: "Mode", type: "text", placeholder: "755" }
    ],
    defaultValues: { path: "", owner: "", group: "", mode: "" },
    itemLabel: (item) => item.path,
    itemDetails: (item) => item.owner + ":" + item.group + " " + item.mode,
    itemBadge: (item) => ({ text: item.mode, color: T.emerald })
  },
  ai_access: {
    title: "Add AI Access Policy",
    fields: [
      { name: "name", label: "Policy Name", type: "text", placeholder: "Rate Limit" },
      { name: "setting", label: "Setting", type: "text", placeholder: "requests_per_minute" },
      { name: "value", label: "Value", type: "text", placeholder: "60" }
    ],
    defaultValues: { name: "", setting: "", value: "" },
    itemLabel: (item) => item.name,
    itemDetails: (item) => item.setting + " = " + item.value,
    itemBadge: (item) => ({ text: "AI", color: T.rose })
  }
};

export function LabViewer({ lab, user, onBack }) {
  const [labData, setLabData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [configItems, setConfigItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [configResult, setConfigResult] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let data = null;
      if (lab.lab_type === "terminal") {
        const { data: d } = await supabase.from("lab_terminal_commands").select("*").eq("lab_id", lab.id).order("step_number");
        data = d;
      } else if (lab.lab_type === "scenario") {
        const { data: d } = await supabase.from("lab_scenarios").select("*").eq("lab_id", lab.id).order("step_number");
        data = d;
      } else if (lab.lab_type === "ticket") {
        const { data: d } = await supabase.from("lab_tickets").select("*").eq("lab_id", lab.id);
        data = d;
      } else if (lab.lab_type === "config") {
        const { data: d } = await supabase.from("lab_configs").select("*").eq("lab_id", lab.id);
        data = d;
      }
      setLabData(data || []);
      setLoading(false);
    };
    fetchData();
  }, [lab]);

  const handleComplete = async () => {
    setCompleting(true);
    
    // Mark lab as complete
    await supabase.from("user_labs").upsert(
      { user_id: user.id, lab_id: lab.id, completed_at: new Date().toISOString(), score: 100 }, 
      { onConflict: "user_id,lab_id" }
    );

    // Check if this lab is part of a learning path and award badges
    try {
      // Find which learning path item this lab belongs to
      const { data: pathItem } = await supabase
        .from("learning_path_items")
        .select("*, learning_paths!inner(slug)")
        .eq("item_id", lab.id)
        .eq("item_type", "lab")
        .single();

      if (pathItem) {
        // Mark the learning path item as complete
        const { data: existingUserItem } = await supabase
          .from("user_learning_path_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("learning_path_item_id", pathItem.id)
          .single();

        if (!existingUserItem) {
          await supabase
            .from("user_learning_path_items")
            .insert({
              user_id: user.id,
              learning_path_id: pathItem.learning_path_id,
              learning_path_item_id: pathItem.id,
              completed_at: new Date().toISOString()
            });
        } else if (!existingUserItem.completed_at) {
          await supabase
            .from("user_learning_path_items")
            .update({ completed_at: new Date().toISOString() })
            .eq("id", existingUserItem.id);
        }

        // Update learning path progress
        const { data: allItems } = await supabase
          .from("learning_path_items")
          .select("id")
          .eq("learning_path_id", pathItem.learning_path_id);
        
        const { data: completedItems } = await supabase
          .from("user_learning_path_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("learning_path_id", pathItem.learning_path_id)
          .not("completed_at", "is", null);

        const totalItems = allItems?.length || 1;
        const completedCount = (completedItems?.length || 0) + (existingUserItem?.completed_at ? 0 : 1);
        const progress = Math.round((completedCount / totalItems) * 100);

        await supabase
          .from("user_learning_paths")
          .update({ 
            progress_percentage: progress,
            current_step: pathItem.step_number + 1,
            completed_at: progress === 100 ? new Date().toISOString() : null
          })
          .eq("user_id", user.id)
          .eq("learning_path_id", pathItem.learning_path_id);

        // Award badges using the RPC function
        const pathSlug = pathItem.learning_paths?.slug;
        if (pathSlug) {
          const { data: badgesAwarded } = await supabase
            .rpc("award_path_badges", {
              p_user_id: user.id,
              p_path_slug: pathSlug,
              p_step_completed: pathItem.step_number
            });

          if (badgesAwarded && badgesAwarded.length > 0) {
            setEarnedBadges(badgesAwarded);
            // Don't navigate away immediately - show badges first
            setCompleting(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error checking badges:", err);
    }

    setCompleting(false);
    onBack();
  };

  // Close badge toast and navigate back
  const closeBadgeToast = () => {
    setEarnedBadges([]);
    onBack();
  };

  if (loading) return <div style={{color:T.muted}}>Loading lab...</div>;

  // Terminal Lab
  if (lab.lab_type === "terminal") {
    const cmd = labData[step];
    const handleSubmit = (e) => {
      e.preventDefault();
      const newHist = [...history, { type: "input", text: (cmd?.prompt || "$") + " " + input }];
      if (input.trim().toLowerCase() === cmd?.expected_command?.toLowerCase()) {
        newHist.push({ type: "output", text: cmd.expected_output });
        newHist.push({ type: "success", text: "Correct!" });
        setHistory(newHist);
        if (step < labData.length - 1) setTimeout(() => setStep(step + 1), 500);
        else setDone(true);
      } else {
        newHist.push({ type: "error", text: "Hint: " + cmd?.hint });
        setHistory(newHist);
      }
      setInput("");
    };

    if (done) return (
      <div style={{textAlign:"center",padding:40}}>
        {earnedBadges.length > 0 && <BadgeToast badges={earnedBadges} onClose={closeBadgeToast} />}
        <div style={{fontSize:48,color:T.success}}>Lab Complete!</div>
        <button onClick={handleComplete} disabled={completing} style={{marginTop:24,padding:"12px 24px",background:T.cyan,color:T.bg,border:"none",borderRadius:8,fontWeight:600,cursor:completing?"wait":"pointer",opacity:completing?0.7:1}}>
          {completing ? "Saving..." : "Continue"}
        </button>
      </div>
    );

    return (
      <div>
        {earnedBadges.length > 0 && <BadgeToast badges={earnedBadges} onClose={closeBadgeToast} />}
        <button onClick={onBack} style={{background:"transparent",border:"none",color:T.cyan,cursor:"pointer",marginBottom:16}}>Back to Labs</button>
        <h1 style={{color:T.text}}>{lab.title}</h1>
        <p style={{color:T.muted,marginBottom:16}}>{lab.description}</p>
        <div style={{marginBottom:16}}><span style={{color:T.muted}}>Step {step + 1} of {labData.length}</span></div>
        <div style={{background:"#0d1117",borderRadius:8,padding:16,marginBottom:16,minHeight:250,fontFamily:"monospace",fontSize:13}}>
          {history.map((h, i) => <div key={i} style={{marginBottom:4,color:h.type==="error"?T.danger:h.type==="success"?T.success:h.type==="output"?T.muted:T.text,whiteSpace:"pre-wrap"}}>{h.text}</div>)}
          <form onSubmit={handleSubmit} style={{display:"flex"}}><span style={{color:T.cyan}}>{cmd?.prompt || "$"} </span><input value={input} onChange={e=>setInput(e.target.value)} style={{flex:1,background:"transparent",border:"none",color:T.text,fontFamily:"inherit",outline:"none"}} autoFocus/></form>
        </div>
        <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:8,padding:16}}><strong style={{color:T.text}}>Task:</strong><p style={{color:T.muted,margin:"8px 0 0"}}>{cmd?.hint}</p></div>
      </div>
    );
  }

  // Scenario Lab
  if (lab.lab_type === "scenario") {
    const scenario = labData[step];
    const options = typeof scenario?.options === "string" ? JSON.parse(scenario.options) : scenario?.options;

    const handleSelect = (id) => {
      setSelected(id);
      const correct = id === scenario.correct_option_id;
      if (correct) setScore(score + 1);
      setFeedback({ correct, text: correct ? scenario.feedback_correct : scenario.feedback_incorrect });
    };

    const handleNext = () => {
      if (step < labData.length - 1) { setStep(step + 1); setSelected(null); setFeedback(null); }
      else setDone(true);
    };

    if (done) return (
      <div style={{textAlign:"center",padding:40}}>
        {earnedBadges.length > 0 && <BadgeToast badges={earnedBadges} onClose={closeBadgeToast} />}
        <div style={{fontSize:48,color:T.success}}>{Math.round((score/labData.length)*100)}%</div>
        <p style={{color:T.muted}}>{score} of {labData.length} correct</p>
        <button onClick={handleComplete} disabled={completing} style={{marginTop:24,padding:"12px 24px",background:T.cyan,color:T.bg,border:"none",borderRadius:8,fontWeight:600,cursor:completing?"wait":"pointer",opacity:completing?0.7:1}}>
          {completing ? "Saving..." : "Continue"}
        </button>
      </div>
    );

    return (
      <div>
        {earnedBadges.length > 0 && <BadgeToast badges={earnedBadges} onClose={closeBadgeToast} />}
        <button onClick={onBack} style={{background:"transparent",border:"none",color:T.cyan,cursor:"pointer",marginBottom:16}}>Back to Labs</button>
        <h1 style={{color:T.text}}>{lab.title}</h1>
        <p style={{color:T.muted,marginBottom:16}}>{lab.description}</p>
        <div style={{marginBottom:16}}><span style={{color:T.muted}}>Step {step + 1} of {labData.length}</span></div>
        <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:24,marginBottom:24}}><p style={{color:T.text,fontSize:16,lineHeight:1.6}}>{scenario?.scenario_text}</p></div>
        <div style={{display:"grid",gap:12,marginBottom:24}}>
          {options?.map(opt => <button key={opt.id} onClick={() => !feedback && handleSelect(opt.id)} disabled={!!feedback} style={{padding:16,background:selected===opt.id?(feedback?.correct?dim(T.success,0.15):dim(T.danger,0.15)):T.surface,border:"1px solid "+(selected===opt.id?(feedback?.correct?T.success:T.danger):T.border),borderRadius:8,color:T.text,textAlign:"left",cursor:feedback?"default":"pointer"}}>{opt.text}</button>)}
        </div>
        {feedback && <div style={{background:feedback.correct?dim(T.success,0.1):dim(T.danger,0.1),borderRadius:8,padding:16,marginBottom:24}}><strong style={{color:feedback.correct?T.success:T.danger}}>{feedback.correct ? "Correct!" : "Not quite."}</strong><p style={{color:T.text,margin:"8px 0 0"}}>{feedback.text}</p></div>}
        {feedback && <button onClick={handleNext} style={{padding:"12px 24px",background:T.cyan,color:T.bg,border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>{step < labData.length - 1 ? "Next" : "Finish"}</button>}
      </div>
    );
  }

  // Ticket Lab
  if (lab.lab_type === "ticket") {
    const ticket = labData[step];
    const options = typeof ticket?.resolution_options === "string" ? JSON.parse(ticket.resolution_options) : ticket?.resolution_options;
    const priorityColors = { low: T.muted, medium: T.amber, high: T.warning, critical: T.danger };

    const handleSelect = (id) => {
      setSelected(id);
      const correct = id === ticket.correct_resolution;
      if (correct) setScore(score + 1);
      setFeedback({ correct });
    };

    const handleNext = () => {
      if (step < labData.length - 1) { setStep(step + 1); setSelected(null); setFeedback(null); }
      else setDone(true);
    };

    if (done) return (
      <div style={{textAlign:"center",padding:40}}>
        {earnedBadges.length > 0 && <BadgeToast badges={earnedBadges} onClose={closeBadgeToast} />}
        <div style={{fontSize:48,color:T.success}}>{Math.round((score/labData.length)*100)}%</div>
        <p style={{color:T.muted}}>{score} of {labData.length} resolved correctly</p>
        <button onClick={handleComplete} disabled={completing} style={{marginTop:24,padding:"12px 24px",background:T.cyan,color:T.bg,border:"none",borderRadius:8,fontWeight:600,cursor:completing?"wait":"pointer",opacity:completing?0.7:1}}>
          {completing ? "Saving..." : "Continue"}
        </button>
      </div>
    );

    return (
      <div>
        {earnedBadges.length > 0 && <BadgeToast badges={earnedBadges} onClose={closeBadgeToast} />}
        <button onClick={onBack} style={{background:"transparent",border:"none",color:T.cyan,cursor:"pointer",marginBottom:16}}>Back to Labs</button>
        <h1 style={{color:T.text}}>{lab.title}</h1>
        <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:24,marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <span style={{color:T.cyan,fontFamily:"monospace"}}>{ticket?.ticket_number}</span>
            <span style={{padding:"4px 12px",background:dim(priorityColors[ticket?.priority]||T.muted,0.15),color:priorityColors[ticket?.priority]||T.muted,borderRadius:20,fontSize:12,fontWeight:600,textTransform:"uppercase"}}>{ticket?.priority}</span>
          </div>
          <h3 style={{color:T.text,marginBottom:8}}>{ticket?.title}</h3>
          <p style={{color:T.muted,fontSize:13,marginBottom:16}}>From: {ticket?.user_name}</p>
          <div style={{background:T.surface,borderRadius:8,padding:16}}><p style={{color:T.text,lineHeight:1.6,margin:0}}>{ticket?.description}</p></div>
        </div>
        <h4 style={{color:T.text,marginBottom:12}}>How do you respond?</h4>
        <div style={{display:"grid",gap:12,marginBottom:24}}>
          {options?.map(opt => <button key={opt.id} onClick={() => !feedback && handleSelect(opt.id)} disabled={!!feedback} style={{padding:16,background:selected===opt.id?(feedback?.correct?dim(T.success,0.15):dim(T.danger,0.15)):T.surface,border:"1px solid "+(selected===opt.id?(feedback?.correct?T.success:T.danger):T.border),borderRadius:8,color:T.text,textAlign:"left",cursor:feedback?"default":"pointer"}}>{opt.text}</button>)}
        </div>
        {feedback && <div style={{background:feedback.correct?dim(T.success,0.1):dim(T.danger,0.1),borderRadius:8,padding:16,marginBottom:24}}><strong style={{color:feedback.correct?T.success:T.danger}}>{feedback.correct ? "Good choice!" : "There was a better option."}</strong></div>}
        {feedback && <button onClick={handleNext} style={{padding:"12px 24px",background:T.cyan,color:T.bg,border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>{step < labData.length - 1 ? "Next Ticket" : "Finish"}</button>}
      </div>
    );
  }

  // Config Lab - Dynamic form based on config type
  if (lab.lab_type === "config") {
    const config = labData?.[0];
    const configType = config?.config_type || "firewall";
    const formConfig = CONFIG_FORMS[configType] || CONFIG_FORMS.firewall;
    const targetState = typeof config?.target_state === "string" ? JSON.parse(config.target_state) : config?.target_state;
    const instructions = config?.instructions || "Configure the settings to match the requirements.";

    // Initialize newItem with default values if empty
    if (Object.keys(newItem).length === 0 && formConfig.defaultValues) {
      setNewItem(formConfig.defaultValues);
    }

    const addItem = () => {
      const hasRequiredFields = formConfig.fields.slice(0, 2).every(f => newItem[f.name]);
      if (!hasRequiredFields) return;
      
      const itemToAdd = { ...newItem };
      if (itemToAdd.port) itemToAdd.port = parseInt(itemToAdd.port);
      if (itemToAdd.id) itemToAdd.id = parseInt(itemToAdd.id);
      if (itemToAdd.priority) itemToAdd.priority = parseInt(itemToAdd.priority);
      
      setConfigItems([...configItems, itemToAdd]);
      setNewItem(formConfig.defaultValues);
      setConfigResult(null);
    };

    const removeItem = (idx) => {
      setConfigItems(configItems.filter((_, i) => i !== idx));
      setConfigResult(null);
    };

    const checkConfig = () => {
      const targetItems = targetState?.rules || targetState?.records || targetState?.vlans || targetState?.interfaces || targetState?.permissions || targetState?.policies || [];
      let correct = 0;
      let fb = [];

      targetItems.forEach(target => {
        let match = false;
        
        if (configType === "firewall") {
          match = configItems.some(item => item.port === target.port && item.protocol === target.protocol && item.action === target.action);
          fb.push({ text: target.action + " port " + target.port + "/" + target.protocol, ok: match });
        } else if (configType === "dns") {
          match = configItems.some(item => item.name === target.name && item.type === target.type && item.value === target.value);
          fb.push({ text: target.type + " record: " + target.name + " -> " + target.value, ok: match });
        } else if (configType === "vlan") {
          match = configItems.some(item => parseInt(item.id) === target.id && item.name === target.name);
          fb.push({ text: "VLAN " + target.id + ": " + target.name, ok: match });
        } else if (configType === "router") {
          match = configItems.some(item => item.name === target.name && item.ip === target.ip && item.status === target.status);
          fb.push({ text: target.name + ": " + target.ip, ok: match });
        } else if (configType === "access_control") {
          match = configItems.some(item => item.role === target.role && item.permission === target.permission);
          fb.push({ text: target.role + " -> " + target.permission, ok: match });
        } else if (configType === "linux_permissions") {
          match = configItems.some(item => item.path === target.path && item.mode === target.mode);
          fb.push({ text: target.path + " (" + target.mode + ")", ok: match });
        } else {
          match = configItems.some(item => item.setting === target.setting && item.value === target.value);
          fb.push({ text: target.setting + " = " + target.value, ok: match });
        }
        
        if (match) correct++;
      });

      const allCorrect = correct === targetItems.length;
      setConfigResult({ allCorrect, feedback: fb, score: Math.round((correct / targetItems.length) * 100) });
      if (allCorrect) setDone(true);
    };

    if (done) return (
      <div style={{textAlign:"center",padding:40}}>
        {earnedBadges.length > 0 && <BadgeToast badges={earnedBadges} onClose={closeBadgeToast} />}
        <div style={{fontSize:48,color:T.success}}>Configuration Complete!</div>
        <p style={{color:T.muted}}>All settings configured correctly</p>
        <button onClick={handleComplete} disabled={completing} style={{marginTop:24,padding:"12px 24px",background:T.cyan,color:T.bg,border:"none",borderRadius:8,fontWeight:600,cursor:completing?"wait":"pointer",opacity:completing?0.7:1}}>
          {completing ? "Saving..." : "Continue"}
        </button>
      </div>
    );

    return (
      <div>
        {earnedBadges.length > 0 && <BadgeToast badges={earnedBadges} onClose={closeBadgeToast} />}
        <button onClick={onBack} style={{background:"transparent",border:"none",color:T.cyan,cursor:"pointer",marginBottom:16}}>Back to Labs</button>
        <h1 style={{color:T.text}}>{lab.title}</h1>
        <p style={{color:T.muted,marginBottom:24}}>{lab.description}</p>
        
        <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:24,marginBottom:24}}>
          <h3 style={{color:T.text,marginBottom:12}}>Instructions</h3>
          <p style={{color:T.muted,whiteSpace:"pre-line"}}>{instructions}</p>
        </div>

        <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:24,marginBottom:24}}>
          <h3 style={{color:T.text,marginBottom:16}}>{formConfig.title}</h3>
          <div style={{display:"grid",gridTemplateColumns:formConfig.fields.map(() => "1fr").join(" ") + " auto",gap:12,alignItems:"center"}}>
            {formConfig.fields.map(field => (
              field.type === "select" ? (
                <select key={field.name} value={newItem[field.name] || ""} onChange={e => setNewItem({...newItem, [field.name]: e.target.value})} style={{padding:12,background:T.surface,border:"1px solid "+T.border,borderRadius:8,color:T.text}}>
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input key={field.name} type={field.type} placeholder={field.placeholder} value={newItem[field.name] || ""} onChange={e => setNewItem({...newItem, [field.name]: e.target.value})} style={{padding:12,background:T.surface,border:"1px solid "+T.border,borderRadius:8,color:T.text}} />
              )
            ))}
            <button onClick={addItem} style={{padding:"12px 20px",background:T.cyan,color:T.bg,border:"none",borderRadius:8,fontWeight:600,cursor:"pointer"}}>Add</button>
          </div>
        </div>

        <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:24,marginBottom:24}}>
          <h3 style={{color:T.text,marginBottom:16}}>Current Configuration ({configItems.length})</h3>
          {configItems.length === 0 ? (
            <p style={{color:T.muted}}>No items configured yet. Add items above.</p>
          ) : (
            <div style={{display:"grid",gap:8}}>
              {configItems.map((item, idx) => {
                const badge = formConfig.itemBadge(item);
                return (
                  <div key={idx} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:12,background:T.surface,borderRadius:8}}>
                    <div>
                      <span style={{color:T.text,fontWeight:600}}>{formConfig.itemLabel(item)}</span>
                      <span style={{color:T.muted,marginLeft:12}}>{formConfig.itemDetails(item)}</span>
                      <span style={{marginLeft:12,padding:"2px 8px",background:dim(badge.color,0.15),color:badge.color,borderRadius:4,fontSize:11,fontWeight:600}}>{badge.text}</span>
                    </div>
                    <button onClick={() => removeItem(idx)} style={{background:"transparent",border:"none",color:T.danger,cursor:"pointer",fontSize:18}}>x</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {configResult && (
          <div style={{background:configResult.allCorrect?dim(T.success,0.1):dim(T.danger,0.1),border:"1px solid "+(configResult.allCorrect?T.success:T.danger),borderRadius:12,padding:24,marginBottom:24}}>
            <h3 style={{color:configResult.allCorrect?T.success:T.danger,marginBottom:12}}>{configResult.allCorrect ? "All items correct!" : "Score: " + configResult.score + "%"}</h3>
            <div style={{display:"grid",gap:8}}>
              {configResult.feedback.map((f,i) => (
                <div key={i} style={{color:f.ok?T.success:T.danger}}>{f.ok ? "+" : "x"} {f.text}</div>
              ))}
            </div>
          </div>
        )}

        <button onClick={checkConfig} style={{padding:"14px 28px",background:T.violet,color:T.bg,border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:16}}>Check Configuration</button>
      </div>
    );
  }

  // External Lab
  if (lab.lab_type === "external") {
    return (
      <div style={{textAlign:"center",padding:40}}>
        {earnedBadges.length > 0 && <BadgeToast badges={earnedBadges} onClose={closeBadgeToast} />}
        <button onClick={onBack} style={{background:"transparent",border:"none",color:T.cyan,cursor:"pointer",marginBottom:16}}>Back to Labs</button>
        <h2 style={{color:T.text,marginBottom:16}}>{lab.title}</h2>
        <p style={{color:T.muted,marginBottom:24}}>{lab.description}</p>
        <a href={lab.external_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"14px 28px",background:T.cyan,color:T.bg,borderRadius:8,fontWeight:700,textDecoration:"none",marginBottom:16}}>Open External Lab</a>
        <br/>
        <button onClick={handleComplete} disabled={completing} style={{marginTop:16,padding:"12px 24px",background:"transparent",color:T.cyan,border:"1px solid "+T.cyan,borderRadius:8,cursor:completing?"wait":"pointer",opacity:completing?0.7:1}}>
          {completing ? "Saving..." : "Mark as Complete"}
        </button>
      </div>
    );
  }

  return <div style={{color:T.muted}}>Lab type not supported yet.</div>;
}
