import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero-v2">
      <div className="hero-orb orb-a" /><div className="hero-orb orb-b" />
      <div className="hero-inner-v2 wrap">
        <div className="hero-copy">
          <span className="hero-pill">✦ SMART RELOCATION PLATFORM</span>
          <h1><span className="hero-highlight">Move smarter.</span><br /><span>Settle faster.</span></h1>
          <p>One simple platform for quotes, packing, moving, payments and live shipment tracking — from your old door to your new home.</p>
          <div className="hero-ctas">
            <Link to="/quote" className="btn btn-primary">Get instant quote <span>↗</span></Link>
            <Link to="/track" className="btn btn-glass">Track a move</Link>
          </div>
          <div className="hero-trust"><span>●</span> Transparent pricing <span>●</span> Live tracking <span>●</span> Verified crew</div>
        </div>
        <div className="hero-visual">
          <div className="route-card">
            <div className="route-top"><span>LIVE MOVE PREVIEW</span><b>● ON TIME</b></div>
            <div className="route-map">
              <div className="map-grid" />
              <div className="route-line"><i /><em /><strong /></div>
              <div className="pin pin-a">A</div><div className="pin pin-b">B</div>
              <div className="mini-truck">▰</div>
            </div>
            <div className="route-bottom"><div><small>PICKUP</small><b>Jaipur</b></div><div className="route-arrow">→</div><div><small>DELIVERY</small><b>Delhi</b></div><div className="eta"><small>ETA</small><b>4h 20m</b></div></div>
          </div>
          <div className="float-card float-price"><small>ESTIMATED MOVE</small><b>₹8,450</b><span>2BHK · 270 km</span></div>
          <div className="float-card float-safe"><span className="check">✓</span><div><b>Move protected</b><small>Tracking enabled</small></div></div>
        </div>
      </div>
    </section>
  );
}
