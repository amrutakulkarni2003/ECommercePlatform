import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRightIcon,
  BagIcon,
  CardIcon,
  CheckIcon,
  ShieldIcon,
  SparkIcon,
  StarIcon,
  TruckIcon,
  UpiIcon,
} from '../components/Icons';

const DEMO_ACCOUNTS = [
  {
    label: 'Customer demo',
    email: 'john@test.com',
    password: 'John@123',
  },
  {
    label: 'Admin demo',
    email: 'admin@shop.com',
    password: 'Admin@123',
  },
];

const SHOWCASE = [
  {
    label: 'Noise-cancelling',
    name: 'Headphones',
    price: '₹1,999',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  },
  {
    label: 'Everyday run',
    name: 'Running shoes',
    price: '₹2,999',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
  },
  {
    label: 'Tea-time favourite',
    name: 'Dairy Milk',
    price: '₹45',
    image: '/products/dairy-milk.jpg',
  },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      navigate(data.role === 'Admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (account) => {
    setForm({ email: account.email, password: account.password });
    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside auth-aside-login">
          <Link to="/" className="auth-brand">
            <span className="brand-mark">
              <BagIcon size={17} strokeWidth={2} />
            </span>
            <span className="brand-word">shopnet<span className="brand-dot">.</span></span>
          </Link>

          <div className="auth-aside-copy">
            <span className="eyebrow eyebrow-light">
              <SparkIcon size={14} />
              The everyday edit
            </span>
            <h1>Everything you love,<br /><em>waiting for you.</em></h1>
            <p>Sign in to shop fresh drops, track every delivery, and pick up right where you left off.</p>
          </div>

          <div className="auth-showcase" aria-hidden="true">
            {SHOWCASE.map((item) => (
              <figure className="auth-showcase-card" key={item.name}>
                <img src={item.image} alt="" loading="lazy" />
                <figcaption>
                  <span>{item.label}</span>
                  <strong>{item.price}</strong>
                </figcaption>
              </figure>
            ))}
            <div className="auth-proof">
              <span className="auth-proof-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon key={index} size={10} />
                ))}
              </span>
              <strong>4.8 / 5</strong>
              <small>25,000+ happy shoppers</small>
            </div>
          </div>

          <div className="auth-perks">
            <span><TruckIcon size={15} /> Free delivery over ₹999</span>
            <span><ShieldIcon size={15} /> Secure payments</span>
            <span><CheckIcon size={15} /> Easy returns</span>
          </div>

          <div className="auth-pay-strip">
            <span>Pay with</span>
            <span className="auth-pay-badge"><UpiIcon size={14} /> UPI</span>
            <span className="auth-pay-badge"><CardIcon size={14} /> Cards</span>
            <span className="auth-pay-badge"><BagIcon size={14} /> Cash</span>
          </div>
        </aside>

        <div className="auth-panel">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-header">
              <span className="eyebrow">Member sign in</span>
              <h2>Welcome back</h2>
              <p>New to ShopNet? <Link to="/register">Create your account</Link></p>
            </div>

            {error && <div className="alert">{error}</div>}

            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              <span>Password</span>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRightIcon size={17} />}
            </button>

            <div className="auth-quick">
              <span>Quick demo access</span>
              <div className="auth-quick-grid">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    type="button"
                    key={account.email}
                    className="demo-chip"
                    onClick={() => fillDemoAccount(account)}
                  >
                    <strong>{account.label}</strong>
                    <small>{account.email}</small>
                  </button>
                ))}
              </div>
              <p>Tap a demo account to autofill the form.</p>
            </div>

            <div className="auth-divider"><span>or</span></div>

            <Link to="/" className="btn btn-outline btn-full">
              Continue browsing
              <ArrowRightIcon size={16} />
            </Link>

            <p className="auth-secure-note">
              <ShieldIcon size={14} />
              Protected by encrypted sign-in
            </p>

            <p className="auth-terms">
              By continuing you agree to ShopNet&apos;s demo terms and privacy policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
