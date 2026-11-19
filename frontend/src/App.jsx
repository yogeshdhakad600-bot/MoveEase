import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GetQuote from './pages/GetQuote';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import Tracking from './pages/Tracking';
import Profile from './pages/Profile';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import NotFound from './pages/NotFound';

function HomePageRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading…</div>;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'driver') return <Navigate to="/driver" replace />;
  return <Home />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePageRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/quote" element={<GetQuote />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/track" element={<Tracking />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<CustomerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/driver" element={<DriverDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
