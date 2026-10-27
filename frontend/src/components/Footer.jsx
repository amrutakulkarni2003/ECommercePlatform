import { Link } from 'react-router-dom';
import { BagIcon, ShieldIcon, TruckIcon } from './Icons';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="brand-mark">
              <BagIcon size={17} strokeWidth={2} />
            </span>
            <span className="brand-word">shopnet<span className="brand-dot">.</span></span>
          </Link>
          <p>Curated everyday essentials, with an emphasis on quality and considered design.</p>
          <div className="footer-promises">
            <span><TruckIcon size={16} /> Free delivery</span>
            <span><ShieldIcon size={16} /> Secure checkout</span>
          </div>
        </div>

        <div className="footer-column">
          <h4>Shop</h4>
          <Link to="/">All products</Link>
          <a href="/#categories">Collections</a>
          <Link to="/cart">Your cart</Link>
        </div>

        <div className="footer-column">
          <h4>Account</h4>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create account</Link>
          <Link to="/orders">Order history</Link>
        </div>

        <div className="footer-column">
          <h4>Help</h4>
          <a href="/#why-shopnet">Delivery & returns</a>
          <a href="/#why-shopnet">Our promise</a>
          <a href="mailto:hello@shopnet.example">Contact us</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {CURRENT_YEAR} ShopNet. Built with care.</p>
        <p>Secure payments · Easy returns · Real support</p>
      </div>
    </footer>
  );
}
