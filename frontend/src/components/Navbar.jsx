import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const dashboard = user?.role === 'admin' ? '/admin' : user?.role === 'driver' ? '/driver' : '/dashboard';
  const profileInitials = user?.name?.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'U';
  const close = () => setOpen(false);
  const goHome = () => {
    close();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="navbar-v2">
      <nav className="nav-inner-v2 wrap">
        <Link to="/" className="brand" onClick={goHome}><span className="brand-icon">M</span><span>Move<span>Ease</span></span></Link>
        <div className="nav-links-v2">
          <Link to="/" onClick={goHome}>Home</Link><Link to="/#services">Services</Link><Link to="/#how">How it works</Link><Link to="/track">Track</Link>
        </div>
        <div className="nav-actions-v2">
          {user ? <><Link to={dashboard} className="nav-dashboard">Dashboard</Link>{user.role === 'customer' && <Link to="/profile" className="nav-profile" aria-label="Profile" title="Profile"><span className="nav-profile-avatar" aria-hidden="true">{profileInitials}</span></Link>}</> : <><Link to="/login" className="nav-login">Login</Link><Link to="/quote" className="btn btn-primary btn-sm">Get Quote</Link></>}
        </div>
        <button className="menu-btn-v2" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation">{open ? '×' : '☰'}</button>
      </nav>
      {open && <div id="mobile-navigation" className="mobile-nav-v2 wrap"><Link to="/" onClick={goHome}>Home</Link><Link to="/#services" onClick={close}>Services</Link><Link to="/#how" onClick={close}>How it works</Link><Link to="/track" onClick={close}>Track shipment</Link>{user && <Link to={dashboard} onClick={close}>Dashboard</Link>}{user?.role === 'customer' && <Link to="/profile" className="mobile-profile-link" onClick={close}><span className="nav-profile-avatar" aria-hidden="true">{profileInitials}</span><span>Profile</span></Link>}{!user && <><Link to="/login" onClick={close}>Login</Link><Link to="/quote" onClick={close}>Get a quote</Link></>}</div>}
    </header>
  );
}
