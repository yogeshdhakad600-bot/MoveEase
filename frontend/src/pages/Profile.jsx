import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', password: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function saveProfile(e) {
    e.preventDefault();
    try {
      setError('');
      const payload = { name: profile.name, phone: profile.phone };
      if (profile.password) payload.password = profile.password;
      await updateProfile(payload);
      setProfile((current) => ({ ...current, password: '' }));
      setNotice('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    }
  }

  return (
    <MainLayout>
      <section className="section wrap-narrow">
        <div className="panel">
          <h2 style={{ marginBottom: 18 }}>Profile settings</h2>
          {error && <p className="form-error">{error}</p>}
          {notice && <p className="success-message">{notice}</p>}
          <form onSubmit={saveProfile}>
            <div className="field"><label>Name</label><input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
            <div className="field"><label>Email</label><input value={user?.email || ''} disabled /></div>
            <div className="field"><label>Phone</label><input required value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
            <div className="field"><label>New password (optional)</label><input type="password" minLength="6" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} /></div>
            <button className="btn btn-amber">Save profile</button>
          </form>
          <button type="button" className="btn btn-logout" style={{ marginTop: 16 }} onClick={() => { logout(); navigate('/'); }}>Logout</button>
        </div>
      </section>
    </MainLayout>
  );
}

export default function Profile() {
  return <ProtectedRoute roles={['customer']}><ProfilePage /></ProtectedRoute>;
}