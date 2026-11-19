import { useEffect, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { allTickets, respondTicket, deleteSupportTicket } from '../services/adminService';

function ticketStatusLabel(status) {
  if (status === 'resolved') return 'Solved';
  if (status === 'in_progress') return 'In progress';
  return 'Open';
}

export default function AdminSupportPanel({ onNotify }) {
  const [tickets, setTickets] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [error, setError] = useState('');

  async function refreshTickets() {
    try {
      setTickets(await allTickets());
      setError('');
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Could not load support tickets.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refreshTickets(); }, []);
  useAutoRefresh(refreshTickets);

  async function markSolved(ticket) {
    setSavingId(ticket._id);
    try {
      const reply = replies[ticket._id]?.trim();
      await respondTicket(ticket._id, { status: 'resolved', ...(reply ? { reply } : {}) });
      await refreshTickets();
      onNotify('Support ticket marked solved.');
    } catch (saveError) {
      onNotify(saveError.response?.data?.message || 'Could not update support ticket.', 'error');
    } finally {
      setSavingId('');
    }
  }

  async function removeTicket() {
    if (!ticketToDelete) return;
    const ticket = ticketToDelete;
    setDeletingId(ticket._id);
    try {
      await deleteSupportTicket(ticket._id);
      setTickets((current) => current.filter((item) => item._id !== ticket._id));
      onNotify('Support ticket deleted.');
    } catch (deleteError) {
      onNotify(deleteError.response?.data?.message || 'Could not delete support ticket.', 'error');
    } finally {
      setDeletingId('');
      setTicketToDelete(null);
    }
  }

  if (loading) return <p className="muted">Loading support tickets...</p>;
  if (error) return <p className="form-error">{error}</p>;

  return (
    <div className="support-ticket-list admin-support-list">
      {tickets.map((ticket) => {
        const requester = ticket.requester || ticket.customer;
        const role = ticket.requesterRole || ticket.requester?.role || 'customer';
        return (
          <article className="panel support-ticket-card" key={ticket._id}>
            <div className="support-ticket-heading">
              <div>
                <strong>{ticket.subject}</strong>
                <small>{requester?.name || 'Account'} · {role === 'driver' ? 'Driver' : 'Customer'} · {ticket.booking?.bookingId || 'General support'}</small>
              </div>
              <div className="support-ticket-controls">
                <span className={`status-badge ${ticket.status === 'resolved' ? 'driver-assigned' : ''}`}>
                  {ticketStatusLabel(ticket.status)}
                </span>
                <button className="btn btn-delete btn-sm" disabled={Boolean(deletingId)} onClick={() => setTicketToDelete(ticket)}>
                  {deletingId === ticket._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            <p>{ticket.message}</p>
            {ticket.reply && <p className="support-reply"><strong>Reply:</strong> {ticket.reply}</p>}
            {ticket.status !== 'resolved' && (
              <div className="support-ticket-actions">
                <textarea
                  className="feedback-textarea"
                  aria-label={`Reply to ${ticket.subject}`}
                  placeholder="Reply (optional)"
                  value={replies[ticket._id] || ''}
                  onChange={(event) => setReplies((current) => ({ ...current, [ticket._id]: event.target.value }))}
                />
                <button className="btn btn-primary btn-sm" disabled={savingId === ticket._id} onClick={() => markSolved(ticket)}>
                  {savingId === ticket._id ? 'Saving...' : 'Mark solved'}
                </button>
              </div>
            )}
          </article>
        );
      })}
      {!tickets.length && <div className="panel"><p className="muted">No support tickets yet.</p></div>}
      <ConfirmDialog
        open={Boolean(ticketToDelete)}
        title="Delete this support ticket?"
        message={ticketToDelete ? `“${ticketToDelete.subject}” will be permanently removed.` : ''}
        confirmLabel="Delete ticket"
        busy={Boolean(deletingId)}
        onConfirm={removeTicket}
        onCancel={() => setTicketToDelete(null)}
      />
    </div>
  );
}