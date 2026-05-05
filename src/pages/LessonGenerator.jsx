import { useState } from 'react';
import { supabase } from '../supabase';

const YOUTUBE_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

const S = {
  overlay: { position:'fixed', inset:0, background:'#00000088', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' },
  modal: { background:'#0d1117', border:'1px solid #1e293b', borderRadius:12, width:'90%', maxWidth:900, maxHeight:'90vh', overflowY:'auto', padding:32 },
  title: { fontSize:18, fontWeight:700, color:'#f1f5f9', marginBottom:4 },
  sub: { fontSize:13, color:'#64748b', marginBottom:24 },
  btn: { background:'#00d4ff', color:'#0a0a0f', border:'none', borderRadius:6, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' },
  btnSecondary: { background:'transparent', color:'#94a3b8', border:'1px solid #334155', borderRadius:6, padding:'10px 20px', fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:'inherit' },
  btnRow: { display:'flex', gap:12, marginTop:24 },
  section: { marginBottom:24 },
  label: { fontSize:11, color:'#64748b', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8, display:'block' },
  videoCard: { background:'#111827', border:'1px solid #1e293b', borderRadius:8, padding:16, marginBottom:12, cursor:'pointer', display:'flex', gap:16, alignItems:'flex-start' },
  videoThumb: { width:120, height:68, borderRadius:4, objectFit:'cover', flexShrink:0 },
  videoTitle: { fontSize:14, fontWeight:600, color:'#e2e8f0', marginBottom:4 },
  videoChannel: { fontSize:12, color:'#64748b' },
  selected: { border:'2px solid #00d4ff' },
  outline: { background:'#111827', border:'1px solid #1e293b', borderRadius:8, padding:20, fontSize:13, color:'#cbd5e1', lineHeight:1.7, whiteSpace:'pre-wrap' },
  status: { fontSize:13, color:'#00d4ff', marginBottom:16 },
  iframe: { width:'100%', height:300, borderRadius:8, border:'none', marginBottom:16 },
  closeBtn: { float:'right', background:'transparent', border:'none', color:'#64748b', fontSize:20, cursor:'pointer' },
};

export default function LessonGenerator({ module, onClose, onSaved }) {
  const [step, setStep] = useState('search');
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [outline, setOutline] = useState('');
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
    setStatus('Generating outline with Claude...');
    const videoTitle = selected.snippet.title;
    const videoDesc = selected.snippet.description;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are an IT training content writer for TierShift Academy, a platform for IT professionals.

Based on this YouTube video about "${module.name}":
Title: ${videoTitle}
Description: ${videoDesc}

Write a clear, practical lesson outline with these sections:
1. What You Will Learn (3-4 bullet points)
2. Key Concepts (explain 4-5 core concepts in plain language)
3. Real-World Application (1-2 practical scenarios an IT tech would encounter)
4. Key Takeaways (3-4 bullet points)

Keep it concise, practical, and aimed at IT support professionals. Use plain language. No fluff.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      setOutline(text);
      setTitle(module.name + ' — ' + videoTitle.slice(0, 50));
      setStep('preview');
      setStatus('');
    } catch (err) {
      setStatus('Generation failed: ' + err.message);
    }
    setLoading(false);
  }

  async function saveLesson() {
    setLoading(true);
    setStatus('Saving to Supabase...');
    const videoId = selected.id.videoId;
    const content = `VIDEO:${videoId}\n\n${outline}`;
    const { error } = await supabase.from('lessons').insert({
      module_id: module.id,
      title,
      content,
      sort_order: 1,
    });
    if (error) {
      setStatus('Save failed: ' + error.message);
    } else {
      setStatus('Saved!');
      setTimeout(() => { onSaved(); onClose(); }, 800);
    }
    setLoading(false);
  }

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <button style={S.closeBtn} onClick={onClose}>×</button>
        <div style={S.title}>Generate Lesson — {module.name}</div>
        <div style={S.sub}>Find a video and auto-generate a lesson outline</div>

        {status && <div style={S.status}>{status}</div>}

        {step === 'search' && (
          <div>
            <p style={{ color:'#94a3b8', fontSize:13, marginBottom:20 }}>
              Click below to search YouTube for the best video on <strong style={{color:'#e2e8f0'}}>{module.name}</strong>.
            </p>
            <button style={S.btn} onClick={searchYouTube} disabled={loading}>
              {loading ? 'Searching...' : 'Search YouTube'}
            </button>
          </div>
        )}

        {step === 'pick' && (
          <div>
            <div style={S.section}>
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
            </div>
            <div style={S.btnRow}>
              <button style={S.btn} onClick={generateOutline} disabled={!selected || loading}>
                {loading ? 'Generating...' : 'Generate Outline'}
              </button>
              <button style={S.btnSecondary} onClick={() => setStep('search')}>Back</button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <div style={S.section}>
              <span style={S.label}>Video Preview</span>
              <iframe style={S.iframe}
                src={`https://www.youtube.com/embed/${selected.id.videoId}`}
                allowFullScreen title="lesson video" />
            </div>
            <div style={S.section}>
              <span style={S.label}>Generated Outline</span>
              <div style={S.outline}>{outline}</div>
            </div>
            <div style={S.btnRow}>
              <button style={S.btn} onClick={saveLesson} disabled={loading}>
                {loading ? 'Saving...' : 'Save Lesson'}
              </button>
              <button style={S.btnSecondary} onClick={() => setStep('pick')}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}