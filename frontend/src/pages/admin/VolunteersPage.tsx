import React, { useMemo, useState } from 'react';
import { UserPlus, Users, CheckCircle2 } from 'lucide-react';
import { VOLUNTEER_SKILLS } from '../../constants/rahat';
import { useRahatStore } from '../../store/useRahatStore';

const VolunteersPage: React.FC = () => {
  const volunteers = useRahatStore((s) => s.volunteers);
  const createVolunteerProfile = useRahatStore((s) => s.createVolunteerProfile);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['First Aid']);
  const [formKey, setFormKey] = useState(0);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = createVolunteerProfile({ name: String(data.get('name')), email: String(data.get('email')), phone: String(data.get('phone')), skills: selectedSkills as typeof VOLUNTEER_SKILLS[number][], vehicle: String(data.get('vehicle')) as NonNullable<ReturnType<typeof useRahatStore.getState>['volunteers'][number]['vehicle']> });
    setError(result.error || '');
    if (result.ok) { setNotice('Volunteer profile created. They can sign in with the new email.'); setSelectedSkills(['First Aid']); setFormKey((key) => key + 1); }
  };

  const skillOptions = useMemo(() => VOLUNTEER_SKILLS, []);
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Operations</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Volunteer profiles</h1><p className="mt-1 text-sm text-slate-500">Create responders, review availability, and launch assignments.</p></div>
    {notice && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 className="w-4 h-4" />{notice}</div>}{error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]"><form key={formKey} onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><UserPlus className="w-5 h-5 text-blue-600" /><div><h2 className="font-semibold text-slate-900">Create volunteer</h2><p className="text-xs text-slate-500">A linked sign-in profile is created automatically.</p></div></div><Field label="Full name" name="name" required /><Field label="Email" name="email" type="email" required /><Field label="Phone" name="phone" required /><label className="block text-sm font-medium text-slate-700">Vehicle<select name="vehicle" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"><option>None</option><option>Motorcycle</option><option>Car</option><option>Truck</option><option>Boat</option></select></label><div><p className="text-sm font-medium text-slate-700 mb-2">Skills</p><div className="grid grid-cols-2 gap-2">{skillOptions.map((skill) => <label key={skill} className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={selectedSkills.includes(skill)} onChange={() => setSelectedSkills((current) => current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill])} />{skill}</label>)}</div></div><button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><UserPlus className="w-4 h-4" />Create profile</button></form><section className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-3 border-b border-slate-100 pb-4"><Users className="w-5 h-5 text-blue-600" /><div><h2 className="font-semibold text-slate-900">Registered volunteers</h2><p className="text-xs text-slate-500">{volunteers.length} responder profiles</p></div></div><div className="mt-4 grid gap-3 md:grid-cols-2">{volunteers.map((volunteer) => <article key={volunteer.id} className="rounded-lg border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{volunteer.name}</h3><p className="text-xs text-slate-500">{volunteer.phone}</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{volunteer.availability}</span></div><p className="mt-3 text-xs text-slate-600">{volunteer.skills.join(' • ')}</p><p className="mt-2 text-xs text-slate-500">{volunteer.currentAssignmentIds.length} active · {volunteer.completedMissions} completed</p></article>)}</div></section></div></div>;
};

const Field: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => <label className="block text-sm font-medium text-slate-700">{label}<input {...props} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>;
export default VolunteersPage;
