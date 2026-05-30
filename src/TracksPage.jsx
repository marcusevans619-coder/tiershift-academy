export default function TracksPage({ tracks, setSelectedTrack, setPage }) {
  return (
    <div style={{padding:'20px', color:'white'}}>
      <h2>Career Tracks</h2>
      <p style={{color:'#aaa', marginBottom:'20px'}}>Click any track to explore modules or enroll.</p>
      {tracks && tracks.length > 0 ? (
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'20px', marginTop:'20px'}}>
          {tracks.map(t => (
            <div 
              key={t.id} 
              style={{
                padding:'20px',
                border:`1px solid ${t.color || '#333'}`,
                borderRadius:'12px',
                backgroundColor:'#0f1419',
                cursor:'pointer',
                transition:'all 0.3s'
              }} 
              onClick={() => {
                setSelectedTrack(t);
                setPage("track-modules");
              }}
            >
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                <span style={{fontSize:'24px'}}>{t.icon}</span>
                <h3 style={{color: t.color || '#00d4ff', margin:0, fontSize:'18px'}}>{t.title}</h3>
              </div>
              <p style={{color:'#aaa', margin:'10px 0', fontSize:'14px'}}>{t.total_modules} modules * {t.total_hours}h * {t.total_labs} labs</p>
              <p style={{color:'#bbb', margin:'10px 0', fontSize:'14px'}}>{t.description}</p>
              <p style={{color: t.color || '#00d4ff', margin:'10px 0 0 0', fontSize:'12px', cursor:'pointer'}}>Click to explore & enroll ?</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{color:'#aaa', marginTop:'20px'}}>No tracks available</p>
      )}
    </div>
  );
}
