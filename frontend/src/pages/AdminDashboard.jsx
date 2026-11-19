import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Toast from '../components/Toast';
import AdminSupportPanel from '../components/AdminSupportPanel';
import ConfirmDialog from '../components/ConfirmDialog';
import DashboardLayout from '../layouts/DashboardLayout';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { getStats, listAllBookings, deleteBooking, assignDriver, unassignDriver, listUsers, deleteUser, listVehicles, updateShipmentStatus, listReviews } from '../services/adminService';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'customers', label: 'Customers' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'support', label: 'Support' },
  { key: 'drivers', label: 'Drivers' },
  { key: 'vehicles', label: 'Vehicles' },
];

function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [assign, setAssign] = useState({});
  const [toast, setToast] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [deletingBookingId, setDeletingBookingId] = useState('');

  const refreshBookings = () => listAllBookings().then(setBookings).catch(() => {});
  function refreshCurrentTab() {
    if (tab === 'overview') {
      getStats().then(setStats).catch(() => {});
      listUsers('customer').then(setCustomers).catch(() => {});
      listReviews().then(setReviews).catch(() => {});
    }
    if (tab === 'bookings') {
      refreshBookings();
      listUsers('driver').then(setDrivers).catch(() => {});
      listVehicles().then(setVehicles).catch(() => {});
    }
    if (tab === 'customers') listUsers('customer').then(setCustomers).catch(() => {});
    if (tab === 'feedback') listReviews().then(setReviews).catch(() => {});
    if (tab === 'drivers') listUsers('driver').then(setDrivers).catch(() => {});
    if (tab === 'vehicles') listVehicles().then(setVehicles).catch(() => {});
  }
  const showToast = (message, type = 'success') => setToast({ message, type });
  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);
  useEffect(() => { refreshCurrentTab(); }, [tab]);
  useAutoRefresh(refreshCurrentTab);

  async function handleStatus(bookingId, status) {
    try { await updateShipmentStatus(bookingId, { status }); refreshBookings(); }
    catch (err) { showToast(err.response?.data?.message || 'Could not update shipment status.', 'error'); }
  }
  async function handleAssign(bookingId) {
    const { driverId, vehicleId } = assign[bookingId] || {};
    if (!driverId) return showToast('Select a driver first.', 'error');
    if (!vehicleId) return showToast('Select a vehicle first.', 'error');
    try {
      const updatedBooking = await assignDriver(bookingId, { driverId, vehicleId });
      await refreshBookings();
      showToast(updatedBooking.status === 'Packing' ? 'Driver assigned. Shipment moved to Packing.' : 'Driver assigned successfully.');
    } catch (err) { showToast(err.response?.data?.message || 'Could not assign driver.', 'error'); }
  }
  async function handleUnassign(bookingId) {
    try {
      await unassignDriver(bookingId);
      setAssign((current) => {
        const next = { ...current };
        delete next[bookingId];
        return next;
      });
      await Promise.all([refreshBookings(), listVehicles().then(setVehicles)]);
      showToast('Driver and vehicle unassigned.');
    } catch (err) { showToast(err.response?.data?.message || 'Could not remove assignment.', 'error'); }
  }
  async function confirmDeleteBooking() {
    if (!bookingToDelete) return;
    const bookingId = bookingToDelete.bookingId;
    setDeletingBookingId(bookingId);
    try {
      await deleteBooking(bookingId);
      setBookings((current) => current.filter((booking) => booking.bookingId !== bookingId));
      setBookingToDelete(null);
      getStats().then(setStats).catch(() => {});
      listVehicles().then(setVehicles).catch(() => {});
      listUsers('driver').then(setDrivers).catch(() => {});
      showToast(`Booking ${bookingId} and related records deleted.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete booking.', 'error');
    } finally {
      setDeletingBookingId('');
      setBookingToDelete(null);
    }
  }
  function handleDeleteUser(account, role) {
    setUserToDelete({ account, role });
  }
  async function confirmDeleteUser() {
    if (!userToDelete) return;
    const { account, role } = userToDelete;
    setDeletingUserId(account._id);
    try {
      await deleteUser(account._id);
      if (role === 'customer') setCustomers((current) => current.filter((customer) => customer._id !== account._id));
      else setDrivers((current) => current.filter((driver) => driver._id !== account._id));
      setStats(await getStats());
      showToast(`${role === 'customer' ? 'Customer' : 'Driver'} deleted successfully.`);
    } catch (err) {
      showToast(err.response?.data?.message || `Could not delete ${role}.`, 'error');
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  }

  return (
    <>
    <DashboardLayout title="Admin Dashboard" tabs={TABS} activeTab={tab} onTabChange={setTab}>
      {tab === 'overview' && stats && <div>
        <div className="stats"><div className="stat"><b>{stats.customers}</b><span>Customers</span></div><div className="stat"><b>{stats.drivers}</b><span>Drivers</span></div><div className="stat"><b>{stats.bookings}</b><span>Total bookings</span></div><div className="stat"><b>₹{stats.revenue.toLocaleString('en-IN')}</b><span>Revenue</span></div></div>
        <div className="admin-highlight-grid"><div className="panel"><h3>Recent customers</h3>{customers.slice(0,5).map(c => <div className="admin-list-row" key={c._id}><div><b>{c.name}</b><small>{c.email}</small></div><span>{c.phone}</span></div>)}</div><div className="panel"><h3>Latest feedback</h3>{reviews.slice(0,4).map(r => <div className="feedback-row" key={r._id}><div><b>{r.author?.name || r.customer?.name || 'Customer'} · {(r.authorRole || 'customer') === 'driver' ? 'Driver' : 'Customer'}</b><span>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span></div><p>{r.comment}</p></div>)}{!reviews.length && <p className="muted">No customer or driver feedback yet.</p>}</div></div>
      </div>}

      {tab === 'customers' && <div className="panel-table"><div className="table-heading"><div><h3>Customer details</h3><p>Customer accounts and contact information.</p></div></div><table className="dash-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer._id}><td><b>{customer.name}</b></td><td>{customer.email}</td><td>{customer.phone}</td><td>{new Date(customer.createdAt).toLocaleDateString()}</td><td><button className="btn btn-delete btn-sm" disabled={Boolean(deletingUserId)} onClick={() => handleDeleteUser(customer, 'customer')}>{deletingUserId === customer._id ? 'Deleting...' : 'Delete'}</button></td></tr>)}</tbody></table></div>}

      {tab === 'feedback' && <div className="feedback-grid">{reviews.map(r => <article className="panel feedback-card" key={r._id}><div className="feedback-top"><div><b>{r.author?.name || r.customer?.name || 'Customer'}</b><small>{(r.authorRole || 'customer') === 'driver' ? 'Driver' : 'Customer'}{r.booking?.bookingId ? ` · ${r.booking.bookingId}` : ''} · {new Date(r.createdAt).toLocaleDateString()}</small></div><strong>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</strong></div><p>“{r.comment}”</p></article>)}{!reviews.length && <div className="panel"><p className="muted">No customer or driver feedback submitted yet.</p></div>}</div>}
      {tab === 'support' && <AdminSupportPanel onNotify={showToast} />}
      {tab === 'bookings' && <div className="panel-table"><table className="dash-table"><thead><tr><th>Booking ID</th><th>Customer details</th><th>Route</th><th>Truck required</th><th>Status</th><th>Shipment status</th><th>Current assignment</th><th>Assignment actions</th></tr></thead><tbody>{bookings.map((b) => <tr key={b._id}><td className="mono">{b.bookingId}</td><td><b>{b.customer?.name || '—'}</b><small className="table-sub">{b.customer?.email || '—'}<br/>{b.customer?.phone || '—'}</small></td><td>{b.pickupAddress} → {b.deliveryAddress}</td><td><div className="truck-request"><small>Customer requested</small><strong>{b.requestedVehicle?.type || b.vehicle?.type || 'Not recorded'}</strong><span>{b.requestedVehicle?.capacityTons ? `${b.requestedVehicle.capacityTons} ton capacity` : b.vehicle?.capacityTons ? `${b.vehicle.capacityTons} ton capacity` : 'Truck preference'}</span></div></td><td><span className="status-badge">{b.status}</span></td><td><select value={b.status} onChange={(e) => handleStatus(b.bookingId, e.target.value)}>{['Booking Confirmed','Packing','Picked Up','In Transit','Out for Delivery','Delivered','Cancelled'].map(s => <option key={s}>{s}</option>)}</select></td><td><b>{b.driver?.name || 'Unassigned'}</b><small className="table-sub">{b.vehicle ? `${b.vehicle.type}${b.vehicle.registrationNumber ? ` · ${b.vehicle.registrationNumber}` : ''}` : 'No vehicle assigned'}</small>{b.status === 'Delivered' ? <span className="status-badge driver-assigned" style={{marginTop:6}}>Completed</span> : b.status === 'Cancelled' ? <span className="status-badge booking-cancelled" style={{marginTop:6}}>Cancelled</span> : (b.driver || b.vehicle) && <button className={`btn btn-ghost-dark btn-sm${b.status === 'Out for Delivery' ? ' deassign-disabled' : ''}`} style={{marginTop:6}} disabled={b.status === 'Out for Delivery'} title={b.status === 'Out for Delivery' ? 'Cannot deassign after a booking is out for delivery' : undefined} onClick={()=>handleUnassign(b.bookingId)}>Deassign</button>}</td><td>{!['Delivered', 'Cancelled'].includes(b.status) && !(b.driver && b.vehicle) && <><select value={assign[b.bookingId]?.driverId || ''} onChange={(e) => setAssign({...assign,[b.bookingId]:{...assign[b.bookingId],driverId:e.target.value}})}><option value="" disabled>Select driver</option>{drivers.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}</select><select style={{marginTop:6}} value={assign[b.bookingId]?.vehicleId || ''} onChange={(e)=>setAssign({...assign,[b.bookingId]:{...assign[b.bookingId],vehicleId:e.target.value}})}><option value="" disabled>Select vehicle</option>{vehicles.map(v=><option key={v._id} value={v._id}>{v.type} · {v.status}</option>)}</select><button className="btn btn-ink btn-sm" style={{marginTop:6}} onClick={()=>handleAssign(b.bookingId)}>Assign</button></>}<button className="btn btn-delete btn-sm booking-delete-button" disabled={Boolean(deletingBookingId)} onClick={() => setBookingToDelete(b)}>{deletingBookingId === b.bookingId ? 'Deleting...' : 'Delete booking'}</button></td></tr>)}</tbody></table>{!bookings.length && <p className="empty-state">No bookings yet.</p>}</div>}

      {tab === 'drivers' && <div className="panel-table"><table className="dash-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>License</th><th>License expires</th><th>Experience</th><th>Assignment</th><th>Actions</th></tr></thead><tbody>{drivers.map((driver) => <tr key={driver._id}><td>{driver.name}</td><td>{driver.email}</td><td>{driver.phone}</td><td>{driver.licenseNumber || '—'}</td><td>{driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate).toLocaleDateString() : '—'}</td><td>{driver.yearsExperience ?? '—'}{driver.yearsExperience === 1 ? ' year' : driver.yearsExperience != null ? ' years' : ''}</td><td><span className={`status-badge ${driver.assignedBookings?.length ? 'driver-assigned' : 'driver-available'}`}>{driver.assignedBookings?.length ? `Assigned (${driver.assignedBookings.length})` : 'Not assigned'}</span>{driver.assignedBookings?.length > 0 && <small className="table-sub">{driver.assignedBookings.slice(0, 2).join(', ')}{driver.assignedBookings.length > 2 ? ` +${driver.assignedBookings.length - 2} more` : ''}</small>}</td><td><button className="btn btn-delete btn-sm" disabled={Boolean(deletingUserId)} onClick={() => handleDeleteUser(driver, 'driver')}>{deletingUserId === driver._id ? 'Deleting...' : 'Delete'}</button></td></tr>)}</tbody></table></div>}
      {tab === 'vehicles' && <div className="panel-table"><table className="dash-table"><thead><tr><th>Type</th><th>Base fare</th><th>Per km</th><th>Status</th></tr></thead><tbody>{vehicles.map(v=><tr key={v._id}><td>{v.type}</td><td>₹{v.baseFare}</td><td>₹{v.perKmRate}</td><td><span className="status-badge">{v.status}</span></td></tr>)}</tbody></table></div>}
    </DashboardLayout>
    <Toast message={toast?.message} type={toast?.type} onDismiss={() => setToast(null)} />
    <ConfirmDialog
      open={Boolean(userToDelete)}
      title={`Delete this ${userToDelete?.role || 'account'}?`}
      message={userToDelete?.role === 'customer'
        ? `This removes ${userToDelete.account.name}, their bookings, payments, reviews, support tickets, and tracking history. This cannot be undone.`
        : userToDelete ? `This removes ${userToDelete.account.name}. Customer bookings remain, but driver assignments are removed. This cannot be undone.` : ''}
      confirmLabel={`Delete ${userToDelete?.role || 'account'}`}
      busy={Boolean(deletingUserId)}
      onConfirm={confirmDeleteUser}
      onCancel={() => setUserToDelete(null)}
    />
    <ConfirmDialog
      open={Boolean(bookingToDelete)}
      title="Delete this booking?"
      message={bookingToDelete ? `Booking ${bookingToDelete.bookingId}, its payment, feedback, tracking, and booking-linked support ticket records will be deleted. The customer account will remain. This cannot be undone.` : ''}
      confirmLabel="Delete booking"
      busy={Boolean(deletingBookingId)}
      onConfirm={confirmDeleteBooking}
      onCancel={() => setBookingToDelete(null)}
    />
    </>
  );
}
export default function AdminDashboard(){ return <ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>; }
