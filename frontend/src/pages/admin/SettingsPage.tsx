import React, { useState } from 'react';
import { CheckCircle2, Database, Save, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRahatStore } from '../../store/useRahatStore';

const SettingsPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const updateUserProfile = useRahatStore((s) => s.updateUserProfile);
  const resetDemoData = useRahatStore((s) => s.resetDemoData);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;
    const result = updateUserProfile(currentUser.id, { name, phone });
    setError(result.error || '');
    setNotice(result.ok ? 'Profile updated successfully.' : '');
  };

  const reset = async () => {
    const confirmed = window.confirm('Reset all workspace data? This cannot be undone.');
    if (!confirmed) return;
    await resetDemoData();
    await logout();
  };

  return <div className="space-y-6">
    <div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Administration</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Manage your operator profile and local response workspace.</p></div>
    {notice && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="w-4 h-4" />{notice}</div>}
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4"><UserRound className="w-5 h-5 text-blue-600" /><div><h2 className="font-semibold text-slate-900">Operator profile</h2><p className="text-xs text-slate-500">Changes appear across the command center.</p></div></div>
        <label className="block text-sm font-medium text-slate-700">Display name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" required /></label>
        <label className="block text-sm font-medium text-slate-700">Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
        <label className="block text-sm font-medium text-slate-700">Email<input value={currentUser?.email || ''} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500" disabled /></label>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Save className="w-4 h-4" />Save profile</button>
      </form>
      <div className="space-y-6">
        <section className="rounded-xl border border-red-200 bg-red-50 p-6"><div className="flex items-center gap-3"><Database className="w-5 h-5 text-red-600" /><div><h2 className="font-semibold text-red-900">Workspace reset</h2><p className="text-xs text-red-700">Clear requests, volunteers, resources, and notifications.</p></div></div><button type="button" onClick={reset} className="mt-5 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">Reset workspace</button></section>
      </div>
    </div>
  </div>;
};

export default SettingsPage;
