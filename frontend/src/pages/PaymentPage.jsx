import { useState } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { payForBooking } from '../services/bookingService';

const METHODS = ['UPI', 'Card', 'Net Banking', 'Cash'];

function PaymentForm() {
  const { state } = useLocation();
  const [method, setMethod] = useState('UPI');
  const [coupon, setCoupon] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  if (!state?.bookingId) return <Navigate to="/quote" replace />;

  async function handlePay() {
    setError('');
    try {
      const data = await payForBooking({ bookingId: state.bookingId, method, couponCode: coupon });
      setReceipt(data.receipt);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  }

  function downloadReceipt() {
    const text = `MoveEase Payment Receipt\nBooking ID: ${receipt.bookingId}\nTransaction: ${receipt.transactionRef}\nMethod: ${receipt.method}\nAmount Paid: INR ${receipt.amount}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${receipt.bookingId}-receipt.txt`; a.click(); URL.revokeObjectURL(url);
  }

  if (receipt) {
    return (
      <MainLayout>
        <section className="section wrap-narrow">
          <div className="receipt">
            <div className="eyebrow" style={{ color: '#7BC9A6' }}>PAYMENT SUCCESSFUL</div>
            <div className="bid mono">{receipt.bookingId}</div>
            <div className="rrow"><span>Payment method</span><span>{receipt.method}</span></div>
            <div className="rrow"><span>Transaction ref</span><span className="mono">{receipt.transactionRef}</span></div>
            <div className="rrow"><span>Amount paid</span><span>₹{receipt.amount.toLocaleString('en-IN')}</span></div>
            <div className="receipt-actions">
              <button className="btn btn-ghost" onClick={downloadReceipt}>Download receipt</button>
              <Link to="/track" className="btn btn-amber" onClick={() => sessionStorage.setItem('lastBookingId', receipt.bookingId)}>Track this shipment →</Link>
              <Link to="/" className="btn btn-ghost">Go to home</Link>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="section wrap-narrow">
        <div className="panel">
          <span className="badge">STEP 2 OF 2 · PAYMENT</span>
          <h2>Pay for booking <span className="mono">{state.bookingId}</span></h2>
          {error && <p className="form-error">{error}</p>}
          <div className="pay-opts">
            {METHODS.map((m) => (
              <div key={m} className={`pay-opt ${method === m ? 'sel' : ''}`} onClick={() => setMethod(m)}>{m}</div>
            ))}
          </div>
          <div className="field"><label>Coupon code</label><input placeholder="Try MOVE10" value={coupon} onChange={(e) => setCoupon(e.target.value)} /></div>
          <div className="qtotal" style={{ marginTop: 16 }}><span>Amount payable</span><span className="mono">₹{state.amount?.toLocaleString('en-IN')}</span></div>
          <button className="btn btn-amber" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={handlePay}>Pay now</button>
        </div>
      </section>
    </MainLayout>
  );
}

export default function PaymentPage() {
  return <ProtectedRoute roles={['customer']}><PaymentForm /></ProtectedRoute>;
}
