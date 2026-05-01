import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/etharaapi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const form = { email, password };
      const response = await authApi.login(form);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setError(error?.response?.data?.message || 'We could not sign you in. Check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell grid place-items-center px-4 py-10 sm:px-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-200/80 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-12 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400 text-lg font-black text-slate-950">
              E
            </div>
            <h1 className="max-w-sm text-4xl font-bold leading-tight">Welcome back to your Ethara AI workspace.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
              Review your projects, manage team access, and keep work moving from one focused dashboard.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-bold">01</p>
              <p className="mt-1 text-slate-300">Secure login</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-bold">24h</p>
              <p className="mt-1 text-slate-300">Access</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-2xl font-bold">AI</p>
              <p className="mt-1 text-slate-300">Ready</p>
            </div>
          </div>
        </aside>

        <div className="px-6 py-8 sm:px-10 lg:px-12 lg:py-14">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Ethara AI</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="field-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="primary-button w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-cyan-700 hover:text-cyan-800">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
