import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import StatusStepper from '../components/StatusStepper';
import BookingFeedback from '../components/BookingFeedback';
import SupportCenter from '../components/SupportCenter';
import ConfirmDialog from '../components/ConfirmDialog';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { myBookings, myPayments, cancelBooking } from '../services/bookingService';

const DELIVERY_MILESTONES = ['Packing', 'Picked Up', 'Delivered'];

function currentDeliveryMilestone(status) {
  if (status === 'Delivered') return 'Delivered';
  if (['Picked Up', 'In Transit', 'Out for Delivery'].includes(status)) return 'Picked Up';
  return 'Packing';
}

const TABS = [
  { key: 'bookings', label: 'My Bookings' },
  { key: 'support', label: 'Support' },
  { key: 'feedback', label: 'Feedback' },
];

function Dashboard() {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expandedBookingId, setExpandedBookingId] = useState('');
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function refreshData() {
    myBookings().then(setBookings).catch(() => {});
    myPayments().then(setPayments).catch(() => {});
  }

  useEffect(() => {
    if (tab === 'bookings') refreshData();
  }, [tab]);
  useAutoRefresh(refreshData, tab === 'bookings');

  const totalSpent = bookings.reduce((sum, b) => sum + (b.status !== 'Cancelled' ? b.estimatedCost : 0), 0);
  const active = bookings.filter((b) => !['Delivered', 'Cancelled'].includes(b.status));
  const completed = bookings.filter((b) => b.status === 'Delivered');

  async function handleCancel() {
    if (!bookingToCancel) return;
    setCancellingBooking(true);
    try {
      setError('');
      await cancelBooking(bookingToCancel.bookingId);
      setBookings(await myBookings());
      setBookingToCancel(null);
      setNotice('Booking cancelled successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel booking.');
      setBookingToCancel(null);
    } finally {
      setCancellingBooking(false);
    }
  }

  return (
    <DashboardLayout title="Customer Dashboard"  tabs={TABS} activeTab={tab} onTabChange={setTab}>
      {error && <p className="form-error">{error}</p>}
      {notice && <p className="success-message">{notice}</p>}
      {tab === 'bookings' && (
        <>
          <div className="stats" style={{ marginBottom: 28 }}>
            <div className="stat"><b>{active.length}</b><span>Active / Upcoming</span></div>
            <div className="stat"><b>{completed.length}</b><span>Completed</span></div>
            <div className="stat"><b>₹{totalSpent.toLocaleString('en-IN')}</b><span>Total spending</span></div>
          </div>
          {bookings.map((b) => (
            <article className={`panel booking-summary-card${expandedBookingId === b._id ? ' is-expanded' : ''}`} key={b._id}>
              <button
                className="booking-summary-toggle"
                aria-expanded={expandedBookingId === b._id}
                aria-controls={`booking-details-${b._id}`}
                onClick={() => setExpandedBookingId((current) => current === b._id ? '' : b._id)}
              >
                <span className="booking-summary-main">
                  <span className="mono booking-summary-id">{b.bookingId}</span>
                  <span className="booking-summary-route">{b.pickupAddress} → {b.deliveryAddress}</span>
                </span>
                <span className="booking-summary-meta">
                  <span className="status-badge">{b.status}</span>
                  <strong>₹{b.estimatedCost.toLocaleString('en-IN')}</strong>
                  <span className="booking-details-link">{expandedBookingId === b._id ? 'Hide details' : 'View details'} <span aria-hidden="true">{expandedBookingId === b._id ? '⌃' : '⌄'}</span></span>
                </span>
              </button>
              {expandedBookingId === b._id && (
                <div className="booking-details" id={`booking-details-${b._id}`}>
                  <section className="booking-detail-section booking-progress-section">
                    <div className="booking-detail-heading"><h3>Delivery progress</h3><span>{b.status}</span></div>
                    {b.status === 'Cancelled'
                      ? <p className="booking-cancelled-note">This delivery was cancelled.</p>
                      : <StatusStepper statusFlow={DELIVERY_MILESTONES} currentStatus={currentDeliveryMilestone(b.status)} />}
                    {b.statusHistory?.some((entry) => DELIVERY_MILESTONES.includes(entry.status)) && (
                      <div className="booking-history">
                        {b.statusHistory.filter((entry) => DELIVERY_MILESTONES.includes(entry.status)).slice().reverse().map((entry, index) => (
                          <div className="booking-history-row" key={`${entry.status}-${entry.updatedAt}-${index}`}>
                            <span className="status-badge">{entry.status}</span>
                            <time>{new Date(entry.updatedAt).toLocaleString()}</time>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <div className="booking-detail-grid">
                    <section className="booking-detail-section">
                      <h3>Move details</h3>
                      <dl className="booking-detail-list">
                        <div><dt>Moving date</dt><dd>{new Date(b.movingDate).toLocaleDateString()}</dd></div>
                        <div><dt>Property</dt><dd>{b.propertyType}</dd></div>
                        <div><dt>Distance</dt><dd>{b.distanceKm} km</dd></div>
                        <div><dt>Floors / lift</dt><dd>{b.floors ?? 0} floors · {b.hasLift ? 'Lift available' : 'No lift'}</dd></div>
                        <div><dt>Truck requested</dt><dd>{b.requestedVehicle?.type || b.vehicle?.type || 'Not recorded'}</dd></div>
                        <div><dt>Assigned truck</dt><dd>{b.vehicle?.type || 'Not assigned'}</dd></div>
                        <div><dt>Driver</dt><dd>{b.driver?.name || 'Not assigned'}</dd></div>
                      </dl>
                      {b.services && <div className="booking-service-list"><span>Services</span>{Object.entries(b.services).filter(([, included]) => included).map(([service]) => <span className="booking-service-tag" key={service}>{service === 'loadingUnloading' ? 'Loading & unloading' : service[0].toUpperCase() + service.slice(1)}</span>)}{!Object.values(b.services).some(Boolean) && <span className="muted">No extra services</span>}</div>}
                    </section>

                    <section className="booking-detail-section">
                      <h3>Payment</h3>
                      <div className="payment-summary-row"><span>Estimated total</span><strong>₹{b.estimatedCost.toLocaleString('en-IN')}</strong></div>
                      {payments.filter((payment) => String(payment.booking?._id) === String(b._id)).map((payment) => (
                        <div className="booking-payment" key={payment._id}>
                          <div className="booking-payment-heading"><span className={`status-badge ${payment.status === 'success' ? 'driver-assigned' : ''}`}>{payment.status === 'success' ? 'Paid' : 'Failed'}</span><strong>₹{payment.amount.toLocaleString('en-IN')}</strong></div>
                          <dl className="booking-detail-list">
                            <div><dt>Method</dt><dd>{payment.method}</dd></div>
                            <div><dt>Paid on</dt><dd>{new Date(payment.createdAt).toLocaleDateString()}</dd></div>
                            <div><dt>Transaction</dt><dd className="mono">{payment.transactionRef}</dd></div>
                            {payment.discount > 0 && <div><dt>Discount</dt><dd>−₹{payment.discount.toLocaleString('en-IN')}</dd></div>}
                          </dl>
                        </div>
                      ))}
                      {!payments.some((payment) => String(payment.booking?._id) === String(b._id)) && <p className="muted booking-unpaid">No payment recorded yet.</p>}
                    </section>
                  </div>
                </div>
              )}
              {!['Delivered', 'Cancelled', 'In Transit', 'Out for Delivery'].includes(b.status) && (
                <button className="btn btn-delete btn-sm booking-cancel-button" onClick={() => setBookingToCancel(b)}>Cancel booking</button>
              )}
              {['In Transit', 'Out for Delivery'].includes(b.status) && <span className="booking-cancel-locked">Cancellation unavailable while delivery is in transit</span>}
            </article>
          ))}
          {!bookings.length && <p className="muted">No bookings yet — get a quote to start your first move.</p>}
        </>
      )}

      {tab === 'support' && <SupportCenter bookings={bookings} role="customer" />}
      {tab === 'feedback' && <BookingFeedback bookings={completed} role="customer" />}
      <ConfirmDialog
        open={Boolean(bookingToCancel)}
        title="Cancel this booking?"
        message={bookingToCancel ? `${bookingToCancel.bookingId} will be marked cancelled. This action cannot be undone.` : ''}
        confirmLabel="Cancel booking"
        busy={cancellingBooking}
        onConfirm={handleCancel}
        onCancel={() => setBookingToCancel(null)}
      />

    </DashboardLayout>
  );
}

export default function CustomerDashboard() {
  return <ProtectedRoute roles={['customer']}><Dashboard /></ProtectedRoute>;
}
