import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import BookingFeedback from '../components/BookingFeedback';
import SupportCenter from '../components/SupportCenter';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { myDeliveries, updateStatus, uploadProof } from '../services/driverService';

const FLOW = ['Booking Confirmed', 'Packing', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
const TABS = [{ key: 'deliveries', label: 'My Deliveries' }, { key: 'feedback', label: 'Feedback' }, { key: 'support', label: 'Support' }];

function Dashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [proofUrl, setProofUrl] = useState({});
  const [tab, setTab] = useState('deliveries');

  function refresh() { return myDeliveries().then(setDeliveries).catch(() => {}); }
  useEffect(() => {
    if (tab === 'deliveries') refresh();
  }, [tab]);
  useAutoRefresh(refresh, tab === 'deliveries');

  async function advance(booking) {
    const idx = FLOW.indexOf(booking.status);
    if (idx < 0 || idx >= FLOW.length - 1) return;
    await updateStatus(booking.bookingId, { status: FLOW[idx + 1] });
    refresh();
  }

  async function submitProof(bookingId) {
    if (!proofUrl[bookingId]) return;
    await uploadProof(bookingId, { deliveryProofUrl: proofUrl[bookingId] });
    refresh();
  }

  return (
    <DashboardLayout title="Driver Dashboard" tabs={TABS} activeTab={tab} onTabChange={setTab}>
      {tab === 'deliveries' && <>
      {deliveries.map((b) => (
        <div className="panel" style={{ marginBottom: 14 }} key={b._id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span className="mono" style={{ fontWeight: 600 }}>{b.bookingId}</span>
              <p className="muted">{b.customer?.name} · {b.pickupAddress} → {b.deliveryAddress}</p>
            </div>
            <span className="status-badge">{b.status}</span>
          </div>
          {b.status !== 'Delivered' && (
            <button className="btn btn-ink btn-sm" style={{ marginTop: 10 }} onClick={() => advance(b)}>Mark as {FLOW[FLOW.indexOf(b.status) + 1]}</button>
          )}
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <input placeholder="Delivery proof URL" value={proofUrl[b.bookingId] || ''} onChange={(e) => setProofUrl({ ...proofUrl, [b.bookingId]: e.target.value })} />
            <button className="btn btn-ghost-dark btn-sm" onClick={() => submitProof(b.bookingId)}>Upload proof</button>
          </div>
        </div>
      ))}
      {!deliveries.length && <p className="muted">No deliveries assigned yet.</p>}
      </>}
      {tab === 'feedback' && <BookingFeedback bookings={deliveries.filter((booking) => booking.status === 'Delivered')} role="driver" />}
      {tab === 'support' && <SupportCenter bookings={deliveries} role="driver" />}
    </DashboardLayout>
  );
}

export default function DriverDashboard() {
  return <ProtectedRoute roles={['driver']}><Dashboard /></ProtectedRoute>;
}
