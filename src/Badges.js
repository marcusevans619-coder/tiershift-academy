import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const T = {
  bg:"#060a12",surface:"#101828",card:"#131e30",cardHi:"#182640",
  border:"#1c2d44",cyan:"#00e5ff",violet:"#a78bfa",rose:"#fb7185",
  emerald:"#34d399",amber:"#fbbf24",text:"#e8edf5",muted:"#64748b",
  success:"#10b981",warning:"#f59e0b",danger:"#ef4444",
};
const dim=(c,a=0.15)=>c+Math.round(a*255).toString(16).padStart(2,"0");

export function BadgesPage({ user }) {
  const [badges, setBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [userStats, setUserStats] = useState({ lessons: 0, quizzes: 0, labs: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all badges
      const { data: badgesData } = await supabase
        .from("badges")
        .select("*")
        .order("sort_order");
      setBadges(badgesData || []);

      // Fetch user's earned badges
      const { data: earnedData } = await supabase
        .from("user_badges")
        .select("badge_id, earned_at")
        .eq("user_id", user.id);
      setEarnedBadges(earnedData || []);

      // Fetch user stats for progress calculation
      const { count: lessonsCount } = await supabase
        .from("user_lessons")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null);

      const { count: quizzesCount } = await supabase
        .from("user_quizzes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("score", 70);

      const { count: labsCount } = await supabase
        .from("user_labs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null);

      setUserStats({
        lessons: lessonsCount || 0,
        quizzes: quizzesCount || 0,
        labs: labsCount || 0
      });

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const isEarned = (badgeId) => earnedBadges.some(eb => eb.badge_id === badgeId);
  
  const getEarnedDate = (badgeId) => {
    const earned = earnedBadges.find(eb => eb.badge_id === badgeId);
    return earned ? new Date(earned.earned_at).toLocaleDateString() : null;
  };

  const getProgress = (badge) => {
    let current = 0;
    let target = badge.requirement_value;
    
    switch (badge.requirement_type) {
      case "lessons_completed":
        current = userStats.lessons;
        break;
      case "quizzes_passed":
        current = userStats.quizzes;
        break;
      case "labs_completed":
        current = userStats.labs;
        break;
      case "day_streak":
        current = 3; // TODO: Calculate real streak
        break;
      case "track_completed":
        current = 0; // TODO: Calculate track progress
        target = 100;
        break;
      default:
        current = 0;
    }
    
    return { current, target, percent: Math.min(100, Math.round((current / target) * 100)) };
  };

  const categoryColors = {
    milestone: T.cyan,
    streak: T.amber,
    track: T.violet,
    special: T.rose
  };

  const categoryLabels = {
    milestone: "Milestones",
    streak: "Streaks",
    track: "Track Completion",
    special: "Special"
  };

  const categories = ["all", "milestone", "streak", "track", "special"];
  const filteredBadges = filter === "all" ? badges : badges.filter(b => b.category === filter);
  const earnedCount = earnedBadges.length;
  const totalCount = badges.length;

  if (loading) return <div style={{color:T.muted,padding:40}}>Loading badges...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{marginBottom:32}}>
        <h1 style={{color:T.text,fontSize:28,fontWeight:800,marginBottom:8}}>Achievements</h1>
        <p style={{color:T.muted,marginBottom:16}}>Track your progress and earn badges</p>
        
        {/* Stats summary */}
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:16,minWidth:120}}>
            <div style={{fontSize:32,fontWeight:800,color:T.cyan}}>{earnedCount}</div>
            <div style={{color:T.muted,fontSize:13}}>Badges Earned</div>
          </div>
          <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:16,minWidth:120}}>
            <div style={{fontSize:32,fontWeight:800,color:T.violet}}>{totalCount - earnedCount}</div>
            <div style={{color:T.muted,fontSize:13}}>Badges Remaining</div>
          </div>
          <div style={{background:T.card,border:"1px solid "+T.border,borderRadius:12,padding:16,minWidth:120}}>
            <div style={{fontSize:32,fontWeight:800,color:T.emerald}}>{Math.round((earnedCount/totalCount)*100)}%</div>
            <div style={{color:T.muted,fontSize:13}}>Completion</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding:"8px 16px",
              background: filter === cat ? dim(categoryColors[cat] || T.cyan, 0.15) : "transparent",
              border: "1px solid " + (filter === cat ? (categoryColors[cat] || T.cyan) : T.border),
              borderRadius: 20,
              color: filter === cat ? (categoryColors[cat] || T.cyan) : T.muted,
              cursor: "pointer",
              fontSize: 13,
              textTransform: "capitalize"
            }}
          >
            {cat === "all" ? "All Badges" : categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))",gap:16}}>
        {filteredBadges.map(badge => {
          const earned = isEarned(badge.id);
          const earnedDate = getEarnedDate(badge.id);
          const progress = getProgress(badge);
          const catColor = categoryColors[badge.category] || T.cyan;

          return (
            <div
              key={badge.id}
              style={{
                background: earned ? dim(catColor, 0.08) : T.card,
                border: "1px solid " + (earned ? catColor : T.border),
                borderRadius: 16,
                padding: 24,
                opacity: earned ? 1 : 0.7,
                transition: "all 0.2s ease"
              }}
            >
              {/* Badge icon */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: earned ? dim(catColor, 0.2) : T.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                marginBottom: 16,
                filter: earned ? "none" : "grayscale(100%)"
              }}>
                {badge.icon}
              </div>

              {/* Badge info */}
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <h3 style={{color:T.text,margin:0,fontSize:16,fontWeight:700}}>{badge.name}</h3>
                  {earned && <span style={{color:T.success,fontSize:14}}>✓</span>}
                </div>
                <p style={{color:T.muted,margin:0,fontSize:13,lineHeight:1.4}}>{badge.description}</p>
              </div>

              {/* Progress or earned date */}
              {earned ? (
                <div style={{color:catColor,fontSize:12,fontWeight:600}}>
                  Earned {earnedDate}
                </div>
              ) : (
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{color:T.muted,fontSize:12}}>Progress</span>
                    <span style={{color:T.text,fontSize:12,fontWeight:600}}>
                      {progress.current}/{progress.target}
                    </span>
                  </div>
                  <div style={{
                    height: 6,
                    background: T.surface,
                    borderRadius: 3,
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: progress.percent + "%",
                      height: "100%",
                      background: catColor,
                      borderRadius: 3,
                      transition: "width 0.3s ease"
                    }}/>
                  </div>
                </div>
              )}

              {/* Category tag */}
              <div style={{
                marginTop: 12,
                display: "inline-block",
                padding: "4px 10px",
                background: dim(catColor, 0.1),
                color: catColor,
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase"
              }}>
                {badge.category}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div style={{textAlign:"center",padding:60,color:T.muted}}>
          <div style={{fontSize:48,marginBottom:16}}>🏆</div>
          <p>No badges in this category yet.</p>
        </div>
      )}
    </div>
  );
}
