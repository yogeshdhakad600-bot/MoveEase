const stats = [['42K+', 'Homes moved'], ['380+', 'Cities & routes'], ['1.1K', 'Moving partners'], ['4.8/5', 'Demo rating']];
export default function StatsCounter() { return <section className="stats-v2"><div className="wrap stats-grid-v2">{stats.map(([n,l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div></section>; }
