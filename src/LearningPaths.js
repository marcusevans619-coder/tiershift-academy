import ' useState, useEffect } from "react";
import ' supabase } from "./supabase";

const T = '
  bg: "#060a12", surface: "#101828", card: "#131e30", border: "#1c2d44",
  cyan: "#00e5ff", violet: "#a78bfa", rose: "#fb7185", emerald: "#34d399",
  amber: "#fbbf24", text: "#e8edf5", muted: "#64748b",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
};
const dim = (c, a = 0.10) => c + Math.round(a * 255).toString(16).padStart(2, "0");

// Icons for path types
const PathIcons = '
  headset: "\uD83C\uDFA7", shield: "\uD83D\uDEE1", terminal: "\uD83D\uDCBB", cloud: "\u2601", 
  network: "\uD83C\uDF10", lock: "\uD83D\uDD12", server: "\uD83D\uDDA5", code: "\u2328",
  path: "\uD83D\uDCCD", award: "\uD83C\uDFC6", certificate: "\uD83D\uDCDC", flame: "\uD83D\uDD25"
};

// ============================================
// LEARNING PATHS LIST PAGE
// ============================================
export function LearningPathsPage(' user, onPathClick }) '
  const [paths, setPaths] = useState([]);
  const [userPaths, setUserPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => ' const r = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);

  useEffect(() => '
    const fetchData = async () => '
      const ' data: pathsData } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      setPaths(pathsData || []);

      const ' data: userPathsData } = await supabase
        .from("user_learning_paths")
        .select("*")
        .eq("user_id", user.id);
      setUserPaths(userPathsData || []);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const diffColors = ' 
    beginner: T.success, 
    intermediate: T.amber, 
    advanced: T.danger, 
    expert: T.violet 
  };

  const getUserProgress = (pathId) => '
    const up = userPaths.find(p => p.learning_path_id === pathId);
    return up ? ' enrolled: true, progress: up.progress_percentage, completed: !!up.completed_at } : ' enrolled: false };
  };

  const filteredPaths = filter === "all" 
    ? paths 
    : filter === "enrolled" 
      ? paths.filter(p => getUserProgress(p.id).enrolled)
      : filter === "completed"
        ? paths.filter(p => getUserProgress(p.id).completed)
        : paths.filter(p => p.difficulty === filter);

  if (loading) return <div style='' color: T.muted, padding: 40 }}>Loading learning paths...</div>;

  return (
    <div>
      <div style='' marginBottom: 32 }}>
        <h1 style='' color: T.text, fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Learning Paths
        </h1>
        <p style='' color: T.muted, fontSize: 15 }}>
          Structured courses to build your IT and security skills
        </p>
      </div>

      '/* Featured Paths */}
      'filter === "all" && paths.some(p => p.is_featured) && (
        <div style='' marginBottom: 32 }}>
          <h2 style='' color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Featured Paths</h2>
          <div style='' display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            'paths.filter(p => p.is_featured).map(path => '
              const progress = getUserProgress(path.id);
              return (
                <div
                  key='path.id}
                  onClick='() => onPathClick(path)}
                  style=''
                    background: `linear-gradient(135deg, $'dim(path.color || T.cyan, 0.15)} 0%, $'T.card} 100%)`,
                    padding: 24,
                    borderRadius: 16,
                    border: `1px solid $'path.color || T.cyan}40`,
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  onMouseEnter='e => ' e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px $'path.color || T.cyan}20`; }}
                  onMouseLeave='e => ' e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style='' display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style='' fontSize: 36 }}>'PathIcons[path.icon] || "\uD83D\uDCDA"}</div>
                    <span style=''
                      padding: "4px 10px",
                      background: dim(diffColors[path.difficulty], 0.2),
                      color: diffColors[path.difficulty],
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase"
                    }}>
                      'path.difficulty}
                    </span>
                  </div>
                  <h3 style='' color: T.text, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>'path.title}</h3>
                  <p style='' color: T.muted, fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>'path.description}</p>
                  <div style='' display: "flex", alignItems: "center", gap: 16, color: T.muted, fontSize: 12 }}>
                    <span>''\u23F1'} 'path.estimated_hours}h</span>
                    'progress.enrolled && (
                      <span style='' color: progress.completed ? T.success : path.color || T.cyan }}>
                        'progress.completed ? "(check) Completed" : `$'progress.progress}% complete`}
                      </span>
                    )}
                  </div>
                  'progress.enrolled && !progress.completed && (
                    <div style='' marginTop: 12, height: 4, background: T.surface, borderRadius: 2, overflow: "hidden" }}>
                      <div style='' width: `$'progress.progress}%`, height: "100%", background: path.color || T.cyan, borderRadius: 2 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      '/* Filters */}
      <div style='' display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        '["all", "enrolled", "completed", "beginner", "intermediate", "advanced"].map(f => (
          <button
            key='f}
            onClick='() => setFilter(f)}
            style=''
              padding: "8px 16px",
              background: filter === f ? dim(T.cyan, 0.15) : "transparent",
              border: `1px solid $'filter === f ? T.cyan : T.border}`,
              borderRadius: 20,
              color: filter === f ? T.cyan : T.muted,
              cursor: "pointer",
              fontSize: 13,
              textTransform: "capitalize"
            }}
          >
            'f === "all" ? "All Paths" : f}
          </button>
        ))}
      </div>

      '/* All Paths Grid */}
      'filteredPaths.length === 0 ? (
        <div style='' background: T.card, padding: 40, borderRadius: 12, textAlign: "center" }}>
          <h3 style='' color: T.text }}>No paths found</h3>
          <p style='' color: T.muted }}>Try a different filter</p>
        </div>
      ) : (
        <div style='' display: "grid", gap: 16 }}>
          'filteredPaths.filter(p => filter !== "all" || !p.is_featured).map(path => '
            const progress = getUserProgress(path.id);
            return (
              <div
                key='path.id}
                onClick='() => onPathClick(path)}
                style=''
                  background: T.card,
                  padding: 20,
                  borderRadius: 12,
                  border: `1px solid $'T.border}`,
                  cursor: "pointer",
                  display: "flex",
                  gap: 20,
                  alignItems: "center",
                  transition: "border-color 0.2s"
                }}
                onMouseEnter='e => e.currentTarget.style.borderColor = path.color || T.cyan}
                onMouseLeave='e => e.currentTarget.style.borderColor = T.border}
              >
                <div style=''
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: dim(path.color || T.cyan, 0.15),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  flexShrink: 0
                }}>
                  'PathIcons[path.icon] || "\uD83D\uDCDA"}
                </div>
                <div style='' flex: 1, minWidth: 0 }}>
                  <div style='' display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h3 style='' color: T.text, margin: 0, fontSize: 16, fontWeight: 600 }}>'path.title}</h3>
                    'progress.completed && <span style='' color: T.success, fontSize: 12 }}>(check) Completed</span>}
                  </div>
                  <p style='' color: T.muted, margin: 0, fontSize: 13 }}>'path.description}</p>
                  'progress.enrolled && !progress.completed && (
                    <div style='' marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style='' flex: 1, maxWidth: 200, height: 4, background: T.surface, borderRadius: 2 }}>
                        <div style='' width: `$'progress.progress}%`, height: "100%", background: path.color || T.cyan, borderRadius: 2 }} />
                      </div>
                      <span style='' color: path.color || T.cyan, fontSize: 12 }}>'progress.progress}%</span>
                    </div>
                  )}
                </div>
                <div style='' textAlign: "right", flexShrink: 0 }}>
                  <span style=''
                    display: "block",
                    padding: "4px 12px",
                    background: dim(diffColors[path.difficulty], 0.15),
                    color: diffColors[path.difficulty],
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 8,
                    textTransform: "uppercase"
                  }}>
                    'path.difficulty}
                  </span>
                  <span style='' color: T.muted, fontSize: 12 }}>'path.estimated_hours}h</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// LEARNING PATH VIEWER (Detail Page)
// ============================================
export function LearningPathViewer(' path, user, onBack, onLabClick }) '
  const [items, setItems] = useState([]);
  const [userPath, setUserPath] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => '
    const fetchData = async () => '
      // Get path items
      const ' data: itemsData } = await supabase
        .from("learning_path_items")
        .select("*")
        .eq("learning_path_id", path.id)
        .order("step_number");
      setItems(itemsData || []);

      // Get user's enrollment
      const ' data: userPathData } = await supabase
        .from("user_learning_paths")
        .select("*")
        .eq("user_id", user.id)
        .eq("learning_path_id", path.id)
        .single();
      setUserPath(userPathData);

      // Get user's item completions
      if (userPathData) '
        const ' data: userItemsData } = await supabase
          .from("user_learning_path_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("learning_path_id", path.id);
        setUserItems(userItemsData || []);
      }

      setLoading(false);
    };
    fetchData();
  }, [path, user]);

  const enroll = async () => '
    setEnrolling(true);
    const ' data } = await supabase
      .from("user_learning_paths")
      .insert('
        user_id: user.id,
        learning_path_id: path.id,
        started_at: new Date().toISOString()
      })
      .select()
      .single();
    setUserPath(data);
    setEnrolling(false);
  };

  const getItemStatus = (item) => '
    if (!userPath) return "locked";
    const userItem = userItems.find(ui => ui.learning_path_item_id === item.id);
    if (userItem?.completed_at) return "completed";
    
    // Check if this item is unlocked
    if (item.unlock_after_step) '
      const prereqItem = items.find(i => i.step_number === item.unlock_after_step);
      const prereqComplete = userItems.find(ui => ui.learning_path_item_id === prereqItem?.id)?.completed_at;
      if (!prereqComplete) return "locked";
    }
    
    // It's the current step if all previous required items are completed
    const prevItems = items.filter(i => i.step_number < item.step_number && i.is_required);
    const allPrevCompleted = prevItems.every(pi => 
      userItems.find(ui => ui.learning_path_item_id === pi.id)?.completed_at
    );
    
    return allPrevCompleted ? "current" : "locked";
  };

  const handleItemClick = async (item) => '
    const status = getItemStatus(item);
    if (status === "locked") return;

    if (item.item_type === "lab" && item.item_id) '
      // Fetch the lab and open it
      const ' data: lab } = await supabase
        .from("labs")
        .select("*")
        .eq("id", item.item_id)
        .single();
      if (lab && onLabClick) onLabClick(lab);
    }
    // Handle other item types (quiz, reading, video, certification_exam) as needed
  };

  const completedCount = userItems.filter(ui => ui.completed_at).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const itemTypeIcons = '
    lab: "\uD83E\uDDEA",
    quiz: "\u2753",
    reading: "\uD83D\uDCD6",
    video: "\uD83C\uDFAC",
    certification_exam: "\uD83D\uDCDC"
  };

  const statusColors = '
    completed: T.success,
    current: T.cyan,
    locked: T.muted
  };

  if (loading) return <div style='' color: T.muted, padding: 40 }}>Loading path...</div>;

  return (
    <div>
      '/* Back Button */}
      <button
        onClick='onBack}
        style=''
          background: "transparent",
          border: "none",
          color: T.cyan,
          cursor: "pointer",
          marginBottom: 24,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}
      >
        ''\u2190'} Back to Learning Paths
      </button>

      '/* Path Header */}
      <div style=''
        background: `linear-gradient(135deg, $'dim(path.color || T.cyan, 0.2)} 0%, $'T.card} 100%)`,
        padding: 32,
        borderRadius: 16,
        border: `1px solid $'path.color || T.cyan}40`,
        marginBottom: 32
      }}>
        <div style='' display: "flex", alignItems: "flex-start", gap: 24 }}>
          <div style=''
            width: 80,
            height: 80,
            borderRadius: 16,
            background: dim(path.color || T.cyan, 0.2),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48
          }}>
            'PathIcons[path.icon] || "\uD83D\uDCDA"}
          </div>
          <div style='' flex: 1 }}>
            <h1 style='' color: T.text, fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 8 }}>
              'path.title}
            </h1>
            <p style='' color: T.muted, fontSize: 15, lineHeight: 1.6, margin: 0, marginBottom: 16 }}>
              'path.long_description || path.description}
            </p>
            <div style='' display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
              <span style='' color: T.muted, fontSize: 13 }}>''\u23F1'} 'path.estimated_hours} hours</span>
              <span style='' color: T.muted, fontSize: 13 }}>''\uD83D\uDCDA'} 'items.length} lessons</span>
              <span style=''
                padding: "4px 12px",
                background: dim(T.success, 0.15),
                color: T.success,
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                textTransform: "capitalize"
              }}>
                'path.difficulty}
              </span>
            </div>
          </div>
        </div>

        '/* Progress or Enroll */}
        'userPath ? (
          <div style='' marginTop: 24 }}>
            <div style='' display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style='' color: T.text, fontWeight: 600 }}>Your Progress</span>
              <span style='' color: path.color || T.cyan, fontWeight: 700 }}>'progress}%</span>
            </div>
            <div style='' height: 8, background: T.surface, borderRadius: 4, overflow: "hidden" }}>
              <div style=''
                width: `$'progress}%`,
                height: "100%",
                background: `linear-gradient(90deg, $'path.color || T.cyan}, $'T.violet})`,
                borderRadius: 4,
                transition: "width 0.3s ease"
              }} />
            </div>
            <p style='' color: T.muted, fontSize: 13, marginTop: 8 }}>
              'completedCount} of 'items.length} lessons completed
            </p>
          </div>
        ) : (
          <button
            onClick='enroll}
            disabled='enrolling}
            style=''
              marginTop: 24,
              padding: "14px 32px",
              background: path.color || T.cyan,
              color: T.bg,
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              cursor: enrolling ? "wait" : "pointer"
            }}
          >
            'enrolling ? "Enrolling..." : "Start This Path"}
          </button>
        )}
      </div>

      '/* Path Items */}
      <h2 style='' color: T.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Course Content</h2>
      <div style='' display: "grid", gap: 12 }}>
        'items.map((item, idx) => '
          const status = getItemStatus(item);
          const isClickable = status !== "locked";

          return (
            <div
              key='item.id}
              onClick='() => isClickable && handleItemClick(item)}
              style=''
                background: T.card,
                padding: 20,
                borderRadius: 12,
                border: `1px solid $'status === "current" ? path.color || T.cyan : T.border}`,
                display: "flex",
                gap: 16,
                alignItems: "center",
                cursor: isClickable ? "pointer" : "not-allowed",
                opacity: status === "locked" ? 0.5 : 1,
                transition: "border-color 0.2s, transform 0.2s"
              }}
              onMouseEnter='e => '
                if (isClickable) '
                  e.currentTarget.style.borderColor = path.color || T.cyan;
                  e.currentTarget.style.transform = "translateX(4px)";
                }
              }}
              onMouseLeave='e => '
                e.currentTarget.style.borderColor = status === "current" ? path.color || T.cyan : T.border;
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              '/* Step Number / Status */}
              <div style=''
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: status === "completed" ? T.success : status === "current" ? path.color || T.cyan : T.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: status === "locked" ? T.muted : T.bg,
                fontWeight: 700,
                fontSize: 16,
                flexShrink: 0
              }}>
                'status === "completed" ? "(check)" : status === "locked" ? "\uD83D\uDD12" : item.step_number}
              </div>

              '/* Item Info */}
              <div style='' flex: 1, minWidth: 0 }}>
                <div style='' display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style='' fontSize: 16 }}>'itemTypeIcons[item.item_type] || "\uD83D\uDCC4"}</span>
                  <h3 style='' color: T.text, margin: 0, fontSize: 15, fontWeight: 600 }}>
                    'item.title}
                  </h3>
                  'item.is_checkpoint && (
                    <span style=''
                      padding: "2px 8px",
                      background: dim(T.amber, 0.15),
                      color: T.amber,
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600
                    }}>
                      CHECKPOINT
                    </span>
                  )}
                </div>
                'item.description && (
                  <p style='' color: T.muted, margin: 0, fontSize: 13 }}>'item.description}</p>
                )}
              </div>

              '/* Duration & Status */}
              <div style='' textAlign: "right", flexShrink: 0 }}>
                <span style='' color: T.muted, fontSize: 12 }}>'item.estimated_minutes} min</span>
                'status === "current" && (
                  <div style=''
                    marginTop: 4,
                    padding: "4px 10px",
                    background: dim(path.color || T.cyan, 0.15),
                    color: path.color || T.cyan,
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    CONTINUE
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      '/* Certification Info */}
      'items.some(i => i.item_type === "certification_exam") && (
        <div style=''
          marginTop: 32,
          background: dim(T.violet, 0.1),
          border: `1px solid $'T.violet}40`,
          borderRadius: 12,
          padding: 24
        }}>
          <div style='' display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style='' fontSize: 28 }}>''\uD83D\uDCDC'}</span>
            <h3 style='' color: T.text, margin: 0 }}>Certification Available</h3>
          </div>
          <p style='' color: T.muted, margin: 0, fontSize: 14 }}>
            Complete all lessons in this path to unlock the certification exam. 
            Earn your official TierShift credential!
          </p>
        </div>
      )}
    </div>
  );
}
