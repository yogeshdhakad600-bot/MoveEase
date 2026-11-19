import { useEffect, useState } from 'react';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { listReviews } from '../services/bookingService';

const fallback = [
  { customer: { name: 'Priya M.' }, rating: 5, comment: 'Smooth 2BHK move across town, crew was careful with everything.' },
  { customer: { name: 'Arjun K.' }, rating: 5, comment: 'Tracking made it easy to know exactly when the truck would arrive.' },
  { customer: { name: 'Sana R.' }, rating: 4, comment: 'Office relocation over a weekend, back to work Monday morning.' },
];

export default function Testimonials() {
  const [reviews, setReviews] = useState(fallback);

  function refreshReviews() {
    listReviews().then((data) => { if (data?.length) setReviews(data); }).catch(() => {});
  }

  useEffect(() => { refreshReviews(); }, []);
  useAutoRefresh(refreshReviews);

  return (
    <section className="section" id="reviews">
      <div className="section-head">
        <h2>What movers are saying</h2>
      </div>
      <div className="svc-grid">
        {reviews.slice(0, 3).map((r, i) => (
          <div className="svc-card" key={i}>
            <div style={{ color: '#E8792E', fontWeight: 600 }}>{'★'.repeat(r.rating)}</div>
            <p style={{ marginTop: 10 }}>{r.comment}</p>
            <p style={{ marginTop: 12, fontWeight: 600, color: 'var(--ink)' }}>{r.customer?.name || 'Customer'}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
