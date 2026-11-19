import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { getVehicles, getQuote } from '../services/bookingService';
import { getRouteDistance } from '../services/mapsService';

const PROPERTY_TYPES = ['1BHK', '2BHK', '3BHK', 'Villa', 'Office'];
const fallbackVehicles = [
  { _id: 'demo-mini', type: 'Mini Truck', baseFare: 3500, perKmRate: 18, capacityTons: .75 },
  { _id: 'demo-407', type: 'Tata 407', baseFare: 5500, perKmRate: 25, capacityTons: 2.5 },
  { _id: 'demo-14', type: '14 Ft Truck', baseFare: 8500, perKmRate: 35, capacityTons: 5 },
  { _id: 'demo-17', type: '17 Ft Truck', baseFare: 11000, perKmRate: 42, capacityTons: 7 },
];

export default function GetQuote() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ pickupAddress: '', deliveryAddress: '', movingDate: '', propertyType: '2BHK', vehicleId: '', distanceKm: 18, floors: 0, hasLift: false, packing: true, loadingUnloading: true, insurance: false });
  const [result, setResult] = useState(null);
  const [route, setRoute] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getVehicles().then((data) => { const list = data?.length ? data : fallbackVehicles; setVehicles(list); setForm(f => ({ ...f, vehicleId: list[1]?._id || list[0]?._id })); }).catch(() => { setVehicles(fallbackVehicles); setForm(f => ({ ...f, vehicleId: fallbackVehicles[1]._id })); });
  }, []);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  async function calculateDistance() {
    if (!form.pickupAddress || !form.deliveryAddress) { setError('Enter both pickup and delivery addresses first.'); return; }
    setBusy(true); setError('');
    try {
      const data = await getRouteDistance(form.pickupAddress, form.deliveryAddress);
      setRoute(data); set('distanceKm', data.distanceKm);
    } catch (err) { setError(err.response?.data?.message || 'Could not calculate route. You can enter distance manually.'); }
    finally { setBusy(false); }
  }

  async function handleCalculate(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      let distance = Number(form.distanceKm);
      if (form.pickupAddress && form.deliveryAddress) {
        try { const r = await getRouteDistance(form.pickupAddress, form.deliveryAddress); setRoute(r); distance = r.distanceKm; } catch (_) { /* manual distance fallback */ }
      }
      if (!form.vehicleId) throw new Error('Please select a vehicle');
      const services = { packing: form.packing, loadingUnloading: form.loadingUnloading, insurance: form.insurance };
      const payload = { vehicleId: form.vehicleId, distanceKm: distance, floors: Number(form.floors), hasLift: form.hasLift, services };
      let data;
      try {
        data = await getQuote(payload);
      } catch (err) {
        if (err.response?.status !== 404 || err.response?.data?.message !== 'Vehicle not found') throw err;
        const refreshedVehicles = await getVehicles();
        if (!refreshedVehicles.length) throw err;
        const selectedType = vehicles.find((vehicle) => vehicle._id === form.vehicleId)?.type;
        const refreshedVehicle = refreshedVehicles.find((vehicle) => vehicle.type === selectedType) || refreshedVehicles[1] || refreshedVehicles[0];
        setVehicles(refreshedVehicles);
        set('vehicleId', refreshedVehicle._id);
        data = await getQuote({ ...payload, vehicleId: refreshedVehicle._id });
      }
      setResult(data); setForm(f => ({ ...f, distanceKm: distance }));
    } catch (err) {
      // Keep the quote experience useful even when the API is unavailable by calculating against the same demo tariff.
      const vehicle = vehicles.find(v => v._id === form.vehicleId);
      if (vehicle) {
        const distance = Number(form.distanceKm) || 18;
        const breakdown = { vehicleBaseFare: vehicle.baseFare, distanceCharge: Math.round(distance * vehicle.perKmRate), floorCharge: form.hasLift ? 0 : Number(form.floors) * 250, packing: form.packing ? 2500 : 0, loadingUnloading: form.loadingUnloading ? 1500 : 0, insurance: form.insurance ? 800 : 0 };
        setResult({ breakdown, total: Object.values(breakdown).reduce((a,b) => a+b, 0), demo: true });
        setError('Live API unavailable, so a demo quote is shown. Connect the backend to complete booking.');
      } else setError(err.message || 'Could not calculate quote');
    } finally { setBusy(false); }
  }

  function proceedToBooking() {
    const vehicle = vehicles.find(v => v._id === form.vehicleId);
    if (vehicle?._id?.startsWith('demo-')) { setError('Please start the backend and seed vehicles before creating a real booking.'); return; }
    navigate('/booking', { state: { quoteForm: form, quoteResult: result, vehicle } });
  }

  return <MainLayout><section className="quote-page-v2"><div className="wrap quote-layout-v2"><div className="quote-intro"><span className="eyebrow-v2">MOVE CALCULATOR</span><h1>Know your move<br /><span>before you book.</span></h1><p>Enter your route and services. MoveEase calculates an estimate using the selected vehicle and real road distance.</p><div className="quote-checks"><span>✓ Road distance</span><span>✓ Transparent breakup</span><span>✓ No hidden steps</span></div></div>
    <div className="quote-panel-v2"><div className="quote-progress"><span className="active">01 <b>Route</b></span><i /><span>02 <b>Services</b></span><i /><span>03 <b>Estimate</b></span></div>
      {error && <p className="form-error">{error}</p>}
      <form onSubmit={handleCalculate}>
        <div className="grid2"><div className="field"><label>Pickup address</label><input placeholder="e.g. Malviya Nagar, Jaipur" value={form.pickupAddress} onChange={e => set('pickupAddress', e.target.value)} /></div><div className="field"><label>Delivery address</label><input placeholder="e.g. Dwarka, New Delhi" value={form.deliveryAddress} onChange={e => set('deliveryAddress', e.target.value)} /></div></div>
        <button type="button" className="route-btn" onClick={calculateDistance} disabled={busy}>⌖ {busy ? 'Calculating route…' : 'Calculate road distance'}</button>
        {route && <div className="route-result"><span>↗ {route.distanceKm} km road distance</span><span>≈ {route.durationMinutes} min drive</span></div>}
        <div className="grid2"><div className="field"><label>Moving date</label><input type="date" min={new Date().toISOString().slice(0,10)} value={form.movingDate} onChange={e => set('movingDate', e.target.value)} /></div><div className="field"><label>Property type</label><select value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>{PROPERTY_TYPES.map(p => <option key={p}>{p}</option>)}</select></div><div className="field"><label>Vehicle</label><select value={form.vehicleId} onChange={e => set('vehicleId', e.target.value)}>{vehicles.map(v => <option key={v._id} value={v._id}>{v.type} · {v.capacityTons}T</option>)}</select></div><div className="field"><label>Floors without lift</label><input type="number" min="0" value={form.floors} onChange={e => set('floors', e.target.value)} /></div></div>
        <div className="option-grid"><label className={`option-card ${form.packing ? 'selected' : ''}`}><input type="checkbox" checked={form.packing} onChange={e => set('packing', e.target.checked)} /><span>📦</span><b>Packing</b><small>₹2,500</small></label><label className={`option-card ${form.loadingUnloading ? 'selected' : ''}`}><input type="checkbox" checked={form.loadingUnloading} onChange={e => set('loadingUnloading', e.target.checked)} /><span>💪</span><b>Loading crew</b><small>₹1,500</small></label><label className={`option-card ${form.insurance ? 'selected' : ''}`}><input type="checkbox" checked={form.insurance} onChange={e => set('insurance', e.target.checked)} /><span>🛡️</span><b>Insurance</b><small>₹800</small></label><label className={`option-card ${form.hasLift ? 'selected' : ''}`}><input type="checkbox" checked={form.hasLift} onChange={e => set('hasLift', e.target.checked)} /><span>🛗</span><b>Lift available</b><small>No floor fee</small></label></div>
        <button className="btn btn-primary quote-submit" disabled={busy}>{busy ? 'Working…' : 'Calculate my estimate →'}</button>
      </form>
      {result && <div className="quote-result-v2"><div><span className="eyebrow-v2">ESTIMATED TOTAL</span><strong>₹{result.total.toLocaleString('en-IN')}</strong><small>{result.demo ? 'Demo calculation' : `${form.distanceKm} km route`}</small></div><div className="breakdown-v2">{Object.entries(result.breakdown).map(([k,v]) => <div key={k}><span>{k.replace(/([A-Z])/g, ' $1')}</span><b>₹{v.toLocaleString('en-IN')}</b></div>)}</div><button className="btn btn-dark" onClick={proceedToBooking}>Continue to booking →</button></div>}
    </div></div></section></MainLayout>;
}
