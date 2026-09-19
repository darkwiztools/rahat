import React from 'react';
import { useLocation } from 'react-router-dom';
import { ClipboardList, MapPin, Package, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRahatStore } from '../../store/useRahatStore';

const PortalPage: React.FC<{ title: string }> = ({ title }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const requests = useRahatStore((s) => s.requests);
  const volunteers = useRahatStore((s) => s.volunteers);
  const resources = useRahatStore((s) => s.resources);
  const ownRequests = requests.filter((request) => request.citizenEmail === currentUser?.email);
  const isCitizen = currentUser?.role === 'citizen';
  const cards = isCitizen
    ? [{ label: 'My requests', value: ownRequests.length, icon: ClipboardList }, { label: 'Active requests', value: ownRequests.filter((r) => !['RESOLVED', 'CANCELLED'].includes(r.status)).length, icon: AlertTriangle }, { label: 'Nearest help point', value: 'Bettiah', icon: MapPin }]
    : [{ label: 'Open requests', value: requests.filter((r) => !['RESOLVED', 'CANCELLED'].includes(r.status)).length, icon: ClipboardList }, { label: 'Available volunteers', value: volunteers.filter((v) => v.availability === 'AVAILABLE').length, icon: Users }, { label: 'Resource lines', value: resources.length, icon: Package }];

  return <main className="min-h-screen bg-slate-50 p-5 sm:p-8"><div className="max-w-6xl mx-auto"><div className="flex items-end justify-between gap-4 mb-8"><div><p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">RAHAT / {location.pathname.split('/')[1]}</p><h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1><p className="mt-1 text-slate-500">Welcome back, {currentUser?.name}.</p></div></div><div className="grid gap-4 md:grid-cols-3">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="bg-white border border-slate-200 rounded-xl p-5"><Icon className="w-5 h-5 text-blue-600 mb-5" /><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold text-slate-900">{value}</p></div>)}</div><div className="mt-6 bg-white border border-slate-200 rounded-xl p-6"><h2 className="font-semibold text-slate-900">Next actions</h2><p className="mt-2 text-sm text-slate-500">This workspace is connected to the local demo data and ready for the next operational workflow.</p></div></div></main>;
};

export default PortalPage;
