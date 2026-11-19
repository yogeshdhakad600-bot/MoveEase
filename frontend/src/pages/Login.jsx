import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

export default function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '', role: searchParams.get('role') === 'driver' ? 'driver' : 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password, form.role);
      if (form.role !== user.role && !(user.role === 'admin' && form.role === 'customer')) { logout(); setError(`This account is a ${user.role} account. Please select ${user.role} login.`); setLoading(false); return; }
      navigate(user.role === 'admin' ? '/admin' : user.role === 'driver' ? '/driver' : '/');
    } catch (err) { setError(err.response?.data?.message || 'Login failed. Check your email and password.'); }
    finally { setLoading(false); }
  }

  return (
    <MainLayout>
      <section className="section wrap-narrow login-page">
        <div className="panel login-panel">
          <div className="login-badge">MOVE SMARTER · MOVE EASIER</div>
          <h2>Welcome back</h2>
          <p className="muted">Choose your account type to continue.</p>
          <div className="login-roles">
            {[['customer','👤','Customer'],['driver','🚚','Driver']].map(([value,icon,label]) => (
              <button type="button" key={value} className={`role-card ${form.role===value?'selected':''}`} onClick={() => setForm({...form, role:value})}>
                <span>{icon}</span><b>{label}</b><small>{value==='driver'?'Manage assigned moves':'Book & track moves'}</small>
              </button>
            ))}
          </div>
          {error && <p className="form-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={form.role==='driver'?'driver@moveease.com':'you@example.com'} /></div>
            <div className="field"><label>Password</label><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" /></div>
            <button disabled={loading} className="btn btn-amber login-submit">{loading ? 'Signing in…' : `Login as ${form.role}`}</button>
          </form>
          <p style={{ marginTop: 16, fontSize: 14 }}>New {form.role}? <Link to={`/register?role=${form.role}`}>Create an account</Link></p>
        </div>
      </section>
    </MainLayout>
  );
}
