import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import StatusStepper from '../components/StatusStepper';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { trackBooking } from '../services/bookingService';

export default function Tracking() {
  const [id, setId] = useState(sessionStorage.getItem('lastBookingId') || '');
  const [trackedId, setTrackedId] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  async function refreshTracking() {
    try {
      setData(await trackBooking(trackedId));
    } catch {
      // Keep the last successful tracking result visible.
    }
  }

  useAutoRefresh(refreshTracking, Boolean(trackedId));

  async function handleTrack(e) {
    e?.preventDefault();
    setError(''); setData(null); setTrackedId('');
    try {
      const normalizedId = id.trim().toUpperCase();
      const result = await trackBooking(normalizedId);
      setData(result);
      setTrackedId(normalizedId);
    } catch (err) {
      setError(err.response?.data?.message || 'No booking found for that ID');
    }
  }

  return (
    <MainLayout>
      <section className="section wrap" id="track">
        <div className="section-head">
          <h2>Track your shipment</h2>
          <p>Enter your Booking ID to see live status.</p>
        </div>
        <div className="panel">
          <form className="tracker-form" onSubmit={handleTrack}>
            <input className="mono" placeholder="e.g. MV-4F82K1" value={id} onChange={(e) => setId(e.target.value)} />
            <button className="btn btn-ink">Track</button>
          </form>
          {error && <p className="form-error">{error}</p>}
          {data && (
            <>
              <div className="track-meta">
                <div><strong>{data.booking.customer?.name}</strong> · {data.booking.pickupAddress} → {data.booking.deliveryAddress}</div>
                <div>{data.booking.vehicle?.type} · Move date {new Date(data.booking.movingDate).toLocaleDateString()}</div>
              </div>
              <StatusStepper statusFlow={data.statusFlow} currentStatus={data.booking.status} />
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
