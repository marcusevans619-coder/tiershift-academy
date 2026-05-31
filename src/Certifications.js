import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
// Emoji constants — defined as runtime values to bypass bundler escape mangling
const EMOJI_CHART = String.fromCodePoint(0x1F4CA);
const EMOJI_CLOCK = String.fromCodePoint(0x23F1);
const EMOJI_CALENDAR = String.fromCodePoint(0x1F4C5);
const EMOJI_TROPHY = String.fromCodePoint(0x1F3C6);
const EMOJI_MEMO = String.fromCodePoint(0x1F4DD);
const EMOJI_SCROLL = String.fromCodePoint(0x1F4DC);
const EMOJI_BOOKS = String.fromCodePoint(0x1F4DA);
const EMOJI_PARTY = String.fromCodePoint(0x1F389);
const EMOJI_BULB = String.fromCodePoint(0x1F4A1);
const EMOJI_BULLET = String.fromCodePoint(0x2022);
const EMOJI_CHECK = String.fromCodePoint(0x2713);
const EMOJI_CROSS = String.fromCodePoint(0x2717);


const T = {
  bg: "#060a12", surface: "#101828", card: "#131e30", border: "#1c2d44",
  cyan: "#00e5ff", violet: "#a78bfa", rose: "#fb7185", emerald: "#34d399",
  amber: "#fbbf24", text: "#e8edf5", muted: "#64748b",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444",
};
const dim = (c, a = 0.10) => c + Math.round(a * 255).toString(16).padStart(2, "0");

// ============================================
// CERTIFICATIONS PAGE
// ============================================
export function CertificationsPage({ user, onPathClick }) {
  const [certifications, setCertifications] = useState([]);
  const [userCerts, setUserCerts] = useState([]);
  const [userPaths, setUserPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => { const r = () => setIsMobile(window.innerWidth < 768); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Get certifications with linked quizzes
      const { data: certsData } = await supabase
        .from("certifications")
        .select("*, learning_path:learning_paths(*)")
        .eq("is_active", true);
      setCertifications(certsData || []);

      // Get user's earned certifications
      const { data: userCertsData } = await supabase
        .from("user_certifications")
        .select("*, certification:certifications(*)")
        .eq("user_id", user.id);
      setUserCerts(userCertsData || []);

      // Get user's learning path progress
      const { data: pathsData } = await supabase
        .from("user_learning_paths")
        .select("*, learning_path:learning_paths(*)")
        .eq("user_id", user.id);
      setUserPaths(pathsData || []);

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const getUserCert = (certId) => userCerts.find(uc => uc.certification_id === certId);
  
  const getPathProgress = (pathId) => {
    const userPath = userPaths.find(up => up.learning_path_id === pathId);
    return userPath?.progress_percentage || 0;
  };

  const canTakeExam = (cert) => {
    if (!cert.learning_path_id) return false;
    const progress = getPathProgress(cert.learning_path_id);
    return progress >= 100;
  };

  const handleExamComplete = async (certId, score, passed) => {
    if (passed) {
      // Refresh certifications to show newly earned cert
      const { data: userCertsData } = await supabase
        .from("user_certifications")
        .select("*, certification:certifications(*)")
        .eq("user_id", user.id);
      setUserCerts(userCertsData || []);
    }
    setActiveExam(null);
  };

  if (loading) return <div style={{ color: T.muted, padding: 40 }}>Loading certifications...</div>;

  // Show exam if active
  if (activeExam) {
    return (
      <CertificationExam
        certification={activeExam}
        user={user}
        onComplete={(score, passed) => handleExamComplete(activeExam.id, score, passed)}
        onCancel={() => setActiveExam(null)}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: T.text, fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Certifications
        </h1>
        <p style={{ color: T.muted, fontSize: 15 }}>
          Earn official TierShift credentials by completing learning paths and passing exams
        </p>
      </div>

      {/* Earned Certifications */}
      {userCerts.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            Your Certifications ({userCerts.length})
          </h2>
          <div style={{ display: "grid", gap: 16 }}>
            {userCerts.map(uc => (
              <CertificationCard
                key={uc.id}
                userCert={uc}
                certification={uc.certification}
                user={user}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Certifications */}
      <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        {userCerts.length > 0 ? "More Certifications" : "Available Certifications"}
      </h2>
      <div style={{ display: "grid", gap: 16 }}>
        {certifications.filter(c => !getUserCert(c.id)).map(cert => {
          const progress = cert.learning_path_id ? getPathProgress(cert.learning_path_id) : 0;
          const examReady = canTakeExam(cert);

          return (
            <div
              key={cert.id}
              style={{
                background: T.card,
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${examReady ? cert.color || T.cyan : T.border}`,
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}
            >
              <div style={{display: "flex", gap: 16, alignItems: "flex-start"}}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: dim(cert.color || T.violet, 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                flexShrink: 0
              }}>
                {examReady ? "\uD83D\uDCDD" : "\uD83D\uDCDC"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ color: T.text, margin: 0, marginBottom: 8, fontSize: 18 }}>
                  {cert.name}
                </h3>
                <p style={{ color: T.muted, margin: 0, fontSize: 14, marginBottom: 12 }}>
                  {cert.description}
                </p>
                
                {/* Progress bar for path */}
                {cert.learning_path_id && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: T.muted, fontSize: 12 }}>Path Progress</span>
                      <span style={{ color: progress >= 100 ? T.success : T.cyan, fontSize: 12, fontWeight: 600 }}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div style={{
                      height: 6,
                      background: T.surface,
                      borderRadius: 3,
                      overflow: "hidden"
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(progress, 100)}%`,
                        background: progress >= 100 ? T.success : T.cyan,
                        borderRadius: 3,
                        transition: "width 0.3s"
                      }} />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 16, fontSize: 13, color: T.muted }}>
                  <span>{EMOJI_CHART} Passing: {cert.passing_score}%</span>
                  {cert.validity_months && (
                    <span>{EMOJI_CLOCK} Valid: {cert.validity_months} months</span>
                  )}
                </div>
              </div>
              </div>
              <div style={{ textAlign: "right", marginTop: 8 }}>
                {examReady ? (
                  <button
                    onClick={() => setActiveExam(cert)}
                    style={{
                      padding: "12px 24px",
                      background: cert.color || T.cyan,
                      color: T.bg,
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 14
                    }}
                  >
                    Take Exam
                  </button>
                ) : cert.learning_path ? (
                  <button
                    onClick={() => onPathClick && onPathClick(cert.learning_path)}
                    style={{
                      padding: "12px 24px",
                      background: T.surface,
                      color: T.text,
                      border: `1px solid ${T.border}`,
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 14
                    }}
                  >
                    Complete Path First
                  </button>
                ) : (
                  <span style={{ color: T.muted, fontSize: 13 }}>Coming soon</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// CERTIFICATION EXAM
// ============================================
function CertificationExam({ certification, user, onComplete, onCancel }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef(null);

  // Find quiz for this certification
  useEffect(() => {
    const loadExam = async () => {
      // Find quiz matching certification name
      const { data: quizzes } = await supabase
        .from("quizzes")
        .select("*")
        .ilike("title", `%${certification.slug.replace(/-/g, " ")}%`);

      // Fallback: search by certification name
      let quiz = quizzes?.[0];
      if (!quiz) {
        const { data: fallbackQuizzes } = await supabase
          .from("quizzes")
          .select("*")
          .ilike("title", `%${certification.name.split(" ")[1]}%certification%`);
        quiz = fallbackQuizzes?.[0];
      }

      if (quiz) {
        setQuiz(quiz);
        setTimeLeft(quiz.time_limit_minutes * 60);

        // Load questions
        const { data: questionsData } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quiz.id)
          .order("question_number");
        
        // Shuffle questions for variety
        const shuffled = questionsData ? [...questionsData].sort(() => Math.random() - 0.5) : [];
        setQuestions(shuffled);
      }
      setLoading(false);
    };
    loadExam();
  }, [certification]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || result) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, result]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId, answerId) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);

    // Calculate score
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(q => {
      totalPoints += q.points || 10;
      if (answers[q.id] === q.correct_answer) {
        correct++;
        earnedPoints += q.points || 10;
      }
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= certification.passing_score;

    setResult({ score, passed, correct, total: questions.length });

    // If passed, issue certification
    if (passed) {
      const credentialId = `TS-${certification.slug.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;
      const expiresAt = certification.validity_months
        ? new Date(Date.now() + certification.validity_months * 30 * 24 * 60 * 60 * 1000)
        : null;

      await supabase.from("user_certifications").insert({
        user_id: user.id,
        certification_id: certification.id,
        credential_id: credentialId,
        score,
        is_valid: true,
        expires_at: expiresAt
      });
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: T.muted }}>
        Loading exam...
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>{'\u26A0'}</div>
        <h2 style={{ color: T.text, marginBottom: 12 }}>Exam Not Available</h2>
        <p style={{ color: T.muted, marginBottom: 24 }}>
          The exam for this certification is not yet available.
        </p>
        <button
          onClick={onCancel}
          style={{
            padding: "12px 24px",
            background: T.surface,
            color: T.text,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Show result
  if (result) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
        <div style={{
          background: T.card,
          borderRadius: 20,
          padding: 40,
          textAlign: "center",
          border: `2px solid ${result.passed ? T.success : T.danger}`
        }}>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: dim(result.passed ? T.success : T.danger, 0.2),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            margin: "0 auto 24px"
          }}>
            {result.passed ? "\uD83C\uDF89" : "\uD83D\uDCDA"}
          </div>

          <h1 style={{ 
            color: result.passed ? T.success : T.danger, 
            fontSize: 28, 
            marginBottom: 8 
          }}>
            {result.passed ? "Congratulations!" : "Not Quite"}
          </h1>

          <p style={{ color: T.muted, marginBottom: 24 }}>
            {result.passed 
              ? `You passed the ${certification.name} exam!`
              : `You need ${certification.passing_score}% to pass. Keep studying!`
            }
          </p>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            marginBottom: 32
          }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: T.text }}>
                {result.score}%
              </div>
              <div style={{ color: T.muted, fontSize: 13 }}>Your Score</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: T.text }}>
                {result.correct}/{result.total}
              </div>
              <div style={{ color: T.muted, fontSize: 13 }}>Correct</div>
            </div>
          </div>

          {!result.passed && (
            <button
              onClick={() => setShowReview(true)}
              style={{
                padding: "12px 24px",
                background: T.surface,
                color: T.text,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                cursor: "pointer",
                marginRight: 12
              }}
            >
              Review Answers
            </button>
          )}

          <button
            onClick={() => onComplete(result.score, result.passed)}
            style={{
              padding: "12px 24px",
              background: result.passed ? T.success : T.cyan,
              color: T.bg,
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {result.passed ? "View Certificate" : "Back to Certifications"}
          </button>
        </div>

        {/* Review Section */}
        {showReview && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ color: T.text, marginBottom: 20 }}>Review Answers</h2>
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct_answer;
              const options = JSON.parse(typeof q.options === 'string' ? q.options : JSON.stringify(q.options));

              return (
                <div
                  key={q.id}
                  style={{
                    background: T.card,
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 16,
                    border: `1px solid ${isCorrect ? T.success : T.danger}40`
                  }}
                >
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <span style={{
                      color: isCorrect ? T.success : T.danger,
                      fontSize: 14,
                      fontWeight: 600
                    }}>
                      {isCorrect ? '\u2713' : "\u2717"} Q{idx + 1}
                    </span>
                  </div>
                  <p style={{ color: T.text, marginBottom: 12 }}>{q.question_text}</p>
                  
                  <div style={{ fontSize: 14 }}>
                    <div style={{ color: T.muted, marginBottom: 4 }}>
                      Your answer: <span style={{ color: isCorrect ? T.success : T.danger }}>
                        {options.find(o => o.id === userAnswer)?.text || "Not answered"}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div style={{ color: T.success }}>
                        Correct: {options.find(o => o.id === q.correct_answer)?.text}
                      </div>
                    )}
                  </div>
                  
                  {q.explanation && (
                    <div style={{
                      marginTop: 12,
                      padding: 12,
                      background: T.surface,
                      borderRadius: 8,
                      color: T.muted,
                      fontSize: 13
                    }}>
                      {EMOJI_BULB} {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const question = questions[currentQ];
  const options = JSON.parse(typeof question.options === 'string' ? question.options : JSON.stringify(question.options));
  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      {/* Header */}
      <div style={{
        background: T.card,
        padding: "16px 24px",
        borderRadius: 12,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h2 style={{ color: T.text, margin: 0, fontSize: 18 }}>
            {certification.name} Exam
          </h2>
          <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
            Question {currentQ + 1} of {questions.length} {EMOJI_BULLET} {answeredCount} answered
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            padding: "8px 16px",
            background: timeLeft < 300 ? dim(T.danger, 0.2) : T.surface,
            borderRadius: 8,
            color: timeLeft < 300 ? T.danger : T.text,
            fontFamily: "monospace",
            fontSize: 18,
            fontWeight: 600
          }}>
            {EMOJI_CLOCK} {formatTime(timeLeft)}
          </div>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              background: "transparent",
              color: T.muted,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 4,
        background: T.surface,
        borderRadius: 2,
        marginBottom: 32,
        overflow: "hidden"
      }}>
        <div style={{
          height: "100%",
          width: `${((currentQ + 1) / questions.length) * 100}%`,
          background: T.cyan,
          transition: "width 0.3s"
        }} />
      </div>

      {/* Question */}
      <div style={{
        background: T.card,
        borderRadius: 16,
        padding: 32,
        marginBottom: 24
      }}>
        <h3 style={{ color: T.text, fontSize: 20, marginBottom: 24, lineHeight: 1.5 }}>
          {question.question_text}
        </h3>

        <div style={{ display: "grid", gap: 12 }}>
          {options.map(option => {
            const isSelected = answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(question.id, option.id)}
                style={{
                  padding: 16,
                  background: isSelected ? dim(T.cyan, 0.15) : T.surface,
                  border: `2px solid ${isSelected ? T.cyan : T.border}`,
                  borderRadius: 12,
                  color: T.text,
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.2s"
                }}
              >
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: isSelected ? T.cyan : T.card,
                  color: isSelected ? T.bg : T.muted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 13,
                  flexShrink: 0
                }}>
                  {option.id.toUpperCase()}
                </span>
                {option.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
          disabled={currentQ === 0}
          style={{
            padding: "12px 24px",
            background: T.surface,
            color: currentQ === 0 ? T.muted : T.text,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            cursor: currentQ === 0 ? "not-allowed" : "pointer"
          }}
        >
          {'\u2190'} Previous
        </button>

        {/* Question dots */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 400 }}>
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(idx)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: idx === currentQ 
                  ? T.cyan 
                  : answers[q.id] 
                    ? dim(T.success, 0.3) 
                    : T.surface,
                color: idx === currentQ ? T.bg : answers[q.id] ? T.success : T.muted,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQ === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "12px 24px",
              background: answeredCount === questions.length ? T.success : T.warning,
              color: T.bg,
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {submitting ? "Submitting..." : `Submit (${answeredCount}/${questions.length})`}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}
            style={{
              padding: "12px 24px",
              background: T.cyan,
              color: T.bg,
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Next >
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// CERTIFICATION CARD (Earned)
// ============================================
function CertificationCard({ userCert, certification, user }) {
  const [showShare, setShowShare] = useState(false);
  const [generating, setGenerating] = useState(false);

  const shareUrl = `${window.location.origin}/verify/${userCert.credential_id}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied!");
  };

  const downloadPDF = async () => {
    setGenerating(true);
    const pdfContent = generateCertificatePDF(userCert, certification, user);
    
    const blob = new Blob([pdfContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TierShift-${certification.slug}-${userCert.credential_id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerating(false);
  };

  const isExpired = userCert.expires_at && new Date(userCert.expires_at) < new Date();

  return (
    <div style={{
      background: `linear-gradient(135deg, ${dim(certification.color || T.violet, 0.2)} 0%, ${T.card} 100%)`,
      borderRadius: 16,
      padding: 24,
      border: `2px solid ${certification.color || T.violet}40`,
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: `${certification.color || T.violet}10`,
        pointerEvents: "none"
      }} />
      
      <div style={{ display: "flex", gap: 20, alignItems: "center", position: "relative", flexWrap: "wrap" }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 16,
          background: dim(certification.color || T.violet, 0.2),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          flexShrink: 0,
          boxShadow: `0 0 20px ${certification.color || T.violet}30`
        }}>
          {EMOJI_TROPHY}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3 style={{ color: T.text, margin: 0, fontSize: 20, fontWeight: 700 }}>
              {certification.name}
            </h3>
            {isExpired ? (
              <span style={{
                padding: "2px 8px",
                background: dim(T.danger, 0.15),
                color: T.danger,
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600
              }}>
                EXPIRED
              </span>
            ) : (
              <span style={{
                padding: "2px 8px",
                background: dim(T.success, 0.15),
                color: T.success,
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600
              }}>
                VERIFIED
              </span>
            )}
          </div>
          
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>
            Credential ID: <span style={{ color: T.text, fontFamily: "monospace" }}>{userCert.credential_id}</span>
          </div>
          
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: T.muted }}>
            <span>{EMOJI_CALENDAR} Earned: {new Date(userCert.earned_at).toLocaleDateString()}</span>
            {userCert.score && <span>{EMOJI_CHART} Score: {userCert.score}%</span>}
            {userCert.expires_at && (
              <span style={{ color: isExpired ? T.danger : T.muted }}>
                {EMOJI_CLOCK} {isExpired ? "Expired" : "Valid until"}: {new Date(userCert.expires_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowShare(!showShare)}
            style={{
              padding: "10px 16px",
              background: T.surface,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13
            }}
          >
            Share
          </button>
          <button
            onClick={downloadPDF}
            disabled={generating}
            style={{
              padding: "10px 16px",
              background: certification.color || T.violet,
              color: T.bg,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13
            }}
          >
            {generating ? "..." : "Download"}
          </button>
        </div>
      </div>
      
      {showShare && (
        <div style={{
          marginTop: 16,
          padding: 16,
          background: T.surface,
          borderRadius: 8,
          display: "flex",
          gap: 8
        }}>
          <input
            readOnly
            value={shareUrl}
            style={{
              flex: 1,
              padding: 10,
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              color: T.text,
              fontSize: 13
            }}
          />
          <button
            onClick={copyToClipboard}
            style={{
              padding: "10px 16px",
              background: T.cyan,
              color: T.bg,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// PDF GENERATOR
// ============================================
function generateCertificatePDF(userCert, certification, user) {
  const earnedDate = new Date(userCert.earned_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${certification.name} - TierShift Academy</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #060a12;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .certificate {
      background: linear-gradient(135deg, #131e30 0%, #0a1020 100%);
      border: 3px solid ${certification.color || "#a78bfa"};
      border-radius: 24px;
      padding: 60px;
      max-width: 800px;
      width: 100%;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .certificate::before {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, ${certification.color || "#a78bfa"}10 0%, transparent 50%);
      pointer-events: none;
    }
    .logo { font-size: 28px; font-weight: 800; margin-bottom: 40px; }
    .logo span:first-child { color: #00e5ff; }
    .logo span:last-child { color: #a78bfa; }
    .academy { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; }
    .icon { font-size: 80px; margin: 30px 0; }
    .name { color: #e8edf5; font-size: 32px; font-weight: 800; margin-bottom: 8px; }
    .awarded-to { color: #64748b; font-size: 14px; margin-bottom: 20px; }
    .cert-title { color: ${certification.color || "#a78bfa"}; font-size: 28px; font-weight: 700; margin-bottom: 16px; }
    .description { color: #64748b; font-size: 14px; margin-bottom: 40px; }
    .details { display: flex; justify-content: center; gap: 40px; margin-bottom: 40px; }
    .detail { text-align: center; }
    .detail-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .detail-value { color: #e8edf5; font-size: 16px; font-weight: 600; }
    .credential-id { font-family: monospace; color: #00e5ff; }
    .verify { padding: 20px; background: #101828; border-radius: 12px; }
    .verify-label { color: #64748b; font-size: 12px; margin-bottom: 8px; }
    .verify-url { color: #00e5ff; font-size: 14px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="logo">
      <span>TIER</span><span>SHIFT</span>
      <div class="academy">Academy</div>
    </div>
    
    <div class="icon">{EMOJI_TROPHY}</div>
    
    <div class="content">
      <div class="name">${user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Graduate"}</div>
      <div class="awarded-to">has successfully completed the requirements for</div>
      <div class="cert-title">${certification.name}</div>
      <div class="description">${certification.description || ""}</div>
    </div>
    
    <div class="details">
      <div class="detail">
        <div class="detail-label">Credential ID</div>
        <div class="detail-value credential-id">${userCert.credential_id}</div>
      </div>
      <div class="detail">
        <div class="detail-label">Date Issued</div>
        <div class="detail-value">${earnedDate}</div>
      </div>
      ${userCert.score ? `
      <div class="detail">
        <div class="detail-label">Score</div>
        <div class="detail-value">${userCert.score}%</div>
      </div>
      ` : ""}
      ${userCert.expires_at ? `
      <div class="detail">
        <div class="detail-label">Valid Until</div>
        <div class="detail-value">${new Date(userCert.expires_at).toLocaleDateString()}</div>
      </div>
      ` : ""}
    </div>
    
    <div class="verify">
      <div class="verify-label">Verify this credential at</div>
      <div class="verify-url">${window.location.origin}/verify/${userCert.credential_id}</div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================
// VERIFICATION PAGE (Public)
// ============================================
export function VerifyCredentialPage({ credentialId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const { data: certData, error } = await supabase
        .from("user_certifications")
        .select(`
          *,
          certification:certifications(*)
        `)
        .eq("credential_id", credentialId)
        .single();

      if (error || !certData) {
        setNotFound(true);
      } else {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("display_name")
          .eq("user_id", certData.user_id)
          .single();
        
        setData({ ...certData, profile });
      }
      setLoading(false);
    };
    verify();
  }, [credentialId]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: T.muted
      }}>
        Verifying credential...
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{
        minHeight: "100vh",
        background: T.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20
      }}>
        <div style={{
          background: T.card,
          padding: 40,
          borderRadius: 20,
          textAlign: "center",
          maxWidth: 400
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>{'\u274C'}</div>
          <h1 style={{ color: T.danger, marginBottom: 12 }}>Invalid Credential</h1>
          <p style={{ color: T.muted }}>
            The credential ID "{credentialId}" was not found in our records.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
  const isValid = data.is_valid && !isExpired;

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <div style={{
        background: T.card,
        padding: 40,
        borderRadius: 24,
        maxWidth: 500,
        width: "100%",
        border: `2px solid ${isValid ? T.success : T.danger}`,
        textAlign: "center"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 20px",
          background: dim(isValid ? T.success : T.danger, 0.15),
          color: isValid ? T.success : T.danger,
          borderRadius: 30,
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 24
        }}>
          {isValid ? "(check) VERIFIED" : "'\u2717' " + (isExpired ? "EXPIRED" : "INVALID")}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.cyan }}>
            TIER<span style={{ color: T.violet }}>SHIFT</span>
          </div>
          <div style={{ color: T.muted, fontSize: 12, textTransform: "uppercase", letterSpacing: 2 }}>
            Academy
          </div>
        </div>

        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: dim(data.certification?.color || T.violet, 0.2),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          margin: "0 auto 24px"
        }}>
          {EMOJI_TROPHY}
        </div>

        <h1 style={{ color: T.text, fontSize: 24, marginBottom: 8 }}>
          {data.certification?.name}
        </h1>

        <p style={{ color: T.muted, marginBottom: 24 }}>
          Awarded to <span style={{ color: T.text, fontWeight: 600 }}>
            {data.profile?.display_name || "User"}
          </span>
        </p>

        <div style={{
          background: T.surface,
          borderRadius: 12,
          padding: 20,
          marginBottom: 24
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>
                Credential ID
              </div>
              <div style={{ color: T.cyan, fontFamily: "monospace", fontSize: 13 }}>
                {data.credential_id}
              </div>
            </div>
            <div>
              <div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>
                Issue Date
              </div>
              <div style={{ color: T.text, fontSize: 13 }}>
                {new Date(data.earned_at).toLocaleDateString()}
              </div>
            </div>
            {data.score && (
              <div>
                <div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>
                  Score
                </div>
                <div style={{ color: T.text, fontSize: 13 }}>
                  {data.score}%
                </div>
              </div>
            )}
            {data.expires_at && (
              <div>
                <div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>
                  {isExpired ? "Expired" : "Valid Until"}
                </div>
                <div style={{ color: isExpired ? T.danger : T.text, fontSize: 13 }}>
                  {new Date(data.expires_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>

        <p style={{ color: T.muted, fontSize: 12 }}>
          This credential was issued by TierShift Academy
        </p>
      </div>
    </div>
  );
}
