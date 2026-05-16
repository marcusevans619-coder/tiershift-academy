import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
const T={bg:"#060a12",card:"#131e30",cardHi:"#182640",border:"#1c2d44",borderHi:"#263c58",cyan:"#00e5ff",emerald:"#34d399",text:"#e8edf5",sub:"#94a3b8",muted:"#64748b"};
export default function ModuleBrowser({ onSelectModule }) {
  const [tracks, setTracks] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  useEffect(() => { loadData(); }, []);
  async function loadData() {
    const [tr, mo, le] = await Promise.all([
      supabase.from('tracks').select('*').order('sort_order'),
      supabase.from('modules').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('lessons').select('module_id'),
    ]);
    setTracks(tr.data || []);
    setModules(mo.data || []);
    const map = {};
    (le.data || []).forEach(l => { map[l.module_id] = (map[l.module_id] || 0) + 1; });
    setLessonsMap(map);
    setLoading(false);
  }
  const byTrack = {};
  modules.forEach(m => { if (!byTrack[m.track_id]) byTrack[m.track_id] = []; byTrack[m.track_id].push(m); });
  const q = search.trim().toLowerCase();
  if (loading) return <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',color:T.cyan,fontFamily:"'Outfit',sans-serif",fontSize:16}}>Loading modules...</div>;
  return (
    <div style={{minHeight:'100vh',background:T.bg,fontFamily:"'Outfit',sans-serif",padding:'32px 24px'}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div style={{marginBottom:28}}>
          <h1 style={{color:T.text,fontSize:26,fontWeight:800,margin:0}}>Course Library</h1>
          <p style={{color:T.sub,fontSize:14,marginTop:6}}>{modules.length} modules across {tracks.length} tracks</p>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search modules..."
          style={{width:'100%',maxWidth:380,padding:'10px 16px',background:T.card,border:'1px solid '+T.border,borderRadius:8,color:T.text,fontSize:14,outline:'none',marginBottom:28,boxSizing:'border-box',fontFamily:'inherit'}}/>
        <div style={{display:'flex',gap:20,marginBottom:24,fontSize:12,color:T.muted}}>
          <span><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:T.emerald,marginRight:6}}/>Lessons available</span>
          <span><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:T.border,marginRight:6}}/>Coming soon</span>
        </div>
        {tracks.map(track => {
          const mods = (byTrack[track.id]||[]).filter(m => !q || m.name.toLowerCase().includes(q));
          if (!mods.length) return null;
          return (
            <div key={track.id} style={{marginBottom:36}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <h2 style={{color:T.cyan,fontSize:15,fontWeight:700,margin:0,whiteSpace:'nowrap'}}>{track.name}</h2>
                <div style={{flex:1,height:1,background:T.border}}/>
                <span style={{color:T.muted,fontSize:12,whiteSpace:'nowrap'}}>{mods.length} modules</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:10}}>
                {mods.map(m => {
                  const count = lessonsMap[m.id]||0;
                  const has = count > 0;
                  return (
                    <div key={m.id} onClick={()=>has&&onSelectModule(m)}
                      style={{background:T.card,border:'1px solid '+(has?T.borderHi:T.border),borderRadius:10,padding:'14px 16px',cursor:has?'pointer':'default',opacity:has?1:0.55,transition:'all 0.15s'}}
                      onMouseEnter={e=>{if(has){e.currentTarget.style.background=T.cardHi;e.currentTarget.style.borderColor=T.cyan+'55';}}}
                      onMouseLeave={e=>{e.currentTarget.style.background=T.card;e.currentTarget.style.borderColor=has?T.borderHi:T.border;}}>
                      <div style={{color:T.text,fontSize:13,fontWeight:600,marginBottom:8,lineHeight:1.4}}>{m.name}</div>
                      {has
                        ? <span style={{fontSize:11,color:T.emerald,background:T.emerald+'22',border:'1px solid '+T.emerald+'44',borderRadius:20,padding:'2px 10px',fontWeight:600}}>{count} lesson{count>1?'s':''} available</span>
                        : <span style={{fontSize:11,color:T.muted,background:T.border+'55',borderRadius:20,padding:'2px 10px'}}>Coming soon</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}