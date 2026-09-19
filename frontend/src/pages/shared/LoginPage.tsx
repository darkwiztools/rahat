import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'citizen' | 'volunteer'>('citizen');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return <div className="min-h-screen grid place-items-center bg-slate-950 text-white">Loading RAHAT...</div>;
  if (isAuthenticated) return <Navigate to="/admin" replace />;
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const destination = mode === 'login' ? await login(form.email.trim(), form.password) : await signup({ ...form, role });
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      navigate(returnUrl || destination, { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to continue'); } finally { setSubmitting(false); }
  };
  return <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10"><section className="w-full max-w-md"><div className="mb-8 text-white"><div className="flex items-center gap-3 mb-5"><div className="w-11 h-11 rounded-xl bg-blue-500 grid place-items-center"><Shield /></div><span className="font-bold tracking-[0.25em]">RAHAT</span></div><h1 className="text-3xl font-bold">Relief response, connected.</h1><p className="mt-2 text-slate-400">Secure access for coordinators, volunteers, and citizens.</p></div><form onSubmit={submit} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">{error && <div className="flex gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"><AlertCircle className="w-4 h-4 mt-0.5" />{error}</div>}<div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => setMode('login')} className={`rounded-md py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Sign in</button><button type="button" onClick={() => setMode('signup')} className={`rounded-md py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}>Create account</button></div>{mode === 'signup' && <><div className="grid grid-cols-2 rounded-lg border border-slate-200 p-1"><button type="button" onClick={() => setRole('citizen')} className={`rounded-md py-2 text-xs font-semibold ${role === 'citizen' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}>Citizen</button><button type="button" onClick={() => setRole('volunteer')} className={`rounded-md py-2 text-xs font-semibold ${role === 'volunteer' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}>Volunteer</button></div><Field label="Full name" value={form.name} onChange={(value) => update('name', value)} required /><Field label="Phone" value={form.phone} onChange={(value) => update('phone', value)} /></>}<Field label="Email" type="email" value={form.email} onChange={(value) => update('email', value)} required /><Field label="Password" type="password" value={form.password} onChange={(value) => update('password', value)} required /><button disabled={submitting} className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight className="w-4 h-4" /></button>{mode === 'login' && <p className="text-xs text-slate-500">Coordinator access uses `admin@rahat.com`.</p>}</form></section></main>;
};
const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }> = ({ label, value, onChange, type = 'text', required }) => <label className="block text-sm font-medium text-slate-700">{label}<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>;
export default LoginPage;
