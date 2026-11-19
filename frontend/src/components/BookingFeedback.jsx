import { useEffect, useState } from 'react';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { addFeedback, myFeedback } from '../services/feedbackService';

export default function BookingFeedback({ bookings, role }) {
  const [submittedIds, setSubmittedIds] = useState(new Set());
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submittingId, setSubmittingId] = useState('');

  function refreshFeedback() {
    myFeedback()
      .then((reviews) => setSubmittedIds(new Set(reviews.map((review) => review.booking?.bookingId).filter(Boolean))))
      .catch(() => {});
  }

  useEffect(() => { refreshFeedback(); }, []);
  useAutoRefresh(refreshFeedback);

  async function submitFeedback(event, bookingId) {
    event.preventDefault();
    const values = formValues[bookingId] || {};
    setSubmittingId(bookingId);
    setErrors((current) => ({ ...current, [bookingId]: '' }));
    try {
      await addFeedback({ bookingId, rating: Number(values.rating), comment: values.comment });
      setSubmittedIds((current) => new Set([...current, bookingId]));
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [bookingId]: error.response?.data?.message || 'Could not submit feedback.',
      }));
    } finally {
      setSubmittingId('');
    }
  }

  if (!bookings.length) {
    return <div className="panel"><p className="muted">Feedback is available after a delivery is completed.</p></div>;
  }

  return (
    <div className="booking-feedback-list">
      {bookings.map((booking) => {
        const bookingId = booking.bookingId;
        const values = formValues[bookingId] || {};
        const submitted = submittedIds.has(bookingId);
        return (
          <article className="panel booking-feedback-card" key={booking._id}>
            <div className="booking-feedback-heading">
              <div>
                <span className="mono">{bookingId}</span>
                <p className="muted">{booking.pickupAddress} → {booking.deliveryAddress}</p>
              </div>
              {submitted && <span className="status-badge driver-assigned">Feedback sent</span>}
            </div>
            {!submitted && (
              <form onSubmit={(event) => submitFeedback(event, bookingId)}>
                {errors[bookingId] && <p className="form-error">{errors[bookingId]}</p>}
                <div className="field">
                  <label htmlFor={`rating-${role}-${booking._id}`}>Rating</label>
                  <select
                    id={`rating-${role}-${booking._id}`}
                    required
                    value={values.rating || ''}
                    onChange={(event) => setFormValues((current) => ({
                      ...current,
                      [bookingId]: { ...current[bookingId], rating: event.target.value },
                    }))}
                  >
                    <option value="" disabled>Select a rating</option>
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? 'star' : 'stars'}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor={`comment-${role}-${booking._id}`}>Your feedback</label>
                  <textarea
                    id={`comment-${role}-${booking._id}`}
                    className="feedback-textarea"
                    required
                    minLength={5}
                    value={values.comment || ''}
                    onChange={(event) => setFormValues((current) => ({
                      ...current,
                      [bookingId]: { ...current[bookingId], comment: event.target.value },
                    }))}
                    placeholder="Share how the move went"
                  />
                </div>
                <button className="btn btn-primary btn-sm" disabled={submittingId === bookingId}>
                  {submittingId === bookingId ? 'Sending...' : 'Send feedback'}
                </button>
              </form>
            )}
          </article>
        );
      })}
    </div>
  );
}