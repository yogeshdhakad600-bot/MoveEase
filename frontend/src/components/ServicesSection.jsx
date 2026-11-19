import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

const services = [
  ['📦','Household shifting','Door-to-door moving for every home size.','Complete home relocation with pickup, transport and delivery.'],
  ['🧰','Packing & unpacking','Careful packing, labels and safe unpacking.','Choose room-wise packing for fragile, kitchen and furniture items.'],
  ['💪','Loading & unloading','Trained crew for heavy and fragile items.','Professional handling at both pickup and destination.'],
  ['🛋️','Furniture moving','Padded handling for your valuable furniture.','Beds, sofas, wardrobes and tables handled with protective padding.'],
  ['🚗','Vehicle transport','Reliable car and bike relocation.','Door-to-door vehicle movement with dedicated transport options.'],
  ['🏢','Office relocation','Move equipment with minimal downtime.','Plan office moves around your schedule and reduce business interruption.'],
  ['🏬','Storage','Flexible short-term storage when you need it.','Keep packed belongings secure between two homes.'],
  ['🛣️','Long-distance moves','Local or interstate transportation.','Route planning, vehicle selection and tracking for longer journeys.'],
];

export default function ServicesSection() {
  const [selected, setSelected] = useState(null);
  const location = useLocation();

  useEffect(() => setSelected(null), [location.key]);
  useEffect(() => {
    if (!selected) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [selected]);

  return <section className="section-v2" id="services">
    <div className="section-head-v2"><span className="eyebrow-v2">WHAT WE MOVE</span><h2>Everything your move needs.</h2><p>Choose only what you need. Explore a service to see how MoveEase handles it.</p></div>
    <div className="service-grid-v2">{services.map(([icon,title,desc,detail], i) => <article className="service-card-v2" key={title} onClick={() => setSelected({icon,title,desc,detail})}>
      <div className="service-icon">{icon}</div><span className="service-no">0{i+1}</span><h3>{title}</h3><p>{desc}</p><button className="service-link" type="button">Explore service →</button>
    </article>)}</div>
    {selected && createPortal(
      <div className="service-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
          <button className="modal-close" type="button" aria-label="Close service details" onClick={() => setSelected(null)}>×</button>
          <div className="service-modal-icon">{selected.icon}</div>
          <span className="eyebrow-v2">MOVE EASE SERVICE</span>
          <h2 id="service-modal-title">{selected.title}</h2>
          <p>{selected.detail}</p>
          <div className="modal-features"><span>✓ Transparent quote</span><span>✓ Tracked shipment</span><span>✓ Verified crew</span></div>
          <Link to="/quote" className="btn btn-primary" onClick={() => setSelected(null)}>Get a quote for this service →</Link>
        </section>
      </div>,
      document.body,
    )}
  </section>;
}
