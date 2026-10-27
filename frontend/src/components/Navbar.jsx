import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BagIcon, CartIcon, CloseIcon, LogoutIcon, MenuIcon, UserIcon } from './Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="announcement">
        <p>Free delivery on orders over ₹999</p>
        <span className="announcement-divider" aria-hidden="true" />
        <p>Thoughtfully picked. Fairly priced.</p>
      </div>

      <nav className="navbar" aria-label="Main navigation">
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <span className="brand-mark">
            <BagIcon size={17} strokeWidth={2} />
          </span>
          <span className="brand-word">
            shopnet<span className="brand-dot">.</span>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Shop</Link>
          <a href="/#categories" className="nav-link" onClick={closeMenu}>Collections</a>

          {user ? (
            <>
              <Link to="/orders" className="nav-link" onClick={closeMenu}>Orders</Link>
              {user.role === 'Admin' && (
                <Link to="/admin" className="nav-link" onClick={closeMenu}>Admin</Link>
              )}
              <Link to="/cart" className="cart-link" onClick={closeMenu} aria-label={`Cart with ${totalItems} items`}>
                <CartIcon size={19} />
                <span className="cart-link-label">Cart</span>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
              <div className="nav-account">
                <span className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="nav-user">{user.name?.split(' ')[0]}</span>
              </div>
              <button type="button" onClick={handleLogout} className="nav-logout">
                <LogoutIcon size={17} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link nav-login" onClick={closeMenu}>
                <UserIcon size={17} />
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary nav-cta" onClick={closeMenu}>
                Create account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
