import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BagIcon, CheckIcon, ShieldIcon } from '../components/Icons';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside auth-aside-warm">
          <Link to="/" className="auth-brand">
            <span className="brand-mark">
              <BagIcon size={17} strokeWidth={2} />
            </span>
            <span className="brand-word">shopnet<span className="brand-dot">.</span></span>
          </Link>
          <div className="auth-aside-copy">
            <span className="eyebrow eyebrow-light">Join ShopNet</span>
            <h1>A better everyday<br /><em>starts here.</em></h1>
            <p>Create an account for a calmer, more considered way to shop the things you actually use.</p>
          </div>
          <ul className="auth-points">
            <li><CheckIcon size={16} /> One account, every order</li>
            <li><CheckIcon size={16} /> Save your delivery details</li>
            <li><CheckIcon size={16} /> Shop the edit, your way</li>
          </ul>
          <p className="auth-secure"><ShieldIcon size={16} /> Protected account access</p>
        </aside>

        <div className="auth-panel">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-header">
              <span className="eyebrow">New account</span>
              <h2>Create account</h2>
              <p>Already have one? <Link to="/login">Sign in</Link></p>
            </div>

            {error && <div className="alert">{error}</div>}

            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                autoComplete="name"
                required
              />
            </label>

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

            <div className="field-row">
              <label className="field">
                <span>Phone <small>optional</small></span>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  autoComplete="tel"
                />
              </label>

              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  placeholder="6+ characters"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="auth-terms">
              By creating an account you agree to our terms and privacy policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
