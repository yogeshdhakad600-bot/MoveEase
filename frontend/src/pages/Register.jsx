import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get('role') === 'driver' ? 'driver' : 'customer');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', licenseNumber: '', licenseExpiryDate: '', yearsExperience: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = await register({ ...form, role });
      navigate(user.role === 'driver' ? '/driver' : user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <MainLayout>
      <section className="section wrap-narrow">
        <div className="panel">
          <h2 style={{ marginBottom: 18 }}>Create your {role} account</h2>
          <div className="login-roles">
            {[['customer', '👤', 'Customer'], ['driver', '🚚', 'Driver']].map(([value, icon, label]) => (
              <button type="button" key={value} className={`role-card ${role === value ? 'selected' : ''}`} onClick={() => setRole(value)}>
                <span>{icon}</span><b>{label}</b><small>{value === 'driver' ? 'Manage assigned moves' : 'Book & track moves'}</small>
              </button>
            ))}
          </div>
          {error && <p className="form-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="field"><label>Phone</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            {role === 'driver' && <>
              <div className="field"><label>Driver license number</label><input required value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} /></div>
              <div className="field"><label>License expiry date</label><input type="date" required value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} /></div>
              <div className="field"><label>Years of driving experience</label><input type="number" min="0" max="60" step="1" required value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} /></div>
            </>}
            <div className="field"><label>Password</label><input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <button className="btn btn-amber" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>Sign up</button>
          </form>
          <p style={{ marginTop: 16, fontSize: 14 }}>Already have an account? <Link to={`/login?role=${role}`}>Log in</Link></p>
        </div>
      </section>
    </MainLayout>
  );
}
