import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardList, MapPin, Package, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EMERGENCY_TYPES, RESOURCE_CATEGORIES, SEVERITIES } from '../../constants/rahat';
import { useRahatStore } from '../../store/useRahatStore';
import type { EmergencyRequest, RequestStatus } from '../../types/rahat';

const terminalStatuses: RequestStatus[] = ['RESOLVED', 'CANCELLED'];
const nextStatuses: Partial<Record<RequestStatus, RequestStatus>> = {
  ASSIGNED: 'IN_PROGRESS', IN_PROGRESS: 'REACHED', REACHED: 'DELIVERED', DELIVERED: 'RESOLVED',
};
const statusClass: Record<RequestStatus, string> = {
  NEW: 'bg-blue-50 text-blue-700', UNDER_REVIEW: 'bg-indigo-50 text-indigo-700', ASSIGNED: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-orange-50 text-orange-700', REACHED: 'bg-cyan-50 text-cyan-700', DELIVERED: 'bg-emerald-50 text-emerald-700',
  RESOLVED: 'bg-slate-100 text-slate-600', CANCELLED: 'bg-red-50 text-red-700',
};

const PortalPage: React.FC<{ title: string }> = ({ title }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requests = useRahatStore((s) => s.requests);
  const volunteers = useRahatStore((s) => s.volunteers);
  const resources = useRahatStore((s) => s.resources);
  const createEmergencyRequest = useRahatStore((s) => s.createEmergencyRequest);
  const assignVolunteerToRequest = useRahatStore((s) => s.assignVolunteerToRequest);
  const updateRequestStatus = useRahatStore((s) => s.updateRequestStatus);
  const [notice, setNotice] = useState('');
  const isCitizen = currentUser?.role === 'citizen';
  const ownRequests = useMemo(() => requests.filter((request) => request.citizenEmail === currentUser?.email), [requests, currentUser?.email]);
  const currentVolunteer = volunteers.find((volunteer) => volunteer.name === currentUser?.name);
  const openRequests = requests.filter((request) => !terminalStatuses.includes(request.status) && !request.assignedVolunteerId);
  const assignedRequests = requests.filter((request) => request.assignedVolunteerId === currentVolunteer?.id);

  const submitRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const description = String(form.get('description') || '').trim();
    const selectedResources = RESOURCE_CATEGORIES.filter((resource) => form.getAll('requiredResources').includes(resource));
    if (description.length < 20 || selectedResources.length === 0) {
      setNotice('Add at least one resource and a description of 20 characters or more.');
      return;
    }
    const request = createEmergencyRequest({
      citizenEmail: currentUser?.email || '', citizenName: String(form.get('fullName')), citizenPhone: String(form.get('phone')),
      peopleAffected: Number(form.get('peopleAffected')), emergencyType: String(form.get('emergencyType')) as EmergencyRequest['emergencyType'],
      requiredResources: selectedResources, severity: String(form.get('severity')) as EmergencyRequest['severity'], description,
      location: { lat: Number(form.get('lat')), lng: Number(form.get('lng')), address: String(form.get('address')) },
      preferredContact: String(form.get('preferredContact')) as EmergencyRequest['preferredContact'],
      accessibilityRequirements: String(form.get('accessibilityRequirements') || '').trim() || undefined,
    });
    setNotice(`Request ${request.id} submitted. Coordinators have been notified.`);
    event.currentTarget.reset();
  };

  const claim = (request: EmergencyRequest) => {
    if (!currentVolunteer || !currentUser) return;
    const result = assignVolunteerToRequest(request.id, currentVolunteer.id, { actorId: currentUser.id, actorName: currentUser.name, role: 'volunteer' });
    setNotice(result.ok ? `Mission ${request.id} added to your assignments.` : result.error || 'Unable to claim mission.');
  };

  const advance = (request: EmergencyRequest) => {
    if (!currentUser || !nextStatuses[request.status]) return;
    const result = updateRequestStatus(request.id, nextStatuses[request.status]!, { actorId: currentUser.id, actorName: currentUser.name, role: 'volunteer' });
    setNotice(result.ok ? `${request.id} moved to ${nextStatuses[request.status]!.replace('_', ' ')}.` : result.error || 'Unable to update mission.');
  };

  return <main className="min-h-screen bg-slate-50 p-5 sm:p-8"><div className="max-w-6xl mx-auto">
    <div className="mb-8 flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">RAHAT / {location.pathname.split('/')[1]}</p><h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1><p className="mt-1 text-slate-500">Welcome back, {currentUser?.name}.</p></div><button type="button" onClick={async () => { await logout(); navigate('/login'); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Sign out</button></div>
    {notice && <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 className="w-4 h-4" />{notice}</div>}
    {isCitizen ? <CitizenView currentUser={currentUser} ownRequests={ownRequests} submitRequest={submitRequest} /> : <VolunteerView resourcesCount={resources.length} openRequests={openRequests} assignedRequests={assignedRequests} claim={claim} advance={advance} />}
  </div></main>;
};

const CitizenView: React.FC<{ currentUser: ReturnType<typeof useAuth>['currentUser']; ownRequests: EmergencyRequest[]; submitRequest: (event: React.FormEvent<HTMLFormElement>) => void }> = ({ currentUser, ownRequests, submitRequest }) => <>
  <form onSubmit={submitRequest} className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
    <div><h2 className="text-lg font-semibold text-slate-900">Request emergency assistance</h2><p className="text-sm text-slate-500 mt-1">Share the situation and your location so coordinators can dispatch help.</p></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" name="fullName" defaultValue={currentUser?.name} required /><Field label="Phone" name="phone" defaultValue={currentUser?.phone} required /><Field label="People affected" name="peopleAffected" type="number" min="1" defaultValue="1" required /><label className="text-sm font-medium text-slate-700">Emergency type<select name="emergencyType" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" defaultValue="Flood">{EMERGENCY_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label></div>
    <div><p className="text-sm font-medium text-slate-700 mb-2">What do you need?</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{RESOURCE_CATEGORIES.slice(0, 8).map((resource) => <label key={resource} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm text-slate-600"><input type="checkbox" name="requiredResources" value={resource} />{resource}</label>)}</div></div>
    <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700">Severity<select name="severity" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" defaultValue="HIGH">{SEVERITIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Preferred contact<select name="preferredContact" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"><option>Phone</option><option>SMS</option><option>WhatsApp</option><option>Email</option></select></label></div>
    <label className="block text-sm font-medium text-slate-700">Address<input name="address" required minLength={5} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" placeholder="Village, ward, landmark" /></label>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Latitude" name="lat" type="number" step="any" defaultValue="26.98" required /><Field label="Longitude" name="lng" type="number" step="any" defaultValue="84.5" required /></div>
    <label className="block text-sm font-medium text-slate-700">Describe the emergency<textarea name="description" required minLength={20} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" placeholder="Tell responders what is happening and what is most urgent." /></label>
    <label className="block text-sm font-medium text-slate-700">Accessibility or safety needs<input name="accessibilityRequirements" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
    <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">Submit request <ArrowRight className="w-4 h-4" /></button>
  </form>
  <RequestList title="My submitted requests" requests={ownRequests} empty="No requests submitted yet." />
</>;

const VolunteerView: React.FC<{ resourcesCount: number; openRequests: EmergencyRequest[]; assignedRequests: EmergencyRequest[]; claim: (request: EmergencyRequest) => void; advance: (request: EmergencyRequest) => void }> = ({ resourcesCount, openRequests, assignedRequests, claim, advance }) => <>
  <div className="grid gap-4 md:grid-cols-3 mb-6"><Metric label="Open missions" value={openRequests.length} icon={ClipboardList} /><Metric label="My assignments" value={assignedRequests.length} icon={Users} /><Metric label="Resource lines" value={resourcesCount} icon={Package} /></div>
  <section className="bg-white border border-slate-200 rounded-xl p-5"><h2 className="text-lg font-semibold text-slate-900">Available missions</h2><div className="mt-4 space-y-3">{openRequests.length === 0 ? <p className="text-sm text-slate-500">No unassigned missions right now.</p> : openRequests.map((request) => <Mission key={request.id} request={request}><button onClick={() => claim(request)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Claim mission</button></Mission>)}</div></section>
  <section className="mt-6 bg-white border border-slate-200 rounded-xl p-5"><h2 className="text-lg font-semibold text-slate-900">My active missions</h2><div className="mt-4 space-y-3">{assignedRequests.length === 0 ? <p className="text-sm text-slate-500">Claim a mission to see it here.</p> : assignedRequests.map((request) => <Mission key={request.id} request={request}>{nextStatuses[request.status] && <button onClick={() => advance(request)} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">Mark {nextStatuses[request.status]!.replace('_', ' ').toLowerCase()}</button>}</Mission>)}</div></section>
</>;
const RequestList: React.FC<{ title: string; requests: EmergencyRequest[]; empty: string }> = ({ title, requests, empty }) => <section className="mt-6 bg-white border border-slate-200 rounded-xl p-5"><h2 className="text-lg font-semibold text-slate-900">{title}</h2><div className="mt-4 space-y-3">{requests.length === 0 ? <p className="text-sm text-slate-500">{empty}</p> : requests.map((request) => <Mission key={request.id} request={request} />)}</div></section>;
const Mission: React.FC<{ request: EmergencyRequest; children?: React.ReactNode }> = ({ request, children }) => <article className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm font-bold text-slate-900">{request.id}</span><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass[request.status]}`}>{request.status.replace('_', ' ')}</span><span className="text-xs font-semibold text-slate-500">{request.severity}</span></div><p className="mt-1 font-medium text-slate-800">{request.emergencyType} for {request.peopleAffected} people</p><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="w-3.5 h-3.5" />{request.location.address}</p><p className="mt-1 text-sm text-slate-500 line-clamp-1">{request.description}</p></div>{children}</article>;
const Field: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => <label className="text-sm font-medium text-slate-700">{label}<input {...props} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>;
const Metric: React.FC<{ label: string; value: number; icon: React.ComponentType<{ className?: string }> }> = ({ label, value, icon: Icon }) => <div className="bg-white border border-slate-200 rounded-xl p-5"><Icon className="w-5 h-5 text-blue-600 mb-5" /><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold text-slate-900">{value}</p></div>;

export default PortalPage;
