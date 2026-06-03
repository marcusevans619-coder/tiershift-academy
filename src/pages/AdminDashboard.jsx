import { useEffect, useState } from 'react';
import LessonGenerator from './LessonGenerator';
import { supabase } from '../supabase';

const S = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" },
  topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px', borderBottom: '1px solid #1e293b', background: '#0d1117' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '700', color: '#00d4ff' },
  badge: { background: '#00d4ff22', color: '#00d4ff', border: '1px solid #00d4ff44', borderRadius: '4px', padding: '2px 8px', fontSize: '11px' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  signOutBtn: { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' },
  body: { padding: '32px', maxWidth: '1400px', margin: '0 auto' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subheading: { fontSize: '13px', color: '#64748b', marginBottom: '28px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' },
  statCard: { background: '#0d1117', border: '1px solid #1e293b', borderRadius: '10px', padding: '20px 24px' },
  statLabel: { fontSize: '11px', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' },
  statValue: { fontSize: '32px', fontWeight: '700', color: '#00d4ff', lineHeight: 1 },
  statSub: { fontSize: '11px', color: '#475569', marginTop: '6px' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  searchInput: { background: '#0d1117', border: '1px solid #1e293b', borderRadius: '6px', padding: '8px 14px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'inherit', width: '280px', outline: 'none' },
  exportBtn: { background: '#00d4ff15', border: '1px solid #00d4ff44', color: '#00d4ff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' },
  tableWrap: { background: '#0d1117', border: '1px solid #1e293b', borderRadius: '10px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { padding: '12px 18px', textAlign: 'left', fontSize: '11px', color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #1e293b', background: '#080c12', fontWeight: '600' },
  td: { padding: '14px 18px', borderBottom: '1px solid #111827', color: '#cbd5e1', verticalAlign: 'middle' },
  emailLink: { color: '#00d4ff', textDecoration: 'none' },
  deptBadge: { display: 'inline-block', background: '#1e293b', border: '1px solid #334155', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: '#94a3b8' },
  deleteBtn: { background: 'transparent', border: '1px solid #334155', color: '#ef444466', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' },
  empty: { padding: '60px', textAlign: 'center', color: '#475569', fontSize: '14px' },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' | ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getStats(rows) {
  const now = new Date();
  const weekAgo = new Date(now - 7 * 86400000);
  const monthAgo = new Date(now - 30 * 86400000);
  const thisWeek = rows.filter(r => new Date(r.created_at) > weekAgo).length;
  const thisMonth = rows.filter(r => new Date(r.created_at) > monthAgo).length;
  const depts = {};
  rows.forEach(r => { if (r.department) depts[r.department] = (depts[r.department] || 0) + 1; });
  const topDept = Object.entries(depts).sort((a, b) => b[1] - a[1])[0];
  return { total: rows.length, thisWeek, thisMonth, topDept };
}

function exportCSV(rows) {
  const headers = ['Name', 'Email', 'Company', 'Department', 'Submitted'];
  const lines = rows.map(r => [r.name, r.email, r.company, r.department, new Date(r.created_at).toLocaleString()].map(v => '"' + (v || '') + '"').join(','));
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'demo-requests-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
}


// Mobile breakpoint hook
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= breakpoint
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}
export default function AdminDashboard({ user, onSignOut }) {
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('leads');
  const [modules, setModules] = useState([]);
  const [generatorModule, setGeneratorModule] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(rows.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.company || '').toLowerCase().includes(q) ||
      (r.department || '').toLowerCase().includes(q)
    ));
  }, [search, rows]);

  async function fetchRequests() {
    setLoading(true);
    const [{ data, error }, { data: mods }] = await Promise.all([
      supabase.from('demo_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('modules').select('id, name').order('name'),
    ]);
    if (!error) { setRows(data); setFiltered(data); }
    setModules(mods || []);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this request?')) return;
    await supabase.from('demo_requests').delete().eq('id', id);
    setRows(prev => prev.filter(r => r.id !== id));
  }

  const stats = getStats(rows);

  return (
    <div style={S.page}>
      <div style={{...S.topbar, ...(isMobile ? { padding: '12px 16px' } : {})}}>
        <div style={S.logo}>
          <span>TS</span>
          <span>TierShift Academy</span>
          <span style={S.badge}>ADMIN</span>
        </div>
        <div style={S.topbarRight}>
          <span style={{ fontSize: '12px', color: '#475569', display: isMobile ? 'none' : 'inline' }}>{user?.email}</span>
          <button style={S.signOutBtn} onClick={onSignOut}>Sign Out</button>
        </div>
      </div>
      <div style={{...S.body, ...(isMobile ? { padding: '16px' } : {})}}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:28 }}>
          {[['leads','Demo Requests'],['cms','Content CMS']].map(([id,label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ padding:'8px 18px', borderRadius:6, border:'1px solid', fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', background: activeTab===id ? '#00d4ff' : 'transparent', color: activeTab===id ? '#0a0a0f' : '#94a3b8', borderColor: activeTab===id ? '#00d4ff' : '#334155' }}>{label}</button>
          ))}
        </div>

        {activeTab === 'leads' && <>
        <div style={S.heading}>Demo Requests</div>
        <div style={S.subheading}>All inbound leads from tiershiftacademy.com</div></>}
        <div style={{...S.statsRow, ...(isMobile ? { gridTemplateColumns: '1fr 1fr', gap: '10px' } : {})}}>
          {[
            { label: 'Total Requests', value: stats.total, sub: 'All time' },
            { label: 'This Week', value: stats.thisWeek, sub: 'Last 7 days' },
            { label: 'This Month', value: stats.thisMonth, sub: 'Last 30 days' },
            { label: 'Top Department', value: stats.topDept ? stats.topDept[1] : '---', sub: stats.topDept ? stats.topDept[0] : 'No data yet' },
          ].map((s, i) => (
            <div key={i} style={S.statCard}>
              <div style={S.statLabel}>{s.label}</div>
              <div style={S.statValue}>{s.value}</div>
              <div style={S.statSub}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{...S.toolbar, ...(isMobile ? { flexDirection: 'column', gap: '10px', alignItems: 'stretch' } : {})}}>
          <input style={{...S.searchInput, ...(isMobile ? { width: '100%' } : {})}} placeholder="Search by name, email, company..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={S.exportBtn} onClick={() => exportCSV(filtered)}>Export CSV</button>
        </div>
        <div style={{...S.tableWrap, overflowX: 'auto'}}>
          {loading ? (
            <div style={S.empty}>Loading requests...</div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>No demo requests found.</div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>{['Name', 'Email', 'Company', 'Department', 'Submitted', ''].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} onMouseEnter={e => e.currentTarget.style.background = '#111827'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={S.td}>{row.name}</td>
                    <td style={S.td}><a href={'mailto:' + row.email} style={S.emailLink}>{row.email}</a></td>
                    <td style={S.td}>{row.company}</td>
                    <td style={S.td}><span style={S.deptBadge}>{row.department || '---'}</span></td>
                    <td style={{ ...S.td, color: '#475569', fontSize: '12px' }}>{formatDate(row.created_at)}</td>
                    <td style={S.td}>
                      <button style={S.deleteBtn} onClick={() => handleDelete(row.id)}
                        onMouseEnter={e => { e.target.style.borderColor = '#ef4444'; e.target.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.target.style.borderColor = '#334155'; e.target.style.color = '#ef444466'; }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      {activeTab === 'cms' && (
        <div>
          <div style={S.heading}>Content CMS</div>
          <div style={S.subheading}>Generate AI lessons for each module</div>
          <div style={{ display:'grid', gap:12 }}>
            {modules.map(mod => (
              <div key={mod.id} style={{ background:'#0d1117', border:'1px solid #1e293b', borderRadius:8, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ color:'#e2e8f0', fontSize:14 }}>{mod.name}</span>
                <button onClick={() => setGeneratorModule(mod)} style={{ background:'#00d4ff15', border:'1px solid #00d4ff44', color:'#00d4ff', padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:12, fontFamily:'inherit' }}>
                  Generate Lesson
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {generatorModule && (
        <LessonGenerator
          module={generatorModule}
          onClose={() => setGeneratorModule(null)}
          onSaved={() => setGeneratorModule(null)}
        />
      )}
      </div>
    </div>
  );
}