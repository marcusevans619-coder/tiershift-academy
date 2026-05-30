import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../supabase';

const T = {
  bg:"#060a12", surface:"#101828", card:"#131e30",
  border:"#1c2d44", cyan:"#00e5ff", text:"#e8edf5",
  sub:"#94a3b8", muted:"#64748b", success:"#10b981",
};

export default function LessonViewer({ module, user, onBack, onComplete }) {
  const [lessons, setLessons] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function fetchLessons() {
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', module.id)
        .order('sort_order');
      setLessons(data || []);
      setLoading(false);
    }
    fetchLessons();
  }, [module.id]);

  async function markComplete() {
    await supabase.from('user_modules').upsert({
      user_id: user.id,
      module_id: module.id,
      completed: true,
      progress_pct: 100,
    }, { onConflict: 'user_id,module_id' });
    setCompleted(true);
    setTimeout(() => onBack(), 1500);
  }

  function parseLesson(content) {
    if (!content) return { videoId: null, markdown: '' };
    const lines = content.split('\n');
    const firstLine = lines[0] || '';
    if (firstLine.startsWith('VIDEO:')) {
      const videoId = firstLine.replace('VIDEO:', '').trim();
      const markdown = lines.slice(2).join('\n');
      return { videoId, markdown };
    }
    return { videoId: null, markdown: content };
  }

  if (loading) return (
    <div style={{ padding: 40, color: T.muted, textAlign: 'center' }}>Loading lessons...</div>
  );

  if (lessons.length === 0) return (
    <div style={{ padding: 40 }}>
      <button onClick={onBack} style={{ background:'transparent', border:'none', color:T.cyan, cursor:'pointer', fontSize:14, marginBottom:24 }}>{'\u2190'} Back to Modules</button>
      <div style={{ background:T.card, border:'1px solid '+T.border, borderRadius:12, padding:40, textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>'\uD83D\uDCDA'</div>
        <h3 style={{ color:T.text, marginBottom:8 }}>No lessons yet</h3>
        <p style={{ color:T.muted, fontSize:14 }}>An admin needs to generate a lesson for this module first.</p>
      </div>
    </div>
  );

  const lesson = lessons[current];
  const { videoId, markdown } = parseLesson(lesson?.content);
  const isLast = current === lessons.length - 1;

  if (completed) return (
    <div style={{ padding:40, textAlign:'center' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>'\uD83C\uDF89'</div>
      <h2 style={{ color:T.cyan, marginBottom:8 }}>Module Complete!</h2>
      <p style={{ color:T.muted }}>Returning to dashboard...</p>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', color:T.cyan, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', gap:6 }}>
          {'\u2190'} Back to Modules
        </button>
        <span style={{ fontSize:12, color:T.muted }}>
          Lesson {current + 1} of {lessons.length}
        </span>
      </div>

      {/* Module title */}
      <h1 style={{ color:T.text, fontSize:24, fontWeight:800, marginBottom:4 }}>{module.name}</h1>
      <p style={{ color:T.muted, fontSize:13, marginBottom:24 }}>{lesson.title}</p>

      {/* Progress bar */}
      <div style={{ width:'100%', height:4, background:T.border, borderRadius:4, marginBottom:32, overflow:'hidden' }}>
        <div style={{ width: ((current+1)/lessons.length*100)+'%', height:'100%', background:T.cyan, borderRadius:4, transition:'width 0.3s' }} />
      </div>

      {/* Video */}
      {videoId && (
        <div style={{ marginBottom:28 }}>
          <iframe
            width="100%" height="420"
            src={`https://www.youtube.com/embed/${videoId}?cc_load_policy=1&cc_lang_pref=en`}
            style={{ borderRadius:10, border:'none' }}
            allowFullScreen title={lesson.title}
          />
        </div>
      )}

      {/* Lesson Report */}
      <div style={{ background:T.card, border:'1px solid '+T.border, borderRadius:12, padding:28, marginBottom:28 }}>
        <ReactMarkdown components={{
          h1: ({children}) => <h1 style={{color:T.text, fontSize:20, fontWeight:800, marginBottom:16}}>{children}</h1>,
          h2: ({children}) => <h2 style={{color:T.cyan, fontSize:15, fontWeight:700, marginTop:24, marginBottom:10, borderBottom:'1px solid '+T.border, paddingBottom:6}}>{children}</h2>,
          h3: ({children}) => <h3 style={{color:T.text, fontSize:14, fontWeight:600, marginBottom:8}}>{children}</h3>,
          p: ({children}) => <p style={{color:T.sub, lineHeight:1.8, marginBottom:12, fontSize:14}}>{children}</p>,
          li: ({children}) => <li style={{color:T.sub, lineHeight:1.7, marginBottom:6, fontSize:14}}>{children}</li>,
          ul: ({children}) => <ul style={{paddingLeft:20, marginBottom:12}}>{children}</ul>,
          ol: ({children}) => <ol style={{paddingLeft:20, marginBottom:12}}>{children}</ol>,
          strong: ({children}) => <strong style={{color:T.text, fontWeight:600}}>{children}</strong>,
          code: ({children}) => <code style={{background:T.surface, color:T.cyan, padding:'2px 6px', borderRadius:4, fontSize:13, fontFamily:'JetBrains Mono, monospace'}}>{children}</code>,
        }}>{markdown}</ReactMarkdown>
      </div>

      {/* Navigation */}
      <div style={{ display:'flex', gap:12, justifyContent:'space-between', alignItems:'center' }}>
        <button
          onClick={() => setCurrent(c => c - 1)}
          disabled={current === 0}
          style={{ background:'transparent', border:'1px solid '+T.border, color:T.muted, padding:'10px 20px', borderRadius:8, cursor: current===0 ? 'not-allowed' : 'pointer', fontSize:13, opacity: current===0 ? 0.4 : 1 }}
        >
          {'\u2190'} Previous
        </button>

        {isLast ? (
          <button onClick={markComplete} style={{ background:T.success, color:'#fff', border:'none', padding:'12px 28px', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:14 }}>
            (check) Mark Complete
          </button>
        ) : (
          <button onClick={() => setCurrent(c => c + 1)} style={{ background:T.cyan, color:T.bg, border:'none', padding:'12px 28px', borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:14 }}>
            Next Lesson >
          </button>
        )}
      </div>
    </div>
  );
}