import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

export default function NotFound() {
  return (
    <MainLayout>
      <section className="section wrap-narrow" style={{ textAlign: 'center' }}>
        <h2>Page not found</h2>
        <p className="muted" style={{ margin: '10px 0 20px' }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-amber">Back to home</Link>
      </section>
    </MainLayout>
  );
}
