import { useState, useEffect } from "react";
import { supabase } from "./supabase";


// Emoji constants - bypass bundler escape mangling
const EMOJI_SCROLL = String.fromCodePoint(0x1F4DC);
const EMOJI_BULLET = String.fromCodePoint(0x2022);
const EMOJI_OFFICE = String.fromCodePoint(0x1F3E2);
const EMOJI_PIN = String.fromCodePoint(0x1F4CD);
const T = {
  bg: "#060a12", surface: "#101828", card: "#131e30", border: "#1c2d44",
  cyan: "#00e5ff", violet: "#a78bfa", rose: "#fb7185", emerald: "#34d399",
  amber: "#fbbf24", text: "#e8edf5", muted: "#64748b",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
};
const dim = (c, a = 0.10) => c + Math.round(a * 255).toString(16).padStart(2, "0");

const BadgeIcons = {
  play: "\u25B6", "trending-up": String.fromCodePoint(0x1F4C8), flask: String.fromCodePoint(0x1F9EA), crown: String.fromCodePoint(0x1F451),
  terminal: String.fromCodePoint(0x1F4BB), shield: String.fromCodePoint(0x1F6E1), "check-circle": "\u2705", network: String.fromCodePoint(0x1F310),
  flame: String.fromCodePoint(0x1F525), award: String.fromCodePoint(0x1F3C6), star: "\u2B50", zap: "\u26A1"
};

const RarityColors = {
  common: "#9ca3af",
  uncommon: T.success,
  rare: T.cyan,
  epic: T.violet,
  legendary: T.amber
};

// ============================================
// USER PROFILE PAGE
// ============================================
export function ProfilePage({ user, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [badges, setBadges] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => { const r = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      // Get or create profile
      let { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profileData) {
        const { data: newProfile } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            display_name: user.email?.split("@")[0] || "User"
          })
          .select()
          .single();
        profileData = newProfile;
      }
      setProfile(profileData);
      setFormData(profileData || {});

      // Get completed labs count
      const { count: labsCount } = await supabase
        .from("user_labs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null);

      // Get paths progress
      const { data: pathsData } = await supabase
        .from("user_learning_paths")
        .select("*")
        .eq("user_id", user.id);
      
      const pathsCompleted = pathsData?.filter(p => p.completed_at).length || 0;
      const pathsInProgress = pathsData?.filter(p => !p.completed_at).length || 0;

      // Get badges
      const { data: badgesData } = await supabase
        .from("user_badges")
        .select("*, badge:badges(*)")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })
        .limit(8);
      setBadges(badgesData || []);

      // Get certifications
      const { data: certsData } = await supabase
        .from("user_certifications")
        .select("*, certification:certifications(*)")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });
      setCertifications(certsData || []);

      // Get recent activity
      const { data: activityData } = await supabase
        .from("user_labs")
        .select("*, lab:labs(title, lab_type)")
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(5);
      setRecentActivity(activityData || []);

      setStats({
        labsCompleted: labsCount || 0,
        pathsCompleted,
        pathsInProgress,
        badgesEarned: badgesData?.length || 0,
        totalPoints: profileData?.total_points || 0,
        currentStreak: profileData?.current_streak || 0,
        longestStreak: profileData?.longest_streak || 0
      });

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const saveProfile = async () => {
    const { error } = await supabase
      .from("user_profiles")
      .update({
        display_name: formData.display_name,
        bio: formData.bio,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        website: formData.website,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        is_public: formData.is_public,
        show_badges: formData.show_badges,
        show_certifications: formData.show_certifications,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (!error) {
      setProfile(formData);
      setEditing(false);
    }
  };

  if (loading) return <div style={{ color: T.muted, padding: 40 }}>Loading profile...</div>;

  return (
    <div>
      {/* Profile Header */}
      <div style={{
        background: `linear-gradient(135deg, ${dim(T.cyan, 0.15)} 0%, ${T.card} 100%)`,
        borderRadius: 20,
        padding: 32,
        marginBottom: 32,
        border: `1px solid ${T.border}`
      }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            fontWeight: 800,
            color: T.bg,
            flexShrink: 0
          }}>
            {(profile?.display_name || "U")[0].toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            {editing ? (
              <div style={{ display: "grid", gap: 12 }}>
                <input
                  placeholder="Display Name"
                  value={formData.display_name || ""}
                  onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                  style={{
                    padding: 12,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    color: T.text,
                    fontSize: 18,
                    fontWeight: 700
                  }}
                />
                <input
                  placeholder="Title (e.g., IT Support Specialist)"
                  value={formData.title || ""}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    padding: 10,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    color: T.text
                  }}
                />
                <textarea
                  placeholder="Bio"
                  value={formData.bio || ""}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  style={{
                    padding: 10,
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    color: T.text,
                    resize: "vertical"
                  }}
                />
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  <input
                    placeholder="Company"
                    value={formData.company || ""}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                    style={{ padding: 10, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text }}
                  />
                  <input
                    placeholder="Location"
                    value={formData.location || ""}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    style={{ padding: 10, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text }}
                  />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button onClick={saveProfile} style={{ padding: "10px 24px", background: T.cyan, color: T.bg, border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                    Save
                  </button>
                  <button onClick={() => { setEditing(false); setFormData(profile); }} style={{ padding: "10px 24px", background: "transparent", color: T.muted, border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ color: T.text, fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 4 }}>
                  {profile?.display_name || "User"}
                </h1>
                {profile?.title && (
                  <p style={{ color: T.cyan, fontSize: 15, margin: 0, marginBottom: 8 }}>{profile.title}</p>
                )}
                {profile?.bio && (
                  <p style={{ color: T.muted, fontSize: 14, margin: 0, marginBottom: 12, lineHeight: 1.5 }}>{profile.bio}</p>
                )}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", color: T.muted, fontSize: 13 }}>
                  {profile?.company && <span>{EMOJI_OFFICE} {profile.company}</span>}
                  {profile?.location && <span>{EMOJI_PIN} {profile.location}</span>}
                </div>
              </>
            )}
          </div>

          {/* Edit Button */}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                color: T.text,
                cursor: "pointer"
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 16,
        marginBottom: 32
      }}>
        {[
          { label: "Labs Completed", value: stats.labsCompleted, color: T.cyan, icon: String.fromCodePoint(0x1F9EA) },
          { label: "Paths Completed", value: stats.pathsCompleted, color: T.violet, icon: String.fromCodePoint(0x1F4CD) },
          { label: "Badges Earned", value: stats.badgesEarned, color: T.amber, icon: String.fromCodePoint(0x1F3C6) },
          { label: "Total Points", value: stats.totalPoints, color: T.emerald, icon: "\u2B50" },
          { label: "Current Streak", value: `${stats.currentStreak}d`, color: T.rose, icon: String.fromCodePoint(0x1F525) },
          { label: "Longest Streak", value: `${stats.longestStreak}d`, color: T.warning, icon: String.fromCodePoint(0x1F4C8) }
        ].map((stat, i) => (
          <div key={i} style={{
            background: T.card,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            textAlign: "center"
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ color: stat.color, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ color: T.muted, fontSize: 12, textTransform: "uppercase" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 24 }}>
        {/* Badges */}
        <div style={{
          background: T.card,
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${T.border}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: 0 }}>Recent Badges</h2>
            <button
              onClick={() => onNavigate && onNavigate("badges")}
              style={{ background: "transparent", border: "none", color: T.cyan, cursor: "pointer", fontSize: 13 }}
            >
              View All >
            </button>
          </div>
          {badges.length === 0 ? (
            <p style={{ color: T.muted, textAlign: "center", padding: 20 }}>No badges earned yet</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 4, overflow: "hidden", width: "100%" }}>
              {badges.slice(0, 8).map(ub => (
                <div key={ub.id} style={{
                  textAlign: "center",
                  padding: 12,
                  background: T.surface,
                  borderRadius: 12
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: dim(RarityColors[ub.badge?.rarity] || T.muted, 0.2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 4px",
                    fontSize: 15
                  }}>
                    {BadgeIcons[ub.badge?.icon] || String.fromCodePoint(0x1F3C5)}
                  </div>
                  <div style={{ color: T.text, fontSize: 11, fontWeight: 600 }}>
                    {ub.badge?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div style={{
          background: T.card,
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${T.border}`
        }}>
          <h2 style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 20 }}>
            Certifications
          </h2>
          {certifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <p style={{ color: T.muted, marginBottom: 12 }}>No certifications earned yet</p>
              <button
                onClick={() => onNavigate && onNavigate("paths")}
                style={{
                  padding: "10px 20px",
                  background: T.violet,
                  color: T.bg,
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Start a Learning Path
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {certifications.map(uc => (
                <div key={uc.id} style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: 12,
                  background: T.surface,
                  borderRadius: 8
                }}>
                  <div style={{ fontSize: 28 }}>{EMOJI_SCROLL}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.text, fontWeight: 600 }}>{uc.certification?.name}</div>
                    <div style={{ color: T.muted, fontSize: 12 }}>
                      ID: {uc.credential_id}
                    </div>
                  </div>
                  <a
                    href={`/verify/${uc.credential_id}`}
                    style={{ color: T.cyan, fontSize: 12 }}
                  >
                    Share
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        marginTop: 24,
        background: T.card,
        borderRadius: 16,
        padding: 24,
        border: `1px solid ${T.border}`
      }}>
        <h2 style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 20 }}>
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p style={{ color: T.muted, textAlign: "center", padding: 20 }}>No activity yet. Start a lab!</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {recentActivity.map(activity => (
              <div key={activity.id} style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                padding: 12,
                background: T.surface,
                borderRadius: 8
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: dim(T.success, 0.15),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: T.success
                }}>
                  (check)
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.text, fontWeight: 500 }}>
                    Completed: {activity.lab?.title}
                  </div>
                  <div style={{ color: T.muted, fontSize: 12 }}>
                    {new Date(activity.completed_at).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  padding: "4px 10px",
                  background: dim(T.cyan, 0.1),
                  color: T.cyan,
                  borderRadius: 20,
                  fontSize: 11,
                  textTransform: "uppercase"
                }}>
                  {activity.lab?.lab_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// PUBLIC PROFILE VIEW (for sharing)
// ============================================
export function PublicProfilePage({ userId }) {
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .eq("is_public", true)
        .single();

      if (!profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      if (profileData.show_badges) {
        const { data: badgesData } = await supabase
          .from("user_badges")
          .select("*, badge:badges(*)")
          .eq("user_id", userId)
          .order("earned_at", { ascending: false });
        setBadges(badgesData || []);
      }

      if (profileData.show_certifications) {
        const { data: certsData } = await supabase
          .from("user_certifications")
          .select("*, certification:certifications(*)")
          .eq("user_id", userId)
          .eq("is_valid", true)
          .order("earned_at", { ascending: false });
        setCertifications(certsData || []);
      }

      setLoading(false);
    };
    fetchData();
  }, [userId]);

  if (loading) return <div style={{ color: T.muted, padding: 40, textAlign: "center" }}>Loading...</div>;
  if (notFound) return <div style={{ color: T.muted, padding: 40, textAlign: "center" }}>Profile not found or is private</div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      {/* Header */}
      <div style={{
        background: T.card,
        borderRadius: 20,
        padding: 32,
        textAlign: "center",
        marginBottom: 32
      }}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontWeight: 800,
          color: T.bg,
          margin: "0 auto 20px"
        }}>
          {(profile?.display_name || "U")[0].toUpperCase()}
        </div>
        <h1 style={{ color: T.text, fontSize: 28, margin: 0, marginBottom: 8 }}>
          {profile?.display_name}
        </h1>
        {profile?.title && <p style={{ color: T.cyan, margin: 0, marginBottom: 8 }}>{profile.title}</p>}
        {profile?.bio && <p style={{ color: T.muted, margin: 0 }}>{profile.bio}</p>}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 32 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: T.amber, fontSize: 32, fontWeight: 800 }}>{profile?.total_points || 0}</div>
          <div style={{ color: T.muted, fontSize: 13 }}>Points</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: T.cyan, fontSize: 32, fontWeight: 800 }}>{badges.length}</div>
          <div style={{ color: T.muted, fontSize: 13 }}>Badges</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: T.violet, fontSize: 32, fontWeight: 800 }}>{certifications.length}</div>
          <div style={{ color: T.muted, fontSize: 13 }}>Certifications</div>
        </div>
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: T.text, fontSize: 15, marginBottom: 16 }}>Certifications</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {certifications.map(uc => (
              <div key={uc.id} style={{
                background: T.card,
                padding: 20,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 16
              }}>
                <div style={{ fontSize: 36 }}>{EMOJI_SCROLL}</div>
                <div>
                  <div style={{ color: T.text, fontWeight: 600 }}>{uc.certification?.name}</div>
                  <div style={{ color: T.muted, fontSize: 13 }}>
                    Credential ID: {uc.credential_id} {EMOJI_BULLET} Earned {new Date(uc.earned_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h2 style={{ color: T.text, fontSize: 15, marginBottom: 16 }}>Badges</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {badges.map(ub => (
              <div key={ub.id} style={{
                background: T.card,
                padding: 12,
                borderRadius: 12,
                textAlign: "center",
                minWidth: 80
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{BadgeIcons[ub.badge?.icon] || String.fromCodePoint(0x1F3C5)}</div>
                <div style={{ color: T.text, fontSize: 11, fontWeight: 600 }}>{ub.badge?.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
