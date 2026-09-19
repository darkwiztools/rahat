import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Coordinator', email: 'admin@rahat.demo' },
  { label: 'Volunteer', email: 'volunteer@rahat.demo' },
  { label: 'Citizen', email: 'citizen@rahat.demo' },
];

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@rahat.demo');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <div className="min-h-screen grid place-items-center bg-slate-950 text-white">Loading RAHAT...</div>;
  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const destination = await login(email.trim(), password);
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      navigate(returnUrl || destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 text-white">
          <div className="flex items-center gap-3 mb-5"><div className="w-11 h-11 rounded-xl bg-blue-500 grid place-items-center"><Shield /></div><span className="font-bold tracking-[0.25em]">RAHAT</span></div>
          <h1 className="text-3xl font-bold">Response starts here.</h1>
          <p className="mt-2 text-slate-400">Sign in to coordinate relief, serve your community, or request help.</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          {error && <div className="flex gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5" />{error}</div>}
          <label className="block text-sm font-medium text-slate-700">Email<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="block text-sm font-medium text-slate-700">Password<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button disabled={submitting} className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{submitting ? 'Signing in...' : 'Sign in'}<ArrowRight className="w-4 h-4" /></button>
          <div className="border-t pt-4"><p className="text-xs text-slate-500 mb-2">Demo access</p><div className="grid grid-cols-3 gap-2">{DEMO_ACCOUNTS.map((account) => <button type="button" key={account.email} onClick={() => setEmail(account.email)} className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium hover:bg-slate-50">{account.label}</button>)}</div></div>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
