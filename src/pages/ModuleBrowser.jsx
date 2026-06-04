import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const T = {
  bg:"#060a12", surface:"#101828", card:"#131e30",
  border:"#1c2d44", cyan:"#00e5ff", violet:"#a78bfa",
  emerald:"#34d399", text:"#e8edf5", sub:"#94a3b8",
  muted:"#64748b", dim:"#475569",
};
const dim = (c, a = 0.10) => c + Math.round(a * 255).toString(16).padStart(2, '0');

export default function ModuleBrowser({ onSelectModule }) {
  const [search, setSearch] = useState('');
  const [allModules, setAllModules] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  useEffect(() => {
    supabase.from('modules').select('*').order('sort_order')
      .then(({ data }) => setAllModules(data || []));
    supabase.from('tracks').select('*').order('sort_order')
      .then(({ data }) => setTracks(data || []));
  }, []);

  const filtered = allModules.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ paddingTop: isMobile ? 56 : 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: T.text, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Course Library
        </h1>
        <p style={{ color: T.muted, fontSize: 15 }}>
          {allModules.length} modules across {tracks.length} tracks
        </p>
      </div>

      <input
        type="text"
        placeholder="Search modules..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '12px 16px', background: T.card,
          border: '1px solid ' + T.border, borderRadius: 10, color: T.text,
          fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 16
        }}
      />

      <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: T.emerald }} />
          <span style={{ color: T.sub, fontSize: 13 }}>Lessons available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: T.muted }} />
          <span style={{ color: T.sub, fontSize: 13 }}>Coming soon</span>
        </div>
        <span style={{ color: T.dim, fontSize: 13, marginLeft: 'auto' }}>
          {filtered.length} modules
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: T.card, padding: 40, borderRadius: 12, textAlign: 'center' }}>
          <p style={{ color: T.muted }}>No modules match your search</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map(mod => {
            const available = mod.is_active;
            return (
              <div
                key={mod.id}
                onClick={() => available && onSelectModule(mod)}
                style={{
                  background: T.card, border: '1px solid ' + T.border,
                  borderRadius: 12, padding: '18px 20px',
                  cursor: available ? 'pointer' : 'default',
                  opacity: available ? 1 : 0.65,
                }}
              >
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 6 : 12 }}>
                  <h3 style={{ color: available ? T.text : T.sub, margin: 0, fontSize: isMobile ? 13 : 15, fontWeight: 600 }}>
                    {mod.name}
                  </h3>
                  {available ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 12px', background: dim(T.emerald, 0.12),
                      border: '1px solid ' + T.emerald, borderRadius: 20,
                      fontSize: 11, fontWeight: 600, color: T.emerald, flexShrink: 0
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.emerald, display: 'inline-block' }} />
                      Lessons available
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: T.muted }}>Coming soon</span>
                  )}
                </div>
                {mod.description && (
                  <p style={{ color: T.muted, margin: '8px 0 0', fontSize: 13, lineHeight: 1.5 }}>
                    {mod.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}