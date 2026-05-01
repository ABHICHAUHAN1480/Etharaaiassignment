import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/etharaapi';

const Signup = () => {
  const [name, setName] = useState('');
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
      const form = { name, email, password };
      const response = await authApi.signup(form);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (error) {
      console.error('Signup failed:', error);
      setError(error?.response?.data?.message || 'We could not create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell grid place-items-center px-4 py-10 sm:px-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-200/80 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="px-6 py-8 sm:px-10 lg:px-12 lg:py-14">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Ethara AI</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">Create account</h2>
            <p className="mt-2 text-sm text-slate-500">Set up your workspace access in a few seconds.</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="field-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-input"
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>
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
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
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
                placeholder="Choose a strong password"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="primary-button w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-700 hover:text-cyan-800">
              Sign in
            </Link>
          </p>
        </div>

        <aside className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-12 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400 text-lg font-black text-slate-950">
              E
            </div>
            <h1 className="max-w-sm text-4xl font-bold leading-tight">Build your project hub with a clean start.</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
              Join the workspace, see assigned projects, and collaborate with the right team members.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-5">
            <p className="text-sm font-semibold text-cyan-200">Workspace access</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Accounts are connected directly to your project permissions after signup.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Signup;
