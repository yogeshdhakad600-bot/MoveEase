import { useEffect, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { createTicket, myTickets, deleteSupportTicket } from '../services/bookingService';

function ticketStatusLabel(status) {
  if (status === 'resolved') return 'Solved';
  if (status === 'in_progress') return 'In progress';
  return 'Open';
}

export default function SupportCenter({ bookings, role }) {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ bookingId: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [ticketToDelete, setTicketToDelete] = useState(null);

  function refreshTickets() { return myTickets().then(setTickets).catch(() => {}); }

  useEffect(() => { refreshTickets(); }, []);
  useAutoRefresh(refreshTickets);

  async function submitTicket(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await createTicket(form);
      setForm({ bookingId: '', subject: '', message: '' });
      await myTickets().then(setTickets);
      setNotice('Support ticket submitted.');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Could not submit support ticket.');
    } finally {
      setBusy(false);
    }
  }

  async function removeTicket() {
    if (!ticketToDelete) return;
    const ticket = ticketToDelete;
    setDeletingId(ticket._id);
    setError('');
    setNotice('');
    try {
      await deleteSupportTicket(ticket._id);
      setTickets((current) => current.filter((item) => item._id !== ticket._id));
      setNotice('Support ticket deleted.');
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Could not delete support ticket.');
    } finally {
      setDeletingId('');
      setTicketToDelete(null);
    }
  }

  return (
    <div className="support-center">
      <section className="panel support-form-panel">
        <h3>Contact support</h3>
        <p className="muted">Send us the issue and we’ll follow up here.</p>
        {error && <p className="form-error">{error}</p>}
        {notice && <p className="success-message">{notice}</p>}
        <form onSubmit={submitTicket}>
          <div className="field">
            <label htmlFor={`support-booking-${role}`}>Booking (optional)</label>
            <select
              id={`support-booking-${role}`}
              value={form.bookingId}
              onChange={(event) => setForm({ ...form, bookingId: event.target.value })}
            >
              <option value="">No booking selected</option>
              {bookings.map((booking) => <option key={booking._id} value={booking.bookingId}>{booking.bookingId}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`support-subject-${role}`}>Subject</label>
            <input id={`support-subject-${role}`} required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
          </div>
          <div className="field">
            <label htmlFor={`support-message-${role}`}>Message</label>
            <textarea id={`support-message-${role}`} className="feedback-textarea" required minLength={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          </div>
          <button className="btn btn-primary btn-sm" disabled={busy}>{busy ? 'Sending...' : 'Submit ticket'}</button>
        </form>
      </section>

      <section className="support-ticket-list" aria-label="Your support tickets">
        {tickets.map((ticket) => (
          <article className="panel support-ticket-card" key={ticket._id}>
            <div className="support-ticket-heading">
              <div>
                <strong>{ticket.subject}</strong>
                <small>{ticket.booking?.bookingId || 'General support'}</small>
              </div>
              <div className="support-ticket-controls">
                <span className={`status-badge ${ticket.status === 'resolved' ? 'driver-assigned' : ''}`}>{ticketStatusLabel(ticket.status)}</span>
                <button className="btn btn-delete btn-sm" disabled={Boolean(deletingId)} onClick={() => setTicketToDelete(ticket)}>
                  {deletingId === ticket._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            <p>{ticket.message}</p>
            {ticket.reply && <p className="support-reply"><strong>Support reply:</strong> {ticket.reply}</p>}
          </article>
        ))}
        {!tickets.length && <p className="muted">No support tickets yet.</p>}
      </section>
      <ConfirmDialog
        open={Boolean(ticketToDelete)}
        title="Delete this support ticket?"
        message={ticketToDelete ? `“${ticketToDelete.subject}” will be permanently removed from your support history.` : ''}
        confirmLabel="Delete ticket"
        busy={Boolean(deletingId)}
        onConfirm={removeTicket}
        onCancel={() => setTicketToDelete(null)}
      />
    </div>
  );
}