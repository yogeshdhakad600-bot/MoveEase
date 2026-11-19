import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { createBooking } from '../services/bookingService';

function BookingForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ pickupAddress: state?.quoteForm?.pickupAddress || '', deliveryAddress: state?.quoteForm?.deliveryAddress || '', movingDate: state?.quoteForm?.movingDate || '' });
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  if (!state?.quoteForm || !state?.vehicle) return <Navigate to="/quote" replace />;
  const { quoteForm, vehicle, quoteResult } = state;
  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const services = { packing: quoteForm.packing, loadingUnloading: quoteForm.loadingUnloading, insurance: quoteForm.insurance };
      const booking = await createBooking({ vehicleId: vehicle._id, pickupAddress: form.pickupAddress, deliveryAddress: form.deliveryAddress, movingDate: form.movingDate, propertyType: quoteForm.propertyType, floors: Number(quoteForm.floors), hasLift: quoteForm.hasLift, services, distanceKm: Number(quoteForm.distanceKm) });
      navigate('/payment', { state: { bookingId: booking.bookingId, amount: booking.estimatedCost } });
    } catch (err) { setError(err.response?.data?.message || 'Could not create booking. Make sure the backend and database are running.'); }
    finally { setBusy(false); }
  }
  return <MainLayout><section className="section wrap-narrow"><div className="panel booking-panel-v2"><span className="eyebrow-v2">BOOK YOUR MOVE</span><h2>One last step before payment.</h2><p className="muted" style={{margin:'8px 0 22px'}}>Review your route and confirm the pickup date.</p>{error && <p className="form-error">{error}</p>}<div className="booking-summary-v2"><div><small>VEHICLE</small><b>{vehicle.type}</b></div><div><small>PROPERTY</small><b>{quoteForm.propertyType}</b></div><div><small>ESTIMATE</small><b>₹{(quoteResult?.total || 0).toLocaleString('en-IN')}</b></div></div><form onSubmit={handleSubmit}><div className="field"><label>Pickup address</label><input required value={form.pickupAddress} onChange={e=>setForm({...form,pickupAddress:e.target.value})}/></div><div className="field"><label>Delivery address</label><input required value={form.deliveryAddress} onChange={e=>setForm({...form,deliveryAddress:e.target.value})}/></div><div className="field"><label>Moving date</label><input type="date" min={new Date().toISOString().slice(0,10)} required value={form.movingDate} onChange={e=>setForm({...form,movingDate:e.target.value})}/></div><button className="btn btn-primary" disabled={busy}>{busy?'Creating booking…':'Confirm booking →'}</button></form></div></section></MainLayout>;
}
export default function BookingPage(){return <ProtectedRoute roles={['customer']}><BookingForm/></ProtectedRoute>}
