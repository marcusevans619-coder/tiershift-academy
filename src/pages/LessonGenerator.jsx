import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../supabase';

const YOUTUBE_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const SUPABASE_URL = 'https://bbyvxfluwsiutmoosesz.supabase.co';

const S = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' },
  modal: { background:'#0d1117', border:'1px solid #1e293b', borderRadius:12, width:'95%', maxWidth:900, maxHeight:'85vh', overflowY:'auto', padding:20 },
  title: { fontSize:18, fontWeight:700, color:'#f1f5f9', marginBottom:4 },
  sub: { fontSize:13, color:'#64748b', marginBottom:24 },
  btn: { background:'#00d4ff', color:'#0a0a0f', border:'none', borderRadius:6, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' },
  btnSecondary: { background:'transparent', color:'#94a3b8', border:'1px solid #334155', borderRadius:6, padding:'10px 20px', fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:'inherit' },
  btnRow: { display:'flex', gap:12, marginTop:24 },
  section: { marginBottom:24 },
  label: { fontSize:11, color:'#64748b', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8, display:'block' },
  videoCard: { background:'#111827', border:'1px solid #1e293b', borderRadius:8, padding:16, marginBottom:12, cursor:'pointer', display:'flex', gap:16, alignItems:'flex-start' },
  videoThumb: { width:80, height:50, borderRadius:4, objectFit:'cover', flexShrink:0 },
  videoTitle: { fontSize:14, fontWeight:600, color:'#e2e8f0', marginBottom:4 },
  videoChannel: { fontSize:12, color:'#64748b' },
  selected: { border:'2px solid #00d4ff' },
  outline: { background:'#111827', border:'1px solid #1e293b', borderRadius:8, padding:20, fontSize:13, color:'#cbd5e1', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:"'Outfit', sans-serif" },
  status: { fontSize:13, color:'#00d4ff', marginBottom:16, padding:'10px 14px', background:'#00d4ff11', borderRadius:6, border:'1px solid #00d4ff33' },
  iframe: { width:'100%', height:300, borderRadius:8, border:'none', marginBottom:16 },
  closeBtn: { float:'right', background:'transparent', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' },
  transcriptBadge: { display:'inline-block', fontSize:11, padding:'2px 8px', borderRadius:4, marginBottom:12 },
};

export default function LessonGenerator({ module, onClose, onSaved }) {
  const [step, setStep] = useState('search');
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [outline, setOutline] = useState('');
  const [usedTranscript, setUsedTranscript] = useState(false);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function searchYouTube() {
    setLoading(true);
    setStatus('Searching YouTube...');
    try {
      const q = encodeURIComponent(module.name + ' IT training tutorial');
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=5&videoDuration=medium&key=${YOUTUBE_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setVideos(data.items || []);
      setStep('pick');
      setStatus('');
    } catch (err) {
      setStatus('YouTube search failed: ' + err.message);
    }
    setLoading(false);
  }

  async function generateOutline() {
    if (!selected) return;
    setLoading(true);
    setStep('generate');
    setStatus('Fetching transcript and generating lesson report...');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          videoId: selected.id.videoId,
          videoTitle: selected.snippet.title,
          moduleName: module.name,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setOutline(data.outline);
      setUsedTranscript(data.usedTranscript);
      setTitle(module.name + ' - ' + selected.snippet.title.slice(0, 50));
      setStep('preview');
      setStatus('');
    } catch (err) {
      setStatus('Generation failed: ' + err.message);
      setStep('pick');
    }
    setLoading(false);
  }

  async function saveLesson() {
    setLoading(true);
    setStatus('Saving...');
    const videoId = selected.id.videoId;
    const content = `VIDEO:${videoId}\n\n${outline}`;
    const { error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title,
      content,
      lesson_number: 1,
    });
    console.error("Save error:", error); if (error) { setStatus('Save failed: ' + error.message);
    } else {
      setStatus('Saved!');
      setTimeout(() => { onSaved(); onClose(); }, 800);
    }
    setLoading(false);
  }

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <button style={S.closeBtn} onClick={onClose}>X</button>
        <div style={S.title}>{module.name}</div>
        <div style={S.sub}>Find a video and generate a lesson report from its transcript</div>

        {status && <div style={S.status}>{status}</div>}

        {step === 'search' && (
          <div>
            <p style={{ color:'#94a3b8', fontSize:13, marginBottom:20 }}>
              Click below to search YouTube for the best video on <strong style={{color:'#e2e8f0'}}>{module.name}</strong>.
              Claude will read the video transcript and generate a structured lesson report.
            </p>
            <button style={S.btn} onClick={searchYouTube} disabled={loading}>
              {loading ? 'Searching...' : 'Search YouTube'}
            </button>
          </div>
        )}

        {step === 'pick' && (
          <div>
            <span style={S.label}>Select the best video</span>
            {videos.map(v => (
              <div key={v.id.videoId}
                style={{ ...S.videoCard, ...(selected?.id?.videoId === v.id.videoId ? S.selected : {}) }}
                onClick={() => setSelected(v)}>
                <img style={S.videoThumb} src={v.snippet.thumbnails.medium.url} alt="" />
                <div>
                  <div style={S.videoTitle}>{v.snippet.title}</div>
                  <div style={S.videoChannel}>{v.snippet.channelTitle}</div>
                </div>
              </div>
            ))}
            <div style={S.btnRow}>
              <button style={S.btn} onClick={generateOutline} disabled={!selected || loading}>
                {loading ? 'Generating...' : 'Generate Lesson Report'}
              </button>
              <button style={S.btnSecondary} onClick={() => setStep('search')}>Back</button>
            </div>
          </div>
        )}

        {step === 'generate' && (
          <div style={{ textAlign:'center', padding:'40px 0', color:'#64748b', fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:16 }}>&#129302;</div>
            <div>Fetching transcript and generating lesson report...</div>
            <div style={{ marginTop:8, fontSize:12, color:'#475569' }}>This takes about 15-20 seconds</div>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <div style={S.section}>
              <span style={S.label}>Video</span>
              <iframe style={S.iframe}
                src={`https://www.youtube.com/embed/${selected.id.videoId}?cc_load_policy=1&cc_lang_pref=en`}
                allowFullScreen title="lesson video" />
              <div style={{
                ...S.transcriptBadge,
                background: usedTranscript ? '#10b98122' : '#f59e0b22',
                color: usedTranscript ? '#10b981' : '#f59e0b',
                border: `1px solid ${usedTranscript ? '#10b98144' : '#f59e0b44'}`,
              }}>
              {usedTranscript ? String.fromCodePoint(0x1F916) + ' Generated from video transcript' : String.fromCodePoint(0x1F3A5) + ' Generated from video title (no transcript available)'}
              </div>
            </div>
            <div style={S.section}>
              <span style={S.label}>Lesson Report</span>
              <div style={S.outline}><ReactMarkdown components={{
  h2: ({children}) => <h2 style={{color:'#00d4ff', fontSize:15, fontWeight:700, marginTop:20, marginBottom:8, borderBottom:'1px solid #1e293b', paddingBottom:6}}>{children}</h2>,
  h1: ({children}) => <h1 style={{color:'#f1f5f9', fontSize:17, fontWeight:800, marginBottom:12}}>{children}</h1>,
  p: ({children}) => <p style={{color:'#cbd5e1', marginBottom:10, lineHeight:1.7}}>{children}</p>,
  li: ({children}) => <li style={{color:'#94a3b8', marginBottom:4, lineHeight:1.6}}>{children}</li>,
  ul: ({children}) => <ul style={{paddingLeft:20, marginBottom:10}}>{children}</ul>,
  ol: ({children}) => <ol style={{paddingLeft:20, marginBottom:10}}>{children}</ol>,
  strong: ({children}) => <strong style={{color:'#e2e8f0'}}>{children}</strong>,
}}>{outline}</ReactMarkdown></div>
            </div>
            <div style={S.btnRow}>
              <button style={S.btn} onClick={saveLesson} disabled={loading}>
                {loading ? 'Saving...' : 'Save Lesson'}
              </button>
              <button style={S.btnSecondary} onClick={() => setStep('pick')}>Pick Different Video</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}