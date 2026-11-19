import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-grid">
        <div>
          <div className="logo" style={{ color: '#fff', marginBottom: 10 }}><span className="logo-mark" />MoveEase</div>
          <p className="muted-light">Smart home relocation and transportation, from first quote to last box.</p>
        </div>
        <div>
          <h4>Company</h4>
          <a href="#">About</a><a href="#">Careers</a><a href="#">Contact</a>
        </div>
        <div>
          <h4>Services</h4>
          <a href="/#services">Household Shifting</a><a href="/#services">Office Relocation</a><a href="/#services">Storage</a>
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/track">Track shipment</Link><a href="/#faq">FAQ</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 MoveEase. All rights reserved.</span>
        <span>Made for households on the move.</span>
      </div>
    </footer>
  );
}
